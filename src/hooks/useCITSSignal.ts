'use client';
import { useEffect, useRef, useState } from 'react';
import { SignalNode, SignalPhase } from '@/types';

interface UseCITSSignalResult {
  signal: SignalNode | null;
  isSafetyWarning: boolean;  // 잔여 5초 이하 경고
  displayText: string;       // VFD 표시용 문자열
}

const SAFETY_MARGIN_SEC = 5;
const POLL_INTERVAL_MS = 2_000;

// 교차로 트리거 존 진입 시에만 신호 API 를 구독/해제 (Sub/Unsub 최적화)
export function useCITSSignal(
  intersectionId: string | null,
  isInTriggerZone: boolean,
  initialSignal?: SignalNode | null,
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

  const isSafetyWarning =
    signal !== null && signal.remainingSeconds <= SAFETY_MARGIN_SEC;

  const displayText = buildDisplayText(signal, isSafetyWarning);

  return { signal, isSafetyWarning, displayText };
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
