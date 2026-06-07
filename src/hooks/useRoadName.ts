'use client';
import { useEffect, useRef, useState } from 'react';
import { GPSPosition } from '@/types';
import { haversineDistance } from '@/utils/geo.utils';

// 현재 위치의 도로명을 T-Map 역지오코딩으로 조회
// 100m 이상 이동했을 때만 재조회 (API 호출 최소화)
export function useRoadName(position: GPSPosition | null): string | null {
  const [roadName, setRoadName] = useState<string | null>(null);
  const posRef        = useRef(position);
  posRef.current      = position;
  const lastPos       = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let alive = true;

    const doFetch = async () => {
      const pos = posRef.current;
      if (!pos) return;

      // 100m 미만 이동이면 스킵
      if (lastPos.current) {
        const moved = haversineDistance(lastPos.current, { lat: pos.lat, lng: pos.lng });
        if (moved < 100) return;
      }
      lastPos.current = { lat: pos.lat, lng: pos.lng };

      try {
        const res  = await fetch(`/api/road-name?lat=${pos.lat}&lng=${pos.lng}`);
        const data = await res.json();
        if (alive && data.roadName) setRoadName(data.roadName);
      } catch {}
    };

    doFetch();
    const timer = setInterval(doFetch, 5_000);
    return () => { alive = false; clearInterval(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return roadName;
}
