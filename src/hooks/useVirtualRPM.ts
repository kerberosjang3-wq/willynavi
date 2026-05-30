'use client';
import { useEffect, useRef, useState } from 'react';

// Gear table: [minSpeed, maxSpeed, minRPM, maxRPM] (km/h + RPM)
// Shift points: 20 / 40 / 60 / 85 km/h
const GEARS = [
  { minS: 0,   maxS: 20,  minR: 800,  maxR: 6500 },  // 1단
  { minS: 20,  maxS: 40,  minR: 1800, maxR: 6500 },  // 2단
  { minS: 40,  maxS: 60,  minR: 1600, maxR: 6500 },  // 3단
  { minS: 60,  maxS: 85,  minR: 1400, maxR: 6000 },  // 4단
  { minS: 85,  maxS: 220, minR: 1300, maxR: 5500 },  // 5단
] as const;

export const RPM_REDLINE = 6000;
export const RPM_MAX     = 7000;

function getGearIdx(spd: number): number {
  const i = GEARS.findIndex(g => spd < g.maxS);
  return i === -1 ? GEARS.length - 1 : i;
}

function getBaseRPM(spd: number, gi: number): number {
  const g = GEARS[gi];
  const t = Math.max(0, Math.min(1, (spd - g.minS) / (g.maxS - g.minS)));
  return g.minR + t * (g.maxR - g.minR);
}

export interface VirtualRPMState {
  rpm: number;
  gear: number;        // 1–5 (1-indexed)
  isShifting: boolean;
}

export function useVirtualRPM(speedKmh: number | null): VirtualRPMState {
  // Updated every render — RAF loop always sees the latest value
  const speedRef = useRef(0);
  speedRef.current = speedKmh ?? 0;

  const rpmRef      = useRef(800);
  const prevGiRef   = useRef(-1);
  const prevSpdRef  = useRef(0);
  // n = normal, d = drop (just shifted), r = rise (recovering)
  const phaseRef    = useRef<'n' | 'd' | 'r'>('n');
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const extAccelRef = useRef(0); // physical acceleration from DeviceMotionEvent

  const [state, setState] = useState<VirtualRPMState>({ rpm: 800, gear: 1, isShifting: false });

  // DeviceMotionEvent — adds burst to RPM on hard acceleration
  useEffect(() => {
    const handle = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      if (a) extAccelRef.current = Math.hypot(a.x ?? 0, a.y ?? 0);
    };
    window.addEventListener('devicemotion', handle);
    return () => window.removeEventListener('devicemotion', handle);
  }, []);

  // Main RAF animation loop — runs for the lifetime of the component
  useEffect(() => {
    let raf: number;

    const tick = () => {
      const spd    = speedRef.current;
      const gi     = getGearIdx(spd);
      const prevGi = prevGiRef.current;

      // First tick: initialise without triggering a shift
      if (prevGi === -1) {
        prevGiRef.current = gi;
      } else if (gi > prevGi) {
        // Upshift detected: drop → rise → normal
        prevGiRef.current = gi;
        phaseRef.current  = 'd';
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          phaseRef.current = 'r';
          timerRef.current = setTimeout(() => { phaseRef.current = 'n'; }, 320);
        }, 130);
      }

      const spdDelta = Math.max(0, spd - prevSpdRef.current);
      prevSpdRef.current = spd;

      // Gentle idle oscillation when parked / very slow
      const idleSway = spd < 2 ? Math.sin(Date.now() / 320) * 65 : 0;

      // Compute target RPM for this phase
      const phase = phaseRef.current;
      let target: number;
      if (phase === 'd') {
        // RPM drops hard to just above the new gear's floor
        target = GEARS[gi].minR + 350;
      } else if (phase === 'r') {
        // Partial recovery toward normal RPM
        target = getBaseRPM(spd, gi) * 0.62;
      } else {
        target = getBaseRPM(spd, gi)
          + extAccelRef.current * 55  // physical sensor boost
          + spdDelta * 16             // GPS speed surge boost
          + idleSway;                 // engine-idle feel
      }

      target = Math.max(750, Math.min(RPM_MAX, target));

      // Exponential smoothing: fast during drop, gentle otherwise
      const alpha = phase === 'd' ? 0.28 : 0.075;
      rpmRef.current += (target - rpmRef.current) * alpha;

      setState({
        rpm:        Math.round(rpmRef.current),
        gear:       gi + 1,
        isShifting: phase !== 'n',
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
