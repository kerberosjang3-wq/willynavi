import { Coordinate } from '@/types';

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Haversine 공식 — 두 좌표 간 거리(m)
export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);
  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinHalfLng * sinHalfLng;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// from → to 방위각(도, 0=북, 시계방향)
export function bearing(from: Coordinate, to: Coordinate): number {
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
  // 결과: -180 ~ +180, 호출 쪽에서 (+ 360) % 360 로 정규화
}

// 진행 방향(headingDeg)과 노드 방위각(bearingDeg) 사이의 방향 일치도
// = cos(headingDeg - bearingDeg) ∈ [-1, 1]
// > cos(60°) ≈ 0.5  →  60° 원뿔 이내 (전방)
// < 0           →  직각 이상 벗어남
// < -0.5        →  반대 차선 방향
export function computeDotProduct(headingDeg: number, bearingDeg: number): number {
  const diff = toRad(headingDeg - bearingDeg);
  return Math.cos(diff);
}

// 진행 방향 벡터를 추정 (연속 GPS 좌표 두 점으로)
export function estimateHeading(prev: Coordinate, curr: Coordinate): number {
  const raw = bearing(prev, curr);
  return (raw + 360) % 360;
}

// 좌표가 반경 내에 있는지 빠른 사전 체크 (Haversine 전 bbox 체크)
export function isWithinBBox(
  center: Coordinate,
  point: Coordinate,
  radiusKm: number,
): boolean {
  const latDelta = radiusKm / 111.0;
  const lngDelta = radiusKm / (111.0 * Math.cos(toRad(center.lat)));
  return (
    Math.abs(point.lat - center.lat) <= latDelta &&
    Math.abs(point.lng - center.lng) <= lngDelta
  );
}

export const DOT_PRODUCT_THRESHOLD_60 = Math.cos(toRad(60)); // ≈ 0.5

// 진행 방향(heading, 0=북 시계방향)을 V2X 방향 키로 변환
// nt=북향, et=동향, st=남향, wt=서향
export function headingToV2XDir(heading: number): 'nt' | 'et' | 'st' | 'wt' {
  const h = ((heading % 360) + 360) % 360; // 0~360 정규화
  if (h < 45 || h >= 315) return 'nt';
  if (h < 135) return 'et';
  if (h < 225) return 'st';
  return 'wt';
}

// DirectionalTiming에서 특정 방향의 잔여시간 추출
// heading이 없으면 활성 방향 중 최솟값 반환
export function pickDirectionalRemaining(
  directional: { nt?: number; et?: number; st?: number; wt?: number } | undefined,
  heading: number | null,
): number | undefined {
  if (!directional) return undefined;
  if (heading !== null) {
    const dir = headingToV2XDir(heading);
    return directional[dir];
  }
  // heading 없으면 활성 방향 중 최솟값
  const vals = [directional.nt, directional.et, directional.st, directional.wt]
    .filter((v): v is number => v !== undefined && v > 0);
  return vals.length > 0 ? Math.min(...vals) : undefined;
}
