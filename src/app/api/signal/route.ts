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

  // ── 0. Cloudflare Worker 프록시 (한국 ICN 엣지, 우선 시도) ────────────────
  const cfWorkerUrl = process.env.CF_WORKER_URL;
  if (cfWorkerUrl && intersectionId) {
    try {
      const res = await fetch(
        `${cfWorkerUrl}/signal?id=${encodeURIComponent(intersectionId)}`,
        { cache: 'no-store', signal: AbortSignal.timeout(6000) },
      );
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) return NextResponse.json(data);
      }
    } catch (e) {
      console.error('[SIGNAL] CF Worker 실패:', (e as Error).message);
    }
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

  // ── 2. 서울시 V2X 신호제어기 잔여시간 API (t-data.seoul.go.kr) ──────────────
  const seoulSignalKey = process.env.SEOUL_SIGNAL_KEY;
  if (seoulSignalKey) {
    try {
      const params = new URLSearchParams({
        apikey:     seoulSignalKey,
        pageNum:    '1',
        numOfRows:  intersectionId ? '5' : '100',
        ...(intersectionId ? { itstId: intersectionId } : {}),
      });
      const res = await fetch(
        `https://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseTimingInformation/1.0?${params}`,
        { signal: AbortSignal.timeout(6000), cache: 'no-store' },
      );
      if (res.ok) {
        const list: SeoulV2XSignal[] = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          if (intersectionId) {
            return NextResponse.json(v2xToSignalNode(list[0]));
          }
          return NextResponse.json({ response: { data: list.map(v2xToRawCITS) } });
        }
      }
    } catch { /* 다음 후보 */ }
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

// Mock 카운트다운 시뮬레이션 — 다중 사이클을 정확하게 처리
function simulateCountdown(node: SignalNode): SignalNode {
  const phases = ['GREEN', 'YELLOW', 'RED'] as const;
  type Phase = typeof phases[number];
  const phaseDur = (p: Phase) =>
    p === 'YELLOW' ? 5 : Math.round(node.cycleSeconds * 0.45);

  let current: Phase =
    (node.currentPhase === 'UNKNOWN' ? 'RED' : node.currentPhase) as Phase;
  let remaining = node.remainingSeconds;
  let toConsume = Math.floor((Date.now() - node.lastUpdated) / 1000);

  // 경과 시간만큼 사이클을 반복 전진
  while (toConsume >= remaining) {
    toConsume -= remaining;
    current = phases[(phases.indexOf(current) + 1) % 3];
    remaining = phaseDur(current);
  }

  return { ...node, currentPhase: current, remainingSeconds: remaining - toConsume };
}

// ── 서울 V2X 신호 API 타입 및 변환 ────────────────────────────────────────────
interface SeoulV2XSignal {
  itstId: string;
  trsmTm: string; // HHMMSS
  ntStsgRmdrCs: number | null; // 북 직진 잔여 (deciseconds)
  etStsgRmdrCs: number | null;
  stStsgRmdrCs: number | null;
  wtStsgRmdrCs: number | null;
  ntPdsgRmdrCs: number | null; // 북 보행자
  etPdsgRmdrCs: number | null;
  stPdsgRmdrCs: number | null;
  wtPdsgRmdrCs: number | null;
}

// deciseconds → seconds 변환 (null이면 undefined)
function ds(v: number | null): number | undefined {
  return v !== null && v > 0 ? Math.round(v / 10) : undefined;
}

// 방향별 잔여시간 추출
function v2xDirectional(s: SeoulV2XSignal) {
  return {
    nt: ds(s.ntStsgRmdrCs),
    et: ds(s.etStsgRmdrCs),
    st: ds(s.stStsgRmdrCs),
    wt: ds(s.wtStsgRmdrCs),
  };
}

// 활성 방향 중 최솟값 → 종합 잔여시간
function v2xRemainingSeconds(s: SeoulV2XSignal): number {
  const vals = [s.ntStsgRmdrCs, s.etStsgRmdrCs, s.stStsgRmdrCs, s.wtStsgRmdrCs]
    .filter((v): v is number => v !== null && v > 0);
  if (vals.length === 0) return 0;
  return Math.round(Math.min(...vals) / 10);
}

// V2X SPAT는 현시 phase를 직접 제공하지 않음 → 활성 방향 유무로 추정
function v2xPhase(s: SeoulV2XSignal): 'GREEN' | 'YELLOW' | 'RED' {
  const sec = v2xRemainingSeconds(s);
  if (sec <= 3) return 'YELLOW';
  const hasActive = [s.ntStsgRmdrCs, s.etStsgRmdrCs, s.stStsgRmdrCs, s.wtStsgRmdrCs]
    .some((v) => v !== null && v > 0);
  return hasActive ? 'GREEN' : 'RED';
}

function v2xToSignalNode(s: SeoulV2XSignal): Partial<SignalNode> {
  return {
    intersectionId:  s.itstId,
    currentPhase:    v2xPhase(s),
    remainingSeconds: v2xRemainingSeconds(s),
    cycleSeconds:    90,
    lastUpdated:     Date.now(),
    directional:     v2xDirectional(s),
  };
}

function v2xToRawCITS(s: SeoulV2XSignal) {
  const phase = v2xPhase(s);
  return {
    itstId:       s.itstId,
    intrsctNm:    `교차로 ${s.itstId}`,
    lat:          '0',
    lon:          '0',
    ntPdsgStatNm: phase === 'GREEN' ? '녹색' : phase === 'YELLOW' ? '황색' : '적색',
    remainSec:    String(v2xRemainingSeconds(s)),
    cycleSec:     '90',
  };
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
