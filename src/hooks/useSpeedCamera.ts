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
  if (heading === null || isNaN(heading)) return true;
  const b = (bearing(from, to) + 360) % 360;
  // cos(80°) ≈ 0.17 — 80° 원뿔 이내
  return computeDotProduct(heading, b) > 0.17;
}

// ── 진행방향으로 좌표 오프셋 (검색 중심 이동용) ──────────────────────────────

function forwardOffset(
  lat: number, lng: number,
  headingDeg: number, distM: number,
): { lat: number; lng: number } {
  const R = 6_371_000;
  const d = distM / R;
  const b = (headingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(b),
  );
  const λ2 = λ1 + Math.atan2(
    Math.sin(b) * Math.sin(d) * Math.cos(φ1),
    Math.cos(d) - Math.sin(φ1) * Math.sin(φ2),
  );
  return { lat: (φ2 * 180) / Math.PI, lng: (λ2 * 180) / Math.PI };
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
    .filter(c => c.distanceM <= 3_500)
    .sort((a, b) => a.distanceM - b.distanceM);

  return candidates[0] ?? null;
}

// ── T-map Safety API 폴링 훅 ──────────────────────────────────────────────────

export interface SpeedCameraFetchState {
  cameras: SpeedCameraRaw[];
  error: string | null;
}

const SEARCH_RADIUS_M  = 3_500;  // API 검색 반경
const FORWARD_OFFSET_M = 1_500;  // 진행방향 오프셋 → 전방 유효 커버 5km

// 구간단속 종료 마커(04)는 표시 불필요 — 이미 지나쳐서 진입한 상황
const SKIP_TYPES = new Set(['04']);

// 속도(km/h)에 따라 폴링 간격 조정 — 고속일수록 더 자주 갱신
function pollIntervalMs(speedKmh: number | null): number {
  if (speedKmh !== null && speedKmh >= 80) return 5_000;  // 고속도로
  if (speedKmh !== null && speedKmh >= 40) return 7_000;  // 일반도로
  return 10_000;                                           // 저속·정차
}

export function useSpeedCameras(position: GPSPosition | null): SpeedCameraFetchState {
  const posRef     = useRef(position);
  posRef.current   = position;

  const [state, setState] = useState<SpeedCameraFetchState>({ cameras: [], error: null });

  // 두 effect에서 공유할 안정적인 fetch 함수 핸들
  const fetchFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let alive = true;

    const doFetch = async () => {
      const pos = posRef.current;
      if (!pos) return;

      const heading = pos.heading;
      const searchOrigin =
        heading !== null && !isNaN(heading)
          ? forwardOffset(pos.lat, pos.lng, heading, FORWARD_OFFSET_M)
          : { lat: pos.lat, lng: pos.lng };

      try {
        const params = new URLSearchParams({
          lat:    String(searchOrigin.lat),
          lng:    String(searchOrigin.lng),
          radius: String(SEARCH_RADIUS_M),
        });

        const res = await fetch(`/api/speed-cameras?${params}`);
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

    fetchFnRef.current = doFetch;

    // 초기 fetch + 동적 폴링: 5초마다 현재 속도로 interval 재조정
    doFetch();
    let currentInterval = 10_000;
    let timer = setInterval(doFetch, currentInterval);

    const watcher = setInterval(() => {
      const spd = posRef.current?.speed;
      const next = pollIntervalMs(spd != null ? spd * 3.6 : null);
      if (next !== currentInterval) {
        clearInterval(timer);
        currentInterval = next;
        timer = setInterval(doFetch, currentInterval);
      }
    }, 5_000);

    return () => {
      alive = false;
      fetchFnRef.current = null;
      clearInterval(timer);
      clearInterval(watcher);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // GPS 첫 신호 수신 시 즉시 fetch (mount 시 GPS 없어서 초기 fetch가 건너뛰어진 경우 보완)
  const prevHadPos = useRef(!!position);
  useEffect(() => {
    if (position && !prevHadPos.current) {
      prevHadPos.current = true;
      fetchFnRef.current?.();
    }
  }, [position]);

  return state;
}
