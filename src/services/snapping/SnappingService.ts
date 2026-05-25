import { CCTVNode, FilterConfig, GPSPosition, SignalNode, SnappingState, TrafficNode } from '@/types';
import { SpatialFilter } from './SpatialFilter';
import { DirectionalFilter } from './DirectionalFilter';
import { HysteresisManager } from './HysteresisManager';

const DEFAULT_CONFIG: FilterConfig = {
  spatialRadiusKm: 1.5,
  headingConeDeg: 60,
  hysteresisMarginM: 50,
  triggerZoneM: 200,
};

// ─── GPS 동적 스내핑 파이프라인 ────────────────────────────────────────────────
// Stage 1: SpatialFilter   → 반경 내 노드 추출
// Stage 2: DirectionalFilter → 진행 방향 원뿔 필터
// Stage 3: HysteresisManager → 상태 안정화
export class SnappingService {
  private readonly spatial = new SpatialFilter();
  private readonly directional = new DirectionalFilter();
  private readonly signalHysteresis = new HysteresisManager<SignalNode>(50);
  private readonly cctvHysteresis = new HysteresisManager<CCTVNode>(80);

  private allNodes: TrafficNode[] = [];
  private config: FilterConfig;

  constructor(config: Partial<FilterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  loadNodes(nodes: TrafficNode[]): void {
    this.allNodes = nodes;
    this.signalHysteresis.reset();
    this.cctvHysteresis.reset();
  }

  process(position: GPSPosition): SnappingState {
    const cctvAll = this.allNodes.filter((n): n is CCTVNode => n.type === 'CCTV');
    const signalAll = this.allNodes.filter((n): n is SignalNode => n.type === 'SIGNAL');

    // Stage 1: 공간 필터
    const cctvSpatial = this.spatial.filter(cctvAll, position, this.config.spatialRadiusKm);
    const signalSpatial = this.spatial.filter(signalAll, position, this.config.spatialRadiusKm);

    // Stage 2: 방향성 필터
    const cctvDirectional = this.directional.filter(
      cctvSpatial,
      position.heading,
      this.config.headingConeDeg,
    );
    const signalDirectional = this.directional.filter(
      signalSpatial,
      position.heading,
      this.config.headingConeDeg,
    );

    // Stage 3: 히스테리시스
    const activeSignal = this.signalHysteresis.update(signalDirectional);
    const activeCCTV = this.cctvHysteresis.update(cctvDirectional);

    // 교차로 트리거 존 판정
    const isInTriggerZone =
      activeSignal !== null &&
      (activeSignal.distance ?? Infinity) <= this.config.triggerZoneM;

    // 전방 교차로명 결정
    const nextIntersectionName = activeSignal
      ? `${activeSignal.name} ${activeSignal.distance ?? '?'}m`
      : '교차로 없음';

    // 현재 도로명: 가장 가까운 CCTV 의 roadName 을 힌트로 사용
    const currentRoadName = activeCCTV?.roadName ?? cctvSpatial[0]?.roadName ?? '---';

    return {
      activeCCTVs: activeCCTV ? [activeCCTV] : cctvDirectional.slice(0, 2),
      activeSignal,
      currentRoadName,
      nextIntersectionName,
      isInTriggerZone,
      nearbyNodesCount: cctvSpatial.length + signalSpatial.length,
      nearbyCCTVCount: cctvSpatial.length,
    };
  }
}
