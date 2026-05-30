'use client';
import { useEffect, useRef, useState } from 'react';
import { FilterConfig, GPSPosition, SnappingState, TrafficNode } from '@/types';
import { SnappingService } from '@/services/snapping/SnappingService';
import { ALL_MOCK_NODES } from '@/data/mockNodes';

const EMPTY_STATE: SnappingState = {
  activeCCTVs: [],
  nearbyCCTVList: [],
  activeSignal: null,
  currentRoadName: '---',
  nextIntersectionName: '---',
  isInTriggerZone: false,
  nearbyNodesCount: 0,
  nearbyCCTVCount: 0,
};

interface UseGPSSnappingOptions {
  nodes?: TrafficNode[];
  config?: Partial<FilterConfig>;
  useMock?: boolean;
}

export function useGPSSnapping(
  position: GPSPosition | null,
  options: UseGPSSnappingOptions = {},
): SnappingState {
  const { nodes, config, useMock = false } = options;
  const [state, setState] = useState<SnappingState>(EMPTY_STATE);
  const serviceRef = useRef<SnappingService | null>(null);

  // 서비스 초기화 — config 변경 시에만 재생성
  useEffect(() => {
    serviceRef.current = new SnappingService(config);
  }, [config]);

  // 노드 교체 — 노드 목록이 바뀔 때만 loadNodes 호출
  useEffect(() => {
    if (!serviceRef.current) return;
    const sourceNodes = useMock ? ALL_MOCK_NODES : (nodes ?? []);
    serviceRef.current.loadNodes(sourceNodes);
  }, [nodes, useMock]);

  // GPS 위치 변경 시 파이프라인 실행
  useEffect(() => {
    if (!position || !serviceRef.current) {
      setState(EMPTY_STATE);
      return;
    }
    if (position.accuracy > 100) return;

    const result = serviceRef.current.process(position);
    setState(result);
  }, [position]);

  return state;
}
