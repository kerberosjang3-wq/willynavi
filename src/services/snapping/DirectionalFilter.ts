import { TrafficNode } from '@/types';
import { computeDotProduct } from '@/utils/geo.utils';

// ─── 2단계: 방향성 필터링 ──────────────────────────────────────────────────────
// GPS heading과 노드 방위각을 내적(Dot Product)하여
// 진행 방향 원뿔 이내의 노드만 통과시킴 → 반대 차선 핑퐁 방지
export class DirectionalFilter {
  /**
   * @param nodes        SpatialFilter 통과 노드 (bearing 필드 필수)
   * @param headingDeg   현재 GPS heading (도, 0=북)
   * @param coneDeg      허용 원뿔 반각 (기본 60° → threshold ≈ 0.5)
   */
  filter<T extends TrafficNode>(
    nodes: T[],
    headingDeg: number | null,
    coneDeg = 60,
  ): T[] {
    // heading 을 모르면(정지 상태) 가장 가까운 1개만 반환
    if (headingDeg === null) return nodes.slice(0, 1);

    const threshold = Math.cos((coneDeg * Math.PI) / 180);

    return nodes
      .map((node) => {
        const dot = computeDotProduct(headingDeg, node.bearing ?? 0);
        return { ...node, dotProduct: dot };
      })
      .filter((node) => node.dotProduct! >= threshold);
  }
}
