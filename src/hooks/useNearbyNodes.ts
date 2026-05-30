'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CCTVNode, GPSPosition, SignalNode, TrafficNode } from '@/types';
import { haversineDistance } from '@/utils/geo.utils';
import { SEOUL_STATIC_CCTVS } from '@/data/seoulStaticCCTVs';

const REFETCH_THRESHOLD_M = 500;
const BBOX_DEG = 0.05;

// bbox 안의 정적 CCTV 필터링
function staticCCTVsInBbox(minX: number, maxX: number, minY: number, maxY: number): CCTVNode[] {
  return SEOUL_STATIC_CCTVS.filter(
    (c) => c.coordinate.lng >= minX && c.coordinate.lng <= maxX &&
           c.coordinate.lat >= minY && c.coordinate.lat <= maxY,
  );
}

export type ApiSource = 'its' | 'gg' | 'mock' | 'loading';

export interface NearbyNodesResult {
  nodes: TrafficNode[];
  cctvSource: ApiSource;
  signalSource: ApiSource;
}

interface RawCCTV {
  cctvid: string;
  cctvname: string;
  coordy: string;
  coordx: string;
  cctvurl: string;
  roadsectionid?: string;
}

export function useNearbyNodes(position: GPSPosition | null): NearbyNodesResult {
  const [cctvNodes, setCctvNodes] = useState<CCTVNode[]>([]);
  const [signalNodes, setSignalNodes] = useState<SignalNode[]>([]);
  const [cctvSource, setCctvSource] = useState<ApiSource>('loading');
  const [signalSource, setSignalSource] = useState<ApiSource>('loading');
  const lastCoord = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!position || position.accuracy > 100) return;

    if (lastCoord.current) {
      const moved = haversineDistance(lastCoord.current, position);
      if (moved < REFETCH_THRESHOLD_M) return;
    }

    lastCoord.current = { lat: position.lat, lng: position.lng };

    const q = {
      minX: String(position.lng - BBOX_DEG),
      maxX: String(position.lng + BBOX_DEG),
      minY: String(position.lat - BBOX_DEG),
      maxY: String(position.lat + BBOX_DEG),
      minLat: String(position.lat - BBOX_DEG),
      maxLat: String(position.lat + BBOX_DEG),
      minLng: String(position.lng - BBOX_DEG),
      maxLng: String(position.lng + BBOX_DEG),
    };

    // CCTV 조회 — CF Worker 직접 호출(한국 엣지) 우선, 없으면 Vercel API 폴백
    const cfUrl = process.env.NEXT_PUBLIC_CF_WORKER_URL;
    const cctvEndpoint = cfUrl
      ? `${cfUrl}/cctv?${new URLSearchParams({ minX: q.minX, maxX: q.maxX, minY: q.minY, maxY: q.maxY })}`
      : `/api/cctv?${new URLSearchParams({ minX: q.minX, maxX: q.maxX, minY: q.minY, maxY: q.maxY })}`;

    const minX = parseFloat(q.minX), maxX = parseFloat(q.maxX);
    const minY = parseFloat(q.minY), maxY = parseFloat(q.maxY);

    const applyStaticFallback = () => {
      const staticNodes = staticCCTVsInBbox(minX, maxX, minY, maxY);
      if (staticNodes.length > 0) {
        setCctvNodes(staticNodes);
        setCctvSource('its');
      } else {
        setCctvSource('mock');
      }
    };

    const parseAndSet = (data: unknown) => {
      const rows: RawCCTV[] = (data as { response?: { data?: RawCCTV[] } })?.response?.data ?? [];
      const apiNodes: CCTVNode[] = rows
        .filter((r) => r.cctvid && r.coordy && r.coordx)
        .map((r) => ({
          id: `its-${r.cctvid}`,
          type: 'CCTV' as const,
          name: r.cctvname ?? '이름없음',
          coordinate: { lat: parseFloat(r.coordy), lng: parseFloat(r.coordx) },
          streamUrl: r.cctvurl ?? '',
          source: 'ITS' as const,
          roadName: r.roadsectionid,
        }));

      const isMock = apiNodes.length === 0 || apiNodes.every((n) => /its-cctv-\d+/.test(n.id));
      if (!isMock) {
        setCctvNodes(apiNodes);
        setCctvSource('its');
      } else {
        applyStaticFallback();
      }
    };

    fetch(cctvEndpoint)
      .then((r) => r.json())
      .then(parseAndSet)
      .catch(() => {
        // CF Worker 실패 → Vercel API 재시도
        if (cfUrl) {
          fetch(`/api/cctv?${new URLSearchParams({ minX: q.minX, maxX: q.maxX, minY: q.minY, maxY: q.maxY })}`)
            .then((r) => r.json())
            .then(parseAndSet)
            .catch(applyStaticFallback);
        } else {
          applyStaticFallback();
        }
      });

    // 교차로(신호) 노드 조회
    fetch(`/api/intersections?${new URLSearchParams({ minLat: q.minLat, maxLat: q.maxLat, minLng: q.minLng, maxLng: q.maxLng })}`)
      .then((r) => r.json())
      .then((data) => {
        const nodes: SignalNode[] = data?.data ?? [];
        const src: ApiSource = (data?.source as ApiSource) ?? 'mock';
        if (nodes.length > 0) setSignalNodes(nodes);
        setSignalSource(src);
      })
      .catch(() => setSignalSource('mock'));
  }, [position]);

  const nodes = useMemo(
    () => [...cctvNodes, ...signalNodes],
    [cctvNodes, signalNodes],
  );

  return { nodes, cctvSource, signalSource };
}
