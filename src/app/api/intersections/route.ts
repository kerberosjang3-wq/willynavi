import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SIGNAL_NODES } from '@/data/mockNodes';
import { SignalNode } from '@/types';

// CCTV 신규 패턴(NCCTVInfo)을 따라 추론한 C-ITS 교차로 목록 후보 URL
const CANDIDATE_URLS = [
  'http://openapi.its.go.kr/api/NCITSIntersectionInfo',
  'http://openapi.its.go.kr/api/NSignalInfo',
  'http://openapi.its.go.kr/api/NCITSInfo',
];

// GPS bbox 기반 C-ITS 교차로(신호 노드) 목록 조회
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const apiKey = process.env.ITS_API_KEY;

  const minLat = parseFloat(searchParams.get('minLat') ?? '0');
  const maxLat = parseFloat(searchParams.get('maxLat') ?? '90');
  const minLng = parseFloat(searchParams.get('minLng') ?? '0');
  const maxLng = parseFloat(searchParams.get('maxLng') ?? '180');

  if (!apiKey) {
    return NextResponse.json(fallbackNodes(minLat, maxLat, minLng, maxLng));
  }

  const params = new URLSearchParams({
    key: apiKey,
    ReqType: '2',
    MinX: String(minLng),
    MaxX: String(maxLng),
    MinY: String(minLat),
    MaxY: String(maxLat),
    type: 'ex',
  });

  // 후보 URL 순서대로 시도 — 성공하면 즉시 반환
  for (const baseUrl of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${baseUrl}?${params}`, {
        next: { revalidate: 300 }, // 5분 캐시 (신호 위치는 자주 안 바뀜)
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];

      if (rows.length > 0) {
        const nodes: SignalNode[] = rows.map(toSignalNode);
        return NextResponse.json({ data: nodes, source: 'its' });
      }
    } catch {
      // 해당 URL 실패 → 다음 후보 시도
    }
  }

  // 모든 후보 실패 → bbox 내 Mock 노드 반환
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

// ITS 원시 교차로 데이터 → SignalNode 변환 (실제 응답 필드 확인 후 수정 필요)
function toSignalNode(raw: Record<string, string>): SignalNode {
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
