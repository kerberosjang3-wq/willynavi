'use client';
import { useEffect, useRef, useState } from 'react';
import { GPSPosition } from '@/types';

export type TrafficLevel = 'smooth' | 'slow' | 'congested';

export interface TrafficState {
  level: TrafficLevel | null;
  avgSpeedKmh: number | null;
}

function speedToLevel(kmh: number): TrafficLevel {
  if (kmh > 50) return 'smooth';
  if (kmh > 20) return 'slow';
  return 'congested';
}

function congestionToLevel(cong: string): TrafficLevel {
  if (cong === '1') return 'smooth';
  if (cong === '2') return 'slow';
  return 'congested';
}

const POLL_MS = 20_000;

export function useTrafficInfo(position: GPSPosition | null): TrafficState {
  const posRef = useRef(position);
  posRef.current = position;

  const [state, setState] = useState<TrafficState>({ level: null, avgSpeedKmh: null });

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      const pos = posRef.current;
      if (!pos) return;
      const key = process.env.NEXT_PUBLIC_TMAP_API_KEY;
      if (!key) return;

      try {
        const params = new URLSearchParams({
          version: '1',
          lat:    String(pos.lat),
          lon:    String(pos.lng),
          radius: '3',
          unit:   'KM',
          appKey: key,
        });
        const res = await fetch(`https://apis.openapi.sk.com/tmap/traffic?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const raw = json?.resultData?.body?.items?.item;
        if (!raw) return;
        const items: Record<string, string>[] = Array.isArray(raw) ? raw : [raw];

        // 속도가 있으면 평균으로 혼잡도 계산
        const speeds = items
          .map(i => parseFloat(i.speed ?? '0'))
          .filter(s => s > 0);

        if (speeds.length > 0) {
          const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
          if (alive) setState({ level: speedToLevel(avg), avgSpeedKmh: Math.round(avg) });
          return;
        }

        // 속도 없으면 congestion 필드로 fallback
        const levels = items
          .filter(i => i.congestion)
          .map(i => congestionToLevel(i.congestion));
        if (levels.length > 0) {
          const worst = levels.includes('congested') ? 'congested'
                      : levels.includes('slow')      ? 'slow'
                      : 'smooth';
          if (alive) setState({ level: worst, avgSpeedKmh: null });
        }
      } catch {
        // silent — 다음 폴링에서 재시도
      }
    };

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
