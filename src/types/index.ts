// ─── 좌표 기본 타입 ────────────────────────────────────────────────────────────
export interface Coordinate {
  lat: number;
  lng: number;
}

// ─── GPS 위치 (Geolocation API 출력 정규화) ────────────────────────────────────
export interface GPSPosition extends Coordinate {
  heading: number | null;   // 진행 방향(도), 0=북, 90=동, null=정지
  speed: number | null;     // m/s, null=정지
  accuracy: number;         // 위치 오차 반경(m)
  timestamp: number;        // Unix ms
}

// ─── 노드 공통 ─────────────────────────────────────────────────────────────────
export type NodeType = 'CCTV' | 'SIGNAL';
export type SignalPhase = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
export type CCTVSource = 'ITS' | 'SEOUL';

export interface BaseNode {
  id: string;
  type: NodeType;
  name: string;
  coordinate: Coordinate;
  // 스내핑 파이프라인이 계산해서 채우는 필드
  bearing?: number;     // 현재 위치 → 노드 방위각(도)
  distance?: number;    // 현재 위치 → 노드 직선거리(m)
  dotProduct?: number;  // 진행 방향 벡터와의 내적 [-1, 1]
}

// ─── CCTV 노드 ─────────────────────────────────────────────────────────────────
export interface CCTVNode extends BaseNode {
  type: 'CCTV';
  streamUrl: string;      // HLS .m3u8 URL
  source: CCTVSource;
  thumbnailUrl?: string;
  roadName?: string;
}

// ─── 신호등(교차로) 노드 ────────────────────────────────────────────────────────
export interface SignalNode extends BaseNode {
  type: 'SIGNAL';
  intersectionId: string;
  currentPhase: SignalPhase;
  remainingSeconds: number;
  cycleSeconds: number;
  lastUpdated: number;    // Unix ms
}

export type TrafficNode = CCTVNode | SignalNode;

// ─── 스내핑 파이프라인 결과 ────────────────────────────────────────────────────
export interface SnappingState {
  activeCCTVs: CCTVNode[];
  activeSignal: SignalNode | null;
  currentRoadName: string;
  nextIntersectionName: string;
  isInTriggerZone: boolean;   // 교차로 트리거 존 진입 여부
  nearbyNodesCount: number;
}

// ─── 필터 설정 ─────────────────────────────────────────────────────────────────
export interface FilterConfig {
  spatialRadiusKm: number;      // 공간 필터 반경 (기본 1.5 km)
  headingConeDeg: number;       // 방향성 필터 원뿔 각도 (기본 ±60°)
  hysteresisMarginM: number;    // 히스테리시스 마진 (기본 50 m)
  triggerZoneM: number;         // 교차로 트리거 거리 (기본 200 m)
}

// ─── 어댑터 공통 ───────────────────────────────────────────────────────────────
export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// ─── Raw API 응답 타입 (어댑터 내부용) ─────────────────────────────────────────
export interface RawITSCCTV {
  cctvid: string;
  cctvname: string;
  coordy: string;
  coordx: string;
  cctvurl: string;
  roadsectionid: string;
}

export interface RawSeoulCCTV {
  CCTV_ID: string;
  CCTV_NAME: string;
  CCTV_URL: string;
  LATITUDE: string;
  LONGITUDE: string;
  ROAD_NM: string;
}

export interface RawCITSSignal {
  itstId: string;
  intrsctNm: string;
  lat: string;
  lon: string;
  ntPdsgStatNm: string;   // 신호 상태명
  remainSec: string;
  cycleSec: string;
}
