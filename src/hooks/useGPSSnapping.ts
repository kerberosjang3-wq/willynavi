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
  const positionRef = useRef<GPSPosition | null>(null); // 최신 위치 보관

  // 서비스 초기화
  useEffect(() => {
    serviceRef.current = new SnappingService(config);
  }, [config]);

  // 노드 교체 → 현재 위치로 즉시 재계산
  // 정지 상태에서 노드가 뒤늦게 도착해도 목록이 표시되도록 함
  useEffect(() => {
    if (!serviceRef.current) return;
    const sourceNodes = useMock ? ALL_MOCK_NODES : (nodes ?? []);
    serviceRef.current.loadNodes(sourceNodes);

    // 이미 위치가 있으면 즉시 파이프라인 재실행
    const pos = positionRef.current;
    if (pos && pos.accuracy <= 100) {
      setState(serviceRef.current.process(pos));
    }
  }, [nodes, useMock]);

  // GPS 위치 변경 시 파이프라인 실행
  useEffect(() => {
    if (!position || !serviceRef.current) {
      setState(EMPTY_STATE);
      return;
    }
    positionRef.current = position;
    if (position.accuracy > 100) return;

    setState(serviceRef.current.process(position));
  }, [position]);

  return state;
}
