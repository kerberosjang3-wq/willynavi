import { BoundingBox, SignalNode } from '@/types';
import { BaseAdapter } from './IDataAdapter';

// ─── 경기도 교통정보센터(GITS) 원시 응답 타입 ────────────────────────────────
// TODO: 실제 API 응답 확인 후 필드명 수정 필요
export interface RawGGSignal {
  itstId?: string;          // 교차로 ID
  intersectionId?: string;
  intrsctNm?: string;       // 교차로명
  intersectionNm?: string;
  lat?: string;             // 위도
  coordY?: string;
  lon?: string;             // 경도
  coordX?: string;
  ntPdsgStatNm?: string;    // 신호 상태 (녹색/황색/적색)
  signalStatus?: string;
  remainSec?: string;       // 잔여 시간(초)
  remainingSeconds?: string;
  cycleSec?: string;        // 사이클(초)
}

// 경기도 GITS API 신호 어댑터
// GG_API_KEY 발급 후 즉시 활성화되는 구조
export class GGITSAdapter extends BaseAdapter<RawGGSignal, SignalNode> {
  readonly sourceName = 'GG-ITS';

  // 경기도 GITS 후보 엔드포인트 (실제 엔드포인트 확인 후 수정)
  // openapigits.gg.go.kr 로그인 → API 명세서에서 확인
  static readonly INTERSECTION_URLS = [
    'https://openapigits.gg.go.kr/api/json/getSignalPhaseInfo',
    'https://openapigits.gg.go.kr/api/json/getCITSSignalInfo',
    'https://openapigits.gg.go.kr/api/json/getIntersectionInfo',
    'https://openapigits.gg.go.kr/api/json/getSignalList',
  ];

  static readonly SIGNAL_URLS = [
    'https://openapigits.gg.go.kr/api/json/getSignalPhaseInfo',
    'https://openapigits.gg.go.kr/api/json/getCITSSignalInfo',
  ];

  async fetchRaw(area: BoundingBox): Promise<RawGGSignal[]> {
    const apiKey = process.env.GG_API_KEY;
    if (!apiKey) return [];

    // GITS API 파라미터 (실제 확인 후 수정)
    const params = new URLSearchParams({
      serviceKey: apiKey,   // TODO: 실제 파라미터명 확인 (apiKey / serviceKey / authKey)
      minLat: String(area.minLat),
      maxLat: String(area.maxLat),
      minLon: String(area.minLng),
      maxLon: String(area.maxLng),
      pageNo: '1',
      numOfRows: '100',
      type: 'json',
    });

    for (const url of GGITSAdapter.INTERSECTION_URLS) {
      try {
        const res = await fetch(`${url}?${params}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        // TODO: 실제 응답 구조 확인 후 경로 수정
        const rows = data?.response?.body?.items?.item
          ?? data?.items?.item
          ?? data?.data
          ?? [];
        const list = Array.isArray(rows) ? rows : [rows];
        if (list.length > 0) return list;
      } catch {
        // 다음 후보 시도
      }
    }
    return [];
  }

  normalize(raw: RawGGSignal): SignalNode {
    const id = raw.itstId ?? raw.intersectionId ?? 'gg-unknown';
    const name = raw.intrsctNm ?? raw.intersectionNm ?? '경기 교차로';
    const lat = parseFloat(raw.lat ?? raw.coordY ?? '0');
    const lng = parseFloat(raw.lon ?? raw.coordX ?? '0');
    const remainSec = parseInt(raw.remainSec ?? raw.remainingSeconds ?? '0', 10);
    const cycleSec = parseInt(raw.cycleSec ?? '90', 10);
    const phaseRaw = (raw.ntPdsgStatNm ?? raw.signalStatus ?? '').toLowerCase();
    const phase =
      phaseRaw.includes('녹') || phaseRaw.includes('green') ? 'GREEN' :
      phaseRaw.includes('황') || phaseRaw.includes('yellow') ? 'YELLOW' :
      phaseRaw.includes('적') || phaseRaw.includes('red') ? 'RED' : 'UNKNOWN';

    return {
      id: `gg-${id}`,
      type: 'SIGNAL',
      name,
      intersectionId: `GG-${id}`,
      coordinate: { lat, lng },
      currentPhase: phase as SignalNode['currentPhase'],
      remainingSeconds: remainSec,
      cycleSeconds: cycleSec,
      lastUpdated: Date.now(),
    };
  }
}
