'use client';
import { useEffect, useRef, useState } from 'react';
import { GPSPosition } from '@/types';
import { haversineDistance, bearing, computeDotProduct } from '@/utils/geo.utils';

// ── 타입 정의 ────────────────────────────────────────────────────────────────

export type CameraType =
  | 'school'         // 01 스쿨존
  | 'mobile'         // 02 이동식
  | 'section_start'  // 03 구간단속 시작
  | 'fixed'          // 05 고정식
  | 'signal'         // 06 신호위반
  | 'bus'            // 07 버스전용차선
  | 'multipurpose';  // 08 다목적

const TYPE_MAP: Record<string, CameraType> = {
  '01': 'school',
  '02': 'mobile',
  '03': 'section_start',
  '05': 'fixed',
  '06': 'signal',
  '07': 'bus',
  '08': 'multipurpose',
};

// API에서 받은 원시 데이터 (거리 미포함)
export interface SpeedCameraRaw {
  id: string;
  lat: number;
  lng: number;
  speedLimit: number; // km/h, 0 = 정보없음
  type: CameraType;
  typeName: string;
}

// 현재 위치 기준으로 거리가 계산된 카메라
export interface SpeedCamera extends SpeedCameraRaw {
  distanceM: number;
}

// ── 전방 여부 판단 (진행 방향 ±80° 이내) ─────────────────────────────────────

function isAhead(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  heading: number | null,
): boolean {
  if (heading === null) return true;
  const b = (bearing(from, to) + 360) % 360;
  // cos(80°) ≈ 0.17 — 80° 원뿔 이내
  return computeDotProduct(heading, b) > 0.17;
}

// ── 최근접 전방 카메라 계산 (position 변경마다 호출) ─────────────────────────

export function computeNearest(
  cameras: SpeedCameraRaw[],
  position: GPSPosition | null,
): SpeedCamera | null {
  if (!position || cameras.length === 0) return null;

  const from = { lat: position.lat, lng: position.lng };

  const candidates: SpeedCamera[] = cameras
    .filter(c => isAhead(from, { lat: c.lat, lng: c.lng }, position.heading))
    .map(c => ({
      ...c,
      distanceM: Math.round(haversineDistance(from, { lat: c.lat, lng: c.lng })),
    }))
    .filter(c => c.distanceM <= 2500)
    .sort((a, b) => a.distanceM - b.distanceM);

  return candidates[0] ?? null;
}

// ── T-map Safety API 폴링 훅 ──────────────────────────────────────────────────

export interface SpeedCameraFetchState {
  cameras: SpeedCameraRaw[];
  error: string | null;
}

const POLL_INTERVAL_MS = 10_000; // 10초 주기
const SEARCH_RADIUS_M  = 3_000;  // 3km 반경

// 구간단속 종료 마커(04)는 표시 불필요 — 이미 지나쳐서 진입한 상황
const SKIP_TYPES = new Set(['04']);

export function useSpeedCameras(position: GPSPosition | null): SpeedCameraFetchState {
  const posRef = useRef(position);
  posRef.current = position;

  const [state, setState] = useState<SpeedCameraFetchState>({ cameras: [], error: null });

  useEffect(() => {
    let alive = true;

    const fetchCameras = async () => {
      const pos = posRef.current;
      if (!pos) return;

      const key = process.env.NEXT_PUBLIC_TMAP_API_KEY;
      if (!key) return;

      try {
        const params = new URLSearchParams({
          version: '1',
          lat:     String(pos.lat),
          lon:     String(pos.lng),
          radius:  String(SEARCH_RADIUS_M),
          appKey:  key,
        });

        const res = await fetch(
          `https://apis.openapi.sk.com/tmap/safety/speed?${params}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // body 는 배열이거나 단일 객체일 수 있음
        const raw: Record<string, string>[] = (() => {
          const b = json?.resultData?.body;
          if (!b) return [];
          return Array.isArray(b) ? b : [b];
        })();

        const cameras: SpeedCameraRaw[] = raw
          .filter(c => c.safetyType && !SKIP_TYPES.has(c.safetyType))
          .map(c => ({
            id:         c.safetyId ?? String(Math.random()),
            lat:        parseFloat(c.lat ?? '0'),
            lng:        parseFloat(c.lon ?? '0'),
            speedLimit: parseInt(c.speedLimit ?? '0', 10),
            type:       TYPE_MAP[c.safetyType] ?? 'fixed',
            typeName:   c.safetyTypeName ?? '단속카메라',
          }))
          .filter(c => c.lat !== 0 && c.lng !== 0);

        if (alive) setState({ cameras, error: null });
      } catch (e) {
        if (alive) setState(s => ({ ...s, error: String(e) }));
      }
    };

    fetchCameras();
    const timer = setInterval(fetchCameras, POLL_INTERVAL_MS);
    return () => { alive = false; clearInterval(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
