import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SIGNAL_NODES } from '@/data/mockNodes';
import { SignalNode } from '@/types';
import { GGITSAdapter } from '@/services/adapters/GGITSAdapter';

// 국가 ITS C-ITS 후보 엔드포인트
const ITS_URLS = [
  'http://openapi.its.go.kr/api/NCITSIntersectionInfo',
  'http://openapi.its.go.kr/api/NSignalInfo',
  'http://openapi.its.go.kr/api/NCITSInfo',
];

// GPS bbox 기반 교차로(신호 노드) 목록 조회
// 우선순위: 국가 ITS → 경기도 GITS → Mock
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const minLat = parseFloat(searchParams.get('minLat') ?? '0');
  const maxLat = parseFloat(searchParams.get('maxLat') ?? '90');
  const minLng = parseFloat(searchParams.get('minLng') ?? '0');
  const maxLng = parseFloat(searchParams.get('maxLng') ?? '180');

  // ── 1. 국가 ITS API 시도 ───────────────────────────────────────────────────
  const itsKey = process.env.ITS_API_KEY;
  if (itsKey) {
    const params = new URLSearchParams({
      key: itsKey,
      ReqType: '2',
      MinX: String(minLng),
      MaxX: String(maxLng),
      MinY: String(minLat),
      MaxY: String(maxLat),
      type: 'ex',
    });

    for (const baseUrl of ITS_URLS) {
      try {
        const res = await fetch(`${baseUrl}?${params}`, {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];
        if (rows.length > 0) {
          return NextResponse.json({
            data: rows.map(toITSSignalNode),
            source: 'its',
          });
        }
      } catch { /* 다음 후보 */ }
    }
  }

  // ── 2. 경기도 GITS API 시도 (GG_API_KEY 발급 후 활성화) ───────────────────
  const ggKey = process.env.GG_API_KEY;
  if (ggKey) {
    const adapter = new GGITSAdapter();
    try {
      const raws = await adapter.fetchRaw({ minLat, maxLat, minLng, maxLng });
      if (raws.length > 0) {
        return NextResponse.json({
          data: raws.map((r) => adapter.normalize(r)),
          source: 'gg',
        });
      }
    } catch { /* 폴백으로 */ }
  }

  // ── 3. Mock 폴백 ───────────────────────────────────────────────────────────
  return NextResponse.json(fallbackNodes(minLat, maxLat, minLng, maxLng));
}

function fallbackNodes(
  minLat: number, maxLat: number, minLng: number, maxLng: number,
) {
  const nodes = MOCK_SIGNAL_NODES.filter(
    (n) =>
      n.coordinate.lat >= minLat && n.coordinate.lat <= maxLat &&
      n.coordinate.lng >= minLng && n.coordinate.lng <= maxLng,
  );
  return { data: nodes, source: 'mock' };
}

function toITSSignalNode(raw: Record<string, string>): SignalNode {
  return {
    id: `cits-${raw.itstId ?? raw.intersectionId ?? raw.id}`,
    type: 'SIGNAL',
    name: raw.intrsctNm ?? raw.name ?? '교차로',
    intersectionId: raw.itstId ?? raw.intersectionId ?? raw.id ?? '',
    coordinate: {
      lat: parseFloat(raw.lat ?? raw.coordY ?? '0'),
      lng: parseFloat(raw.lon ?? raw.coordX ?? '0'),
    },
    currentPhase: 'UNKNOWN',
    remainingSeconds: 0,
    cycleSeconds: 90,
    lastUpdated: Date.now(),
  };
}
