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

  // ── 1. 국가 ITS 실시간 신호 API 시도 ────────────────────────────────────────
  const itsKey = process.env.ITS_API_KEY;
  if (itsKey) {
    const ITS_SIGNAL_URLS = [
      'http://openapi.its.go.kr/api/NSignalPhaseInfo',
      'http://openapi.its.go.kr/api/NCITSSignalInfo',
      'http://openapi.its.go.kr/api/NSignalInfo',
    ];
    const itsParams = new URLSearchParams({
      key: itsKey,
      type: 'ex',
      ...(intersectionId ? { itstId: intersectionId } : {}),
    });
    for (const url of ITS_SIGNAL_URLS) {
      try {
        const res = await fetch(`${url}?${itsParams}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];
        if (rows.length > 0) return NextResponse.json(rows[0]);
      } catch { /* 다음 후보 */ }
    }
  }

  // ── 2. 공공데이터포털 신호제어기 잔여시간 정보 서비스 ────────────────────────────
  const seoulSignalKey = process.env.SEOUL_SIGNAL_KEY;
  if (seoulSignalKey) {
    const DATA_SIGNAL_URLS = [
      'http://apis.data.go.kr/1613000/TrafficSignalInfoInqireService01/getSignalPhaseInfo',
      'http://apis.data.go.kr/1613000/TrafficSignalInfoInqireService01/getTrafficSignalInfo',
    ];
    const minLat = searchParams.get('minLat');
    const maxLat = searchParams.get('maxLat');
    const minLng = searchParams.get('minLng');
    const maxLng = searchParams.get('maxLng');
    const signalParams = new URLSearchParams({
      serviceKey: seoulSignalKey,
      pageNo: '1',
      numOfRows: '100',
      type: 'json',
      ...(intersectionId ? { itstId: intersectionId } : {}),
      ...(minLat && minLng ? { minX: minLng, maxX: maxLng!, minY: minLat, maxY: maxLat! } : {}),
    });
    for (const url of DATA_SIGNAL_URLS) {
      try {
        const res = await fetch(`${url}?${signalParams}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.response?.header?.resultCode !== '00') continue;
        const items = data?.response?.body?.items?.item ?? [];
        const list = Array.isArray(items) ? items : items ? [items] : [];
        if (list.length === 0) continue;
        if (intersectionId) return NextResponse.json(list[0]);
        return NextResponse.json({ response: { data: list } });
      } catch { /* 다음 후보 */ }
    }
  }

  // ── 3. 경기도 GITS 실시간 신호 API 시도 (GG_API_KEY 발급 후 활성화) ─────────
  const ggKey = process.env.GG_API_KEY;
  if (ggKey && intersectionId) {
    const GG_SIGNAL_URLS = [
      'https://openapigits.gg.go.kr/api/json/getSignalPhaseInfo',
      'https://openapigits.gg.go.kr/api/json/getCITSSignalInfo',
    ];
    const ggParams = new URLSearchParams({
      serviceKey: ggKey,   // TODO: 실제 파라미터명 확인 후 수정
      itstId: intersectionId,
      type: 'json',
    });
    for (const url of GG_SIGNAL_URLS) {
      try {
        const res = await fetch(`${url}?${ggParams}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const rows = data?.response?.body?.items?.item
          ?? data?.items?.item
          ?? data?.data
          ?? [];
        const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
        if (list.length > 0) return NextResponse.json(list[0]);
      } catch { /* 다음 후보 */ }
    }
  }

  // ── 4. 모든 실API 실패 → Mock 시뮬레이션으로 폴백 ───────────────────────────
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
