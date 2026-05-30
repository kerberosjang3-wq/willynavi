'use client';
import { useEffect, useRef, useState } from 'react';
import { SignalNode, SignalPhase } from '@/types';
import { headingToV2XDir, pickDirectionalRemaining } from '@/utils/geo.utils';

const PHASE_COLOR: Record<SignalPhase, string> = {
  GREEN:   '#00ff88',
  YELLOW:  '#ffcc00',
  RED:     '#ff3344',
  UNKNOWN: 'var(--cyber-border)',
};
const PHASE_LABEL: Record<SignalPhase, string> = {
  GREEN:   '녹색',
  YELLOW:  '황색',
  RED:     '적색',
  UNKNOWN: '---',
};

// GREEN → YELLOW → RED → GREEN ...
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
  heading?: number | null; // GPS 진행 방향
}

export function SignalListView({ signals, isWatching, heading = null }: Props) {
  // 신호별 로컬 시뮬레이션 상태
  const [simMap, setSimMap] = useState<Map<string, SimState>>(() => new Map());
  const prevIdsRef = useRef<string>('');

  // signals가 바뀌면(새 목록 수신) 시뮬레이션 상태 초기화
  useEffect(() => {
    const ids = signals.map((s) => s.id).join(',');
    if (ids === prevIdsRef.current) return;
    prevIdsRef.current = ids;

    const m = new Map<string, SimState>();
    for (const s of signals) {
      const elapsed = Math.floor((Date.now() - s.lastUpdated) / 1000);
      const rem = Math.max(0, s.remainingSeconds - elapsed);
      m.set(s.id, {
        phase:         s.currentPhase !== 'UNKNOWN' ? s.currentPhase : 'RED',
        remaining:     rem,
        cycleSeconds:  s.cycleSeconds || 90,
      });
    }
    setSimMap(m);
  }, [signals]);

  // 1초 티커 — 카운트다운 + 위상 전환
  useEffect(() => {
    const id = setInterval(() => {
      setSimMap((prev) => {
        const next = new Map(prev);
        for (const [key, st] of next) {
          if (st.phase === 'UNKNOWN') continue;
          const newRem = st.remaining - 1;
          if (newRem <= 0) {
            const nextPhase = NEXT_PHASE[st.phase];
            next.set(key, {
              ...st,
              phase:     nextPhase,
              remaining: phaseDuration(nextPhase, st.cycleSeconds),
            });
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
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.08em' }}>
          GPS 신호 대기 중
        </span>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="cyber-panel flex items-center gap-2 px-4 py-3">
        <span
          className="dot-pulse"
          style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#00ff88', boxShadow: '0 0 6px #00ff88', flexShrink: 0,
          }}
        />
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.08em' }}>
          주변 신호등 탐색 중...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {/* 헤더 */}
      <div className="glass-panel flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: 'var(--cyber-cyan)', letterSpacing: '0.15em' }}>
            ▶ SIGNAL
          </span>
          <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)' }}>
            주변 신호등
          </span>
        </div>
        <span className="font-vfd" style={{ fontSize: '0.65rem', color: 'var(--cyber-amber)' }}>
          {signals.length}개
        </span>
      </div>

      {/* 신호등 목록 */}
      <div className="cyber-panel px-3 py-2 flex flex-col" style={{ gap: 0 }}>
        {signals.map((node, idx) => {
          const sim = simMap.get(node.id);
          const phase = sim?.phase ?? node.currentPhase;
          const color = PHASE_COLOR[phase];
          const dist  = node.distance;

          // V2X 방향 데이터가 있으면 진행 방향 기반 잔여시간 우선 사용
          const dirRem = pickDirectionalRemaining(node.directional, heading);
          const rem = dirRem ?? sim?.remaining ?? 0;
          const approachDir = node.directional && heading !== null
            ? DIR_LABEL[headingToV2XDir(heading)] ?? null
            : null;

          return (
            <div
              key={node.id}
              className="flex items-center gap-3 py-2"
              style={{
                borderBottom: idx < signals.length - 1 ? '1px solid var(--cyber-border)' : 'none',
              }}
            >
              {/* 신호 색상 도트 */}
              <div
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: color,
                  boxShadow: phase !== 'UNKNOWN' ? `0 0 7px ${color}` : 'none',
                  flexShrink: 0,
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              />

              {/* 교차로명 */}
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className="font-vfd text-xs truncate"
                  style={{ color: 'var(--cyber-cyan)', letterSpacing: '0.05em' }}
                >
                  {node.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-vfd" style={{ fontSize: '0.5rem', color }}>
                    {PHASE_LABEL[phase]}
                  </span>
                  {approachDir && (
                    <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--cyber-amber)' }}>
                      {approachDir}
                    </span>
                  )}
                  {dist !== undefined && (
                    <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--cyber-cyan-dim)' }}>
                      {dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`}
                    </span>
                  )}
                </div>
              </div>

              {/* 잔여시간 */}
              <div className="flex flex-col items-end shrink-0">
                {phase !== 'UNKNOWN' ? (
                  <>
                    <span
                      className="font-display font-black"
                      style={{
                        fontSize: '1.4rem', lineHeight: 1,
                        color,
                        textShadow: `0 0 8px ${color}66`,
                        transition: 'color 0.3s',
                      }}
                    >
                      {rem}
                    </span>
                    <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--cyber-cyan-dim)' }}>
                      초
                    </span>
                  </>
                ) : (
                  <span className="font-vfd text-xs" style={{ color: 'var(--cyber-border)' }}>---</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
