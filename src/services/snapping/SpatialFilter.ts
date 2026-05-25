import { Coordinate, TrafficNode } from '@/types';
import { haversineDistance, isWithinBBox } from '@/utils/geo.utils';
import { bearing as calcBearing } from '@/utils/geo.utils';

// ─── 1단계: 공간 필터링 ────────────────────────────────────────────────────────
// 현재 GPS 좌표 기준 반경 내 노드 추출 + bearing/distance 계산
export class SpatialFilter {
  filter<T extends TrafficNode>(
    nodes: T[],
    position: Coordinate,
    radiusKm: number,
  ): T[] {
    const result: T[] = [];

    for (const node of nodes) {
      // BBox 사전 체크 (Haversine 비용 절감)
      if (!isWithinBBox(position, node.coordinate, radiusKm * 1.2)) continue;

      const dist = haversineDistance(position, node.coordinate);
      if (dist > radiusKm * 1000) continue;

      const rawBearing = calcBearing(position, node.coordinate);
      const normalizedBearing = (rawBearing + 360) % 360;

      result.push({
        ...node,
        distance: Math.round(dist),
        bearing: Math.round(normalizedBearing),
      });
    }

    // 가까운 순 정렬
    return result.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }
}
