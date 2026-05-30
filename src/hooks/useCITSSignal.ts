'use client';
import { useEffect, useRef, useState } from 'react';
import { SignalNode, SignalPhase } from '@/types';
import { headingToV2XDir, pickDirectionalRemaining } from '@/utils/geo.utils';

interface UseCITSSignalResult {
  signal: SignalNode | null;
  isSafetyWarning: boolean;
  displayText: string;
  approachDir: string | null; // 접근 방향 레이블 (북향/동향/남향/서향)
}

const SAFETY_MARGIN_SEC = 5;
const POLL_INTERVAL_MS = 2_000;
const DIR_LABEL: Record<string, string> = { nt: '북향', et: '동향', st: '남향', wt: '서향' };

// heading으로 방향별 잔여시간을 선택해 signal을 보정
function applyDirectional(node: SignalNode, heading: number | null): SignalNode {
  if (!node.directional || heading === null) return node;
  const rem = pickDirectionalRemaining(node.directional, heading);
  if (rem === undefined) return node;
  // 잔여시간 3초 이하 → YELLOW, 0이면 RED, 나머지 → GREEN
  const phase = rem <= 3 ? 'YELLOW' : rem > 0 ? 'GREEN' : 'RED';
  return { ...node, remainingSeconds: rem, currentPhase: phase };
}

export function useCITSSignal(
  intersectionId: string | null,
  isInTriggerZone: boolean,
  initialSignal?: SignalNode | null,
  heading?: number | null,
): UseCITSSignalResult {
  const [signal, setSignal] = useState<SignalNode | null>(initialSignal ?? null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    stop();

    if (!intersectionId || !isInTriggerZone) {
      setSignal(initialSignal ?? null);
      return;
    }

    // 트리거 존 진입 → 폴링 시작
    const poll = async () => {
      try {
        const res = await fetch(`/api/signal?id=${intersectionId}`);
        if (!res.ok) return;
        const data: SignalNode = await res.json();
        setSignal(data);
      } catch {
        // 네트워크 실패 시 기존 상태 유지
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return stop;
  }, [intersectionId, isInTriggerZone]); // eslint-disable-line react-hooks/exhaustive-deps

  // initialSignal 이 외부에서 바뀌면 동기화 (트리거 존 밖일 때)
  useEffect(() => {
    if (!isInTriggerZone) setSignal(initialSignal ?? null);
  }, [initialSignal, isInTriggerZone]);

  // heading이 있고 V2X 방향 데이터가 있으면 접근 방향 신호 보정
  const h = heading ?? null;
  const directedSignal = signal ? applyDirectional(signal, h) : null;
  const approachDir = signal?.directional && h !== null
    ? DIR_LABEL[headingToV2XDir(h)] ?? null
    : null;

  const isSafetyWarning =
    directedSignal !== null && directedSignal.remainingSeconds <= SAFETY_MARGIN_SEC;

  const displayText = buildDisplayText(directedSignal, isSafetyWarning);

  return { signal: directedSignal, isSafetyWarning, displayText, approachDir };
}

function buildDisplayText(signal: SignalNode | null, safetyWarning: boolean): string {
  if (!signal) return '신호등 정보없음';
  if (safetyWarning) return '신호 변경 주의';

  const phaseName: Record<SignalPhase, string> = {
    GREEN:   '녹색',
    YELLOW:  '황색',
    RED:     '적색',
    UNKNOWN: '알수없음',
  };

  const name = phaseName[signal.currentPhase];
  const sec = String(signal.remainingSeconds).padStart(2, '0');
  return `${name} ${sec}초`;
}
