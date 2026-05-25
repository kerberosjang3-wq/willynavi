import { BoundingBox, CCTVNode, RawITSCCTV } from '@/types';
import { BaseAdapter } from './IDataAdapter';

// 국가교통정보센터(openapi.its.go.kr) CCTV 어댑터
export class ITSCCTVAdapter extends BaseAdapter<RawITSCCTV, CCTVNode> {
  readonly sourceName = 'ITS-CCTV';

  async fetchRaw(area: BoundingBox): Promise<RawITSCCTV[]> {
    const params = new URLSearchParams({
      minX: String(area.minLng),
      maxX: String(area.maxLng),
      minY: String(area.minLat),
      maxY: String(area.maxLat),
      type: 'its',
    });
    const res = await fetch(`/api/cctv/its?${params}`);
    if (!res.ok) throw new Error(`ITS CCTV API error: ${res.status}`);
    const json = await res.json();
    // 실제 응답 구조: { response: { data: [...] } }
    return (json?.response?.data ?? []) as RawITSCCTV[];
  }

  normalize(raw: RawITSCCTV): CCTVNode {
    return {
      id: `its-${raw.cctvid}`,
      type: 'CCTV',
      name: raw.cctvname,
      coordinate: {
        lat: parseFloat(raw.coordy),
        lng: parseFloat(raw.coordx),
      },
      streamUrl: raw.cctvurl,
      source: 'ITS',
      roadName: raw.roadsectionid,
    };
  }
}
