'use client';
import { useEffect, useRef, useState } from 'react';
import { GPSPosition } from '@/types';
import { haversineDistance, bearing, computeDotProduct } from '@/utils/geo.utils';

export type DangerType =
  | 'accident'    // 11: 사고다발지점
  | 'child'       // 12: 어린이보호구역 사고다발
  | 'sharpCurve'  // 21: 급커브
  | 'blackIce'    // 31: 결빙위험
  | 'rockfall';   // 41: 낙석위험

const DANGER_TYPE_MAP: Record<string, DangerType> = {
  '11': 'accident',
  '12': 'child',
  '21': 'sharpCurve',
  '31': 'blackIce',
  '41': 'rockfall',
};

export const DANGER_LABEL: Record<DangerType, string> = {
  accident:   '사고다발',
  child:      '어린이구역',
  sharpCurve: '급커브',
  blackIce:   '결빙위험',
  rockfall:   '낙석위험',
};

export const DANGER_ICON: Record<DangerType, string> = {
  accident:   '⚠️',
  child:      '👶',
  sharpCurve: '↪️',
  blackIce:   '🧊',
  rockfall:   '🪨',
};

export interface DangerZone {
  id:        string;
  lat:       number;
  lng:       number;
  type:      DangerType;
  typeName:  string;
  distanceM: number;
}

const DISPLAY_RANGE_M  = 500;   // 전방 500m 이내만 표시
const FORWARD_OFFSET_M = 1_000; // 검색 중심을 전방 1km로 오프셋
const SEARCH_RADIUS_M  = 2_000;

function forwardOffset(lat: number, lng: number, headingDeg: number, distM: number) {
  const R = 6_371_000;
  const d = distM / R;
  const b = (headingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(b));
  const λ2 = λ1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(φ1), Math.cos(d) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: (φ2 * 180) / Math.PI, lng: (λ2 * 180) / Math.PI };
}

function isAhead(from: { lat: number; lng: number }, to: { lat: number; lng: number }, heading: number | null) {
  if (heading === null || isNaN(heading)) return true;
  const b = (bearing(from, to) + 360) % 360;
  return computeDotProduct(heading, b) > 0.17;
}

export function useDangerZone(position: GPSPosition | null): DangerZone | null {
  const posRef   = useRef(position);
  posRef.current = position;

  const [nearest, setNearest] = useState<DangerZone | null>(null);

  useEffect(() => {
    let alive = true;

    const doFetch = async () => {
      const pos = posRef.current;
      if (!pos) return;

      const heading = pos.heading;
      const origin  =
        heading !== null && !isNaN(heading)
          ? forwardOffset(pos.lat, pos.lng, heading, FORWARD_OFFSET_M)
          : { lat: pos.lat, lng: pos.lng };

      try {
        const params = new URLSearchParams({
          lat:    String(origin.lat),
          lng:    String(origin.lng),
          radius: String(SEARCH_RADIUS_M),
        });
        const res  = await fetch(`/api/danger-zones?${params}`);
        if (!res.ok) return;
        const json = await res.json();

        const raw: Record<string, string>[] = (() => {
          const b = json?.resultData?.body;
          if (!b) return [];
          return Array.isArray(b) ? b : [b];
        })();

        const from = { lat: pos.lat, lng: pos.lng };

        const candidates: DangerZone[] = raw
          .filter(c => c.safetyType && DANGER_TYPE_MAP[c.safetyType])
          .map(c => ({
            id:        c.safetyId ?? String(Math.random()),
            lat:       parseFloat(c.lat ?? '0'),
            lng:       parseFloat(c.lon ?? '0'),
            type:      DANGER_TYPE_MAP[c.safetyType],
            typeName:  c.safetyTypeName ?? DANGER_LABEL[DANGER_TYPE_MAP[c.safetyType]],
            distanceM: 0,
          }))
          .filter(c => c.lat !== 0 && c.lng !== 0)
          .map(c => ({ ...c, distanceM: Math.round(haversineDistance(from, { lat: c.lat, lng: c.lng })) }))
          .filter(c => c.distanceM <= DISPLAY_RANGE_M && isAhead(from, { lat: c.lat, lng: c.lng }, heading))
          .sort((a, b) => a.distanceM - b.distanceM);

        if (alive) setNearest(candidates[0] ?? null);
      } catch {}
    };

    doFetch();
    const timer = setInterval(doFetch, 8_000);
    return () => { alive = false; clearInterval(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return nearest;
}
