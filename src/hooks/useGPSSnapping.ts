'use client';
import { useEffect, useRef, useState } from 'react';
import { FilterConfig, GPSPosition, SnappingState, TrafficNode } from '@/types';
import { SnappingService } from '@/services/snapping/SnappingService';
import { ALL_MOCK_NODES } from '@/data/mockNodes';

const EMPTY_STATE: SnappingState = {
  activeCCTVs: [],
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

// GPS 위치를 받아 스내핑 파이프라인을 실행하는 훅
export function useGPSSnapping(
  position: GPSPosition | null,
  options: UseGPSSnappingOptions = {},
): SnappingState {
  const { nodes, config, useMock = true } = options;
  const [state, setState] = useState<SnappingState>(EMPTY_STATE);
  const serviceRef = useRef<SnappingService | null>(null);

  // 서비스 초기화 (config 변경 시 재생성)
  useEffect(() => {
    serviceRef.current = new SnappingService(config);
    const sourceNodes = useMock ? ALL_MOCK_NODES : (nodes ?? []);
    serviceRef.current.loadNodes(sourceNodes);
  }, [config, nodes, useMock]);

  // GPS 위치 변경 시 파이프라인 실행
  useEffect(() => {
    if (!position || !serviceRef.current) {
      setState(EMPTY_STATE);
      return;
    }

    // 정확도 5m 이하인 데이터는 노이즈로 간주하여 스킵하지 않음
    // (GPS 정확도 100m 이하만 허용)
    if (position.accuracy > 100) return;

    const result = serviceRef.current.process(position);
    setState(result);
  }, [position]);

  return state;
}
