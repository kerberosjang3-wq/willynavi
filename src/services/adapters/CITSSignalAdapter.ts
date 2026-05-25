import { BoundingBox, RawCITSSignal, SignalNode, SignalPhase } from '@/types';
import { BaseAdapter } from './IDataAdapter';

// C-ITS 신호 정보 어댑터 (서울교통 빅데이터 포털 / ITS)
export class CITSSignalAdapter extends BaseAdapter<RawCITSSignal, SignalNode> {
  readonly sourceName = 'CITS-SIGNAL';

  async fetchRaw(area: BoundingBox): Promise<RawCITSSignal[]> {
    const params = new URLSearchParams({
      minLat: String(area.minLat),
      maxLat: String(area.maxLat),
      minLng: String(area.minLng),
      maxLng: String(area.maxLng),
    });
    const res = await fetch(`/api/signal?${params}`);
    if (!res.ok) throw new Error(`C-ITS Signal API error: ${res.status}`);
    const json = await res.json();
    return (json?.response?.data ?? []) as RawCITSSignal[];
  }

  normalize(raw: RawCITSSignal): SignalNode {
    return {
      id: `cits-${raw.itstId}`,
      type: 'SIGNAL',
      name: raw.intrsctNm,
      intersectionId: raw.itstId,
      coordinate: {
        lat: parseFloat(raw.lat),
        lng: parseFloat(raw.lon),
      },
      currentPhase: this.parsePhase(raw.ntPdsgStatNm),
      remainingSeconds: parseInt(raw.remainSec, 10) || 0,
      cycleSeconds: parseInt(raw.cycleSec, 10) || 90,
      lastUpdated: Date.now(),
    };
  }

  private parsePhase(statNm: string): SignalPhase {
    if (statNm.includes('녹') || statNm.toLowerCase().includes('green')) return 'GREEN';
    if (statNm.includes('황') || statNm.toLowerCase().includes('yellow')) return 'YELLOW';
    if (statNm.includes('적') || statNm.toLowerCase().includes('red')) return 'RED';
    return 'UNKNOWN';
  }
}
