'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CCTVNode, GPSPosition, TrafficNode } from '@/types';
import { haversineDistance } from '@/utils/geo.utils';
import { MOCK_SIGNAL_NODES } from '@/data/mockNodes';

const REFETCH_THRESHOLD_M = 500; // 500m 이동 시 재조회
const BBOX_DEG = 0.027;          // 약 3km 반경

interface RawCCTV {
  cctvid: string;
  cctvname: string;
  coordy: string;
  coordx: string;
  cctvurl: string;
  roadsectionid?: string;
}

// GPS 위치 기반으로 주변 CCTV를 실 API에서 동적으로 조회하는 훅
// 500m 이상 이동 시에만 재조회하여 API 호출 최소화
export function useNearbyNodes(position: GPSPosition | null): TrafficNode[] {
  const [cctvNodes, setCctvNodes] = useState<CCTVNode[]>([]);
  const lastCoord = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!position || position.accuracy > 100) return;

    // 마지막 조회 위치에서 500m 이내 → 재조회 생략
    if (lastCoord.current) {
      const moved = haversineDistance(lastCoord.current, position);
      if (moved < REFETCH_THRESHOLD_M) return;
    }

    lastCoord.current = { lat: position.lat, lng: position.lng };

    const params = new URLSearchParams({
      minX: String(position.lng - BBOX_DEG),
      maxX: String(position.lng + BBOX_DEG),
      minY: String(position.lat - BBOX_DEG),
      maxY: String(position.lat + BBOX_DEG),
    });

    fetch(`/api/cctv?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const rows: RawCCTV[] = data?.response?.data ?? [];
        const nodes: CCTVNode[] = rows
          .filter((r) => r.cctvid && r.coordy && r.coordx)
          .map((r) => ({
            id: `its-${r.cctvid}`,
            type: 'CCTV' as const,
            name: r.cctvname ?? '이름없음',
            coordinate: {
              lat: parseFloat(r.coordy),
              lng: parseFloat(r.coordx),
            },
            streamUrl: r.cctvurl ?? '',
            source: 'ITS' as const,
            roadName: r.roadsectionid,
          }));
        setCctvNodes(nodes);
      })
      .catch(() => {}); // 실패 시 기존 CCTV 유지
  }, [position]);

  // CCTV(실API) + 신호(Mock) 안정적 참조 반환
  return useMemo(
    () => [...cctvNodes, ...MOCK_SIGNAL_NODES],
    [cctvNodes],
  );
}
