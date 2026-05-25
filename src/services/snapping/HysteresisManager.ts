import { TrafficNode } from '@/types';

// ─── 3단계: 히스테리시스 마진 ──────────────────────────────────────────────────
// GPS 오차로 인한 상태 튀는 현상 방지
// 현재 활성 노드보다 marginM 이상 가까운 새 후보가 나타날 때만 전환
export class HysteresisManager<T extends TrafficNode> {
  private currentNode: T | null = null;
  private readonly marginM: number;

  constructor(marginM = 50) {
    this.marginM = marginM;
  }

  /**
   * 후보 노드 목록을 받아 히스테리시스가 적용된 단일 활성 노드를 반환
   * candidates는 distance 오름차순 정렬 상태를 가정
   */
  update(candidates: T[]): T | null {
    if (candidates.length === 0) {
      this.currentNode = null;
      return null;
    }

    const best = candidates[0]; // 가장 가까운 후보

    if (!this.currentNode) {
      this.currentNode = best;
      return best;
    }

    const currentDist = this.currentNode.distance ?? Infinity;
    const bestDist = best.distance ?? 0;

    // 새 후보가 현재 노드보다 marginM 이상 가까울 때만 전환
    if (currentDist - bestDist > this.marginM) {
      this.currentNode = best;
    } else {
      // 현재 노드가 여전히 후보 목록에 있으면 최신 계산값으로 갱신
      const refreshed = candidates.find((n) => n.id === this.currentNode!.id);
      if (refreshed) this.currentNode = refreshed;
    }

    return this.currentNode;
  }

  reset(): void {
    this.currentNode = null;
  }

  getCurrent(): T | null {
    return this.currentNode;
  }
}
