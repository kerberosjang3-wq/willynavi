'use client';
import { useEffect, useRef, useState } from 'react';
import { SignalNode, SignalPhase } from '@/types';
import { headingToV2XDir, pickDirectionalRemaining } from '@/utils/geo.utils';

const PHASE_COLOR: Record<SignalPhase, string> = {
  GREEN:   '#00E676',
  YELLOW:  '#FFD600',
  RED:     '#FF4A4A',
  UNKNOWN: 'var(--border)',
};
const PHASE_LABEL: Record<SignalPhase, string> = {
  GREEN:   '녹색',
  YELLOW:  '황색',
  RED:     '적색',
  UNKNOWN: '---',
};

const NEXT_PHASE: Record<string, SignalPhase> = {
  GREEN:   'YELLOW',
  YELLOW:  'RED',
  RED:     'GREEN',
  UNKNOWN: 'UNKNOWN',
};

interface SimState {
  phase: SignalPhase;
  remaining: number;
  cycleSeconds: number;
}

function phaseDuration(phase: SignalPhase, cycle: number): number {
  if (phase === 'YELLOW') return 3;
  if (phase === 'GREEN')  return Math.round(cycle * 0.45);
  if (phase === 'RED')    return Math.round(cycle * 0.45);
  return cycle;
}

const DIR_LABEL: Record<string, string> = { nt: '북향', et: '동향', st: '남향', wt: '서향' };

interface Props {
  signals: SignalNode[];
  isWatching: boolean;
  heading?: number | null;
}

export function SignalListView({ signals, isWatching, heading = null }: Props) {
  const [simMap, setSimMap] = useState<Map<string, SimState>>(() => new Map());
  const prevIdsRef = useRef<string>('');

  useEffect(() => {
    const ids = signals.map((s) => s.id).join(',');
    if (ids === prevIdsRef.current) return;
    prevIdsRef.current = ids;

    const m = new Map<string, SimState>();
    for (const s of signals) {
      const elapsed = Math.floor((Date.now() - s.lastUpdated) / 1000);
      const rem = Math.max(0, s.remainingSeconds - elapsed);
      m.set(s.id, {
        phase:        s.currentPhase !== 'UNKNOWN' ? s.currentPhase : 'RED',
        remaining:    rem,
        cycleSeconds: s.cycleSeconds || 90,
      });
    }
    setSimMap(m);
  }, [signals]);

  useEffect(() => {
    const id = setInterval(() => {
      setSimMap((prev) => {
        const next = new Map(prev);
        for (const [key, st] of next) {
          if (st.phase === 'UNKNOWN') continue;
          const newRem = st.remaining - 1;
          if (newRem <= 0) {
            const nextPhase = NEXT_PHASE[st.phase];
            next.set(key, { ...st, phase: nextPhase, remaining: phaseDuration(nextPhase, st.cycleSeconds) });
          } else {
            next.set(key, { ...st, remaining: newRem });
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!isWatching && signals.length === 0) {
    return (
      <div className="cyber-panel flex items-center gap-2 px-4 py-3">
        <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.08em' }}>GPS 신호 대기 중</span>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="cyber-panel flex items-center gap-2 px-4 py-3">
        <span className="dot-pulse" style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: 'var(--tl-green)', flexShrink: 0,
        }} />
        <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          주변 신호등 탐색 중...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="glass-panel flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: 'var(--tl-green)', letterSpacing: '0.15em' }}>▶ SIGNAL</span>
          <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)' }}>주변 신호등</span>
        </div>
        <span className="font-vfd" style={{ fontSize: '0.65rem', color: 'var(--tl-yellow)' }}>{signals.length}개</span>
      </div>

      <div className="cyber-panel px-3 py-2 flex flex-col" style={{ gap: 0 }}>
        {signals.map((node, idx) => {
          const sim = simMap.get(node.id);
          const phase = sim?.phase ?? node.currentPhase;
          const color = PHASE_COLOR[phase];
          const dist  = node.distance;
          const dirRem = pickDirectionalRemaining(node.directional, heading);
          const rem = dirRem ?? sim?.remaining ?? 0;
          const approachDir = node.directional && heading !== null
            ? DIR_LABEL[headingToV2XDir(heading)] ?? null : null;

          return (
            <div
              key={node.id}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: idx < signals.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: color, transition: 'background 0.3s',
              }} />

              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-vfd text-xs truncate" style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>
                  {node.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-vfd" style={{ fontSize: '0.5rem', color }}>{PHASE_LABEL[phase]}</span>
                  {approachDir && (
                    <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--tl-yellow)' }}>{approachDir}</span>
                  )}
                  {dist !== undefined && (
                    <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>
                      {dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                {phase !== 'UNKNOWN' ? (
                  <>
                    <span className="font-display font-black" style={{ fontSize: '1.4rem', lineHeight: 1, color, transition: 'color 0.3s' }}>
                      {rem}
                    </span>
                    <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--text-dim)' }}>초</span>
                  </>
                ) : (
                  <span className="font-vfd text-xs" style={{ color: 'var(--border)' }}>---</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
