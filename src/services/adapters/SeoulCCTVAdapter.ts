import { BoundingBox, CCTVNode, RawSeoulCCTV } from '@/types';
import { BaseAdapter } from './IDataAdapter';

// 서울시 열린데이터광장 CCTV 어댑터
export class SeoulCCTVAdapter extends BaseAdapter<RawSeoulCCTV, CCTVNode> {
  readonly sourceName = 'SEOUL-CCTV';

  async fetchRaw(area: BoundingBox): Promise<RawSeoulCCTV[]> {
    const params = new URLSearchParams({
      minLat: String(area.minLat),
      maxLat: String(area.maxLat),
      minLng: String(area.minLng),
      maxLng: String(area.maxLng),
    });
    const res = await fetch(`/api/cctv/seoul?${params}`);
    if (!res.ok) throw new Error(`Seoul CCTV API error: ${res.status}`);
    const json = await res.json();
    return (json?.SeoulRtd?.row ?? []) as RawSeoulCCTV[];
  }

  normalize(raw: RawSeoulCCTV): CCTVNode {
    return {
      id: `seoul-${raw.CCTV_ID}`,
      type: 'CCTV',
      name: raw.CCTV_NAME,
      coordinate: {
        lat: parseFloat(raw.LATITUDE),
        lng: parseFloat(raw.LONGITUDE),
      },
      streamUrl: raw.CCTV_URL,
      source: 'SEOUL',
      roadName: raw.ROAD_NM,
    };
  }
}
