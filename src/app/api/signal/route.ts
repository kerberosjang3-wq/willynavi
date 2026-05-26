import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SIGNAL_NODES } from '@/data/mockNodes';
import { SignalNode } from '@/types';

// C-ITS 신호 정보 API 프록시 + Mock 폴백 + 카운트다운 시뮬레이션
export async function GET(req: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const { searchParams } = req.nextUrl;
  const intersectionId = searchParams.get('id');

  if (useMock) {
    // 단일 교차로 조회
    if (intersectionId) {
      const node = MOCK_SIGNAL_NODES.find(
        (n) => n.intersectionId === intersectionId || n.id === intersectionId,
      );
      if (!node) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json(simulateCountdown(node));
    }

    // 범위 조회
    const minLat = parseFloat(searchParams.get('minLat') ?? '0');
    const maxLat = parseFloat(searchParams.get('maxLat') ?? '90');
    const minLng = parseFloat(searchParams.get('minLng') ?? '0');
    const maxLng = parseFloat(searchParams.get('maxLng') ?? '180');

    const filtered = MOCK_SIGNAL_NODES
      .filter(
        (n) =>
          n.coordinate.lat >= minLat &&
          n.coordinate.lat <= maxLat &&
          n.coordinate.lng >= minLng &&
          n.coordinate.lng <= maxLng,
      )
      .map(simulateCountdown);

    return NextResponse.json({ response: { data: filtered.map(toRawCITS) } });
  }

  const apiKey = process.env.ITS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ITS_API_KEY not set' }, { status: 500 });

  // CCTV 패턴(NCCTVInfo)을 따른 신호 후보 URL 순서대로 시도
  const SIGNAL_URLS = [
    'http://openapi.its.go.kr/api/NSignalPhaseInfo',
    'http://openapi.its.go.kr/api/NCITSSignalInfo',
    'http://openapi.its.go.kr/api/NSignalInfo',
  ];

  const params = new URLSearchParams({
    key: apiKey,
    type: 'ex',
    ...(intersectionId ? { itstId: intersectionId } : {}),
  });

  for (const baseUrl of SIGNAL_URLS) {
    try {
      const res = await fetch(`${baseUrl}?${params}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];
      if (rows.length > 0) return NextResponse.json(rows[0]);
    } catch {
      // 다음 후보 시도
    }
  }

  // 모든 실API 실패 → Mock 시뮬레이션으로 폴백
  if (intersectionId) {
    const node = MOCK_SIGNAL_NODES.find(
      (n) => n.intersectionId === intersectionId || n.id === intersectionId,
    );
    if (node) return NextResponse.json(simulateCountdown(node));
  }
  return NextResponse.json({ error: 'signal not found' }, { status: 404 });
}

// Mock 카운트다운 시뮬레이션 — 실제 시간 기반으로 잔여 시간 계산
function simulateCountdown(node: SignalNode): SignalNode {
  const elapsed = Math.floor((Date.now() - node.lastUpdated) / 1000);
  let remaining = Math.max(0, node.remainingSeconds - elapsed);

  if (remaining === 0) {
    // 사이클 완료 → 다음 페이즈로 전환 (단순 순환)
    const phases = ['GREEN', 'YELLOW', 'RED'] as const;
    const idx = phases.indexOf(node.currentPhase as 'GREEN' | 'YELLOW' | 'RED');
    const nextPhase = phases[(idx + 1) % 3];
    remaining = nextPhase === 'YELLOW' ? 5 : node.cycleSeconds * 0.4;
    return { ...node, currentPhase: nextPhase, remainingSeconds: Math.round(remaining), lastUpdated: Date.now() };
  }

  return { ...node, remainingSeconds: remaining };
}

function toRawCITS(node: SignalNode) {
  return {
    itstId: node.intersectionId,
    intrsctNm: node.name,
    lat: String(node.coordinate.lat),
    lon: String(node.coordinate.lng),
    ntPdsgStatNm: node.currentPhase === 'GREEN' ? '녹색' : node.currentPhase === 'YELLOW' ? '황색' : '적색',
    remainSec: String(node.remainingSeconds),
    cycleSec: String(node.cycleSeconds),
  };
}
