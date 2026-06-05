'use client';
import { useEffect, useRef, useState } from 'react';
import { Coordinate, GPSPosition } from '@/types';
import { estimateHeading, haversineDistance } from '@/utils/geo.utils';

interface GeolocationState {
  position: GPSPosition | null;
  error: string | null;
  isWatching: boolean;
}

interface PrevSnapshot {
  coord: Coordinate;
  timestamp: number;
}

// GPS heading·speed 가 null 일 때 연속 좌표로 추정하는 위치 훅
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isWatching: false,
  });

  const prev = useRef<PrevSnapshot | null>(null);
  const watchId = useRef<number | null>(null);
  const lastValidSpeed = useRef<{ value: number; ts: number } | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Geolocation을 지원하지 않는 브라우저입니다.' }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 500,   // 0.5초 캐시 — 더 빠른 업데이트
    };

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, heading, speed, accuracy } = pos.coords;
        const curr: Coordinate = { lat, lng };
        const now = pos.timestamp;

        // ── heading 추정 ──────────────────────────────────────────────────────
        // 정지 시 브라우저는 null 대신 NaN을 반환하므로 명시적으로 null로 정규화
        let finalHeading: number | null =
          heading !== null && heading !== undefined && !isNaN(heading) ? heading : null;

        if (finalHeading === null && prev.current) {
          const d = Math.hypot(lat - prev.current.coord.lat, lng - prev.current.coord.lng);
          if (d > 0.00001) finalHeading = estimateHeading(prev.current.coord, curr);
        }

        // ── speed 추정 (coords.speed 가 null 인 iOS 등 대응) ─────────────────
        let finalSpeed: number | null =
          speed !== null && speed !== undefined ? speed : null;

        if (finalSpeed === null && prev.current) {
          const distM = haversineDistance(prev.current.coord, curr);
          const dtSec = (now - prev.current.timestamp) / 1000;
          if (distM >= 0.5 && dtSec >= 0.2) {
            finalSpeed = distM / dtSec; // m/s
          }
        }

        // GPS가 일시적으로 speed를 빠뜨릴 때 마지막 유효값을 최대 3초 유지
        // → 속도 표시가 '--' 로 순간 깜빡이는 현상 방지
        if (finalSpeed !== null) {
          lastValidSpeed.current = { value: finalSpeed, ts: now };
        } else if (lastValidSpeed.current && now - lastValidSpeed.current.ts < 4_000) {
          finalSpeed = lastValidSpeed.current.value;
        }

        prev.current = { coord: curr, timestamp: now };

        setState({
          position: { lat, lng, heading: finalHeading, speed: finalSpeed, accuracy, timestamp: now },
          error: null,
          isWatching: true,
        });
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, isWatching: false }));
      },
      options,
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return state;
}
