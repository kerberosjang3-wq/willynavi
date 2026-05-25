import { BoundingBox, TrafficNode } from '@/types';

// 이기종 공공 API를 단일 규격으로 변환하는 어댑터 인터페이스
export interface IDataAdapter<TRaw, TNode extends TrafficNode> {
  readonly sourceName: string;
  fetchRaw(area: BoundingBox): Promise<TRaw[]>;
  normalize(raw: TRaw): TNode;
  fetchAndNormalize(area: BoundingBox): Promise<TNode[]>;
}

// 어댑터 기반 클래스 — fetchAndNormalize 기본 구현 제공
export abstract class BaseAdapter<TRaw, TNode extends TrafficNode>
  implements IDataAdapter<TRaw, TNode>
{
  abstract readonly sourceName: string;
  abstract fetchRaw(area: BoundingBox): Promise<TRaw[]>;
  abstract normalize(raw: TRaw): TNode;

  async fetchAndNormalize(area: BoundingBox): Promise<TNode[]> {
    try {
      const rawList = await this.fetchRaw(area);
      return rawList.map((r) => this.normalize(r));
    } catch (err) {
      console.error(`[${this.sourceName}] fetchAndNormalize failed:`, err);
      return [];
    }
  }
}
