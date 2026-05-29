'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CCTVNode, GPSPosition, SignalNode, TrafficNode } from '@/types';
import { haversineDistance } from '@/utils/geo.utils';

const REFETCH_THRESHOLD_M = 500;
const BBOX_DEG = 0.027;

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

    // CCTV 조회
    fetch(`/api/cctv?${new URLSearchParams({ minX: q.minX, maxX: q.maxX, minY: q.minY, maxY: q.maxY })}`)
      .then((r) => r.json())
      .then((data) => {
        const rows: RawCCTV[] = data?.response?.data ?? [];
        const nodes: CCTVNode[] = rows
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
        setCctvNodes(nodes);
        // mock 노드 ID 패턴(cctv-00x)과 실 ITS ID 구분
        const isMock = nodes.length === 0 || nodes.every((n) => n.id.match(/its-cctv-\d+/));
        setCctvSource(isMock ? 'mock' : 'its');
      })
      .catch(() => setCctvSource('mock'));

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
