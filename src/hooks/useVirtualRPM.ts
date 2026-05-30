'use client';
import { useEffect, useRef, useState } from 'react';

// Gear table: [minSpeed, maxSpeed, minRPM, maxRPM] (km/h + RPM)
const GEARS = [
  { minS: 0,   maxS: 20,  minR: 800,  maxR: 6500 },  // 1단
  { minS: 20,  maxS: 40,  minR: 1800, maxR: 6500 },  // 2단
  { minS: 40,  maxS: 60,  minR: 1600, maxR: 6500 },  // 3단
  { minS: 60,  maxS: 85,  minR: 1400, maxR: 6000 },  // 4단
  { minS: 85,  maxS: 220, minR: 1300, maxR: 5500 },  // 5단
] as const;

export const RPM_REDLINE = 6000;
export const RPM_MAX     = 7000;

const IDLE_BASE = 850;

function getGearIdx(spd: number): number {
  const i = GEARS.findIndex(g => spd < g.maxS);
  return i === -1 ? GEARS.length - 1 : i;
}

function getBaseRPM(spd: number, gi: number): number {
  const g = GEARS[gi];
  const t = Math.max(0, Math.min(1, (spd - g.minS) / (g.maxS - g.minS)));
  return g.minR + t * (g.maxR - g.minR);
}

// 이중 사인파: 주기 750ms + 하모닉 1900ms → 자연스러운 엔진 아이들
function idleOscillation(t: number, amp: number): number {
  return Math.sin(t / 750) * amp * 0.72 + Math.sin(t / 1900) * amp * 0.28;
}

export interface VirtualRPMState {
  rpm: number;
  gear: number;
  isShifting: boolean;
  hasSpeed: boolean; // GPS 속도 데이터 유무
}

export function useVirtualRPM(speedKmh: number | null): VirtualRPMState {
  // null 자체를 저장해 "GPS 없음" 과 "정지(0)" 를 구분
  const speedRef = useRef<number | null>(speedKmh);
  speedRef.current = speedKmh;

  const rpmRef      = useRef(IDLE_BASE);
  const prevGiRef   = useRef(-1);
  const prevSpdRef  = useRef(0);
  const phaseRef    = useRef<'n' | 'd' | 'r'>('n');
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const extAccelRef = useRef(0);

  const [state, setState] = useState<VirtualRPMState>({
    rpm: IDLE_BASE, gear: 1, isShifting: false, hasSpeed: false,
  });

  useEffect(() => {
    const handle = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      if (a) extAccelRef.current = Math.hypot(a.x ?? 0, a.y ?? 0);
    };
    window.addEventListener('devicemotion', handle);
    return () => window.removeEventListener('devicemotion', handle);
  }, []);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const rawSpd  = speedRef.current;
      const hasSpeed = rawSpd !== null;
      const spd     = rawSpd ?? 0;
      const t       = Date.now();

      const gi     = getGearIdx(spd);
      const prevGi = prevGiRef.current;

      if (prevGi === -1) {
        prevGiRef.current = gi;
      } else if (gi !== prevGi) {
        // 업/다운시프트 모두 drop→rise→normal
        const isUp = gi > prevGi;
        prevGiRef.current = gi;
        phaseRef.current  = 'd';
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          phaseRef.current = 'r';
          timerRef.current = setTimeout(
            () => { phaseRef.current = 'n'; },
            isUp ? 320 : 180,
          );
        }, isUp ? 130 : 70);
      }

      const spdDelta  = spd - prevSpdRef.current;
      const accelBoost = Math.max(0, spdDelta) * 16;
      prevSpdRef.current = spd;

      // GPS 없음(null) → 진동 없이 고정 아이들
      // 정지(0) → 선명한 아이들 진동, 0→8 km/h 구간에서 페이드아웃
      const idleFade = spd < 8 ? (8 - spd) / 8 : 0;
      const idleAmp  = hasSpeed ? 320 * idleFade : 0;
      const idleSway = idleOscillation(t, idleAmp);

      const phase = phaseRef.current;
      let target: number;
      if (phase === 'd') {
        target = GEARS[gi].minR + 350;
      } else if (phase === 'r') {
        target = getBaseRPM(spd, gi) * 0.62;
      } else {
        target = getBaseRPM(spd, gi)
          + extAccelRef.current * 55
          + accelBoost
          + idleSway;
      }

      target = Math.max(750, Math.min(RPM_MAX, target));

      // GPS 없으면 더 느리게 추적
      const alpha = phase === 'd' ? 0.28 : hasSpeed ? 0.075 : 0.04;
      rpmRef.current += (target - rpmRef.current) * alpha;

      setState({
        rpm:        Math.round(rpmRef.current),
        gear:       gi + 1,
        isShifting: phase !== 'n',
        hasSpeed,
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
