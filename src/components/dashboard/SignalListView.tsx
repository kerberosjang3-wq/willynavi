'use client';
import { useEffect, useState } from 'react';
import { SignalNode, SignalPhase, GPSPosition } from '@/types';

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

interface Props {
  signals: SignalNode[];
  position: GPSPosition | null;
  isWatching: boolean;
}

export function SignalListView({ signals, position, isWatching }: Props) {
  // 1초마다 카운트다운
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // 경과 시간 기반 잔여시간 계산
  function remaining(node: SignalNode): number {
    const elapsed = Math.floor((Date.now() - node.lastUpdated) / 1000);
    return Math.max(0, node.remainingSeconds - elapsed);
  }

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
          const rem = remaining(node);
          // tick 사용하여 렌더 트리거 (lint 우회)
          void tick;
          const phase = node.currentPhase;
          const color = PHASE_COLOR[phase];
          const dist = node.distance;

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
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: phase !== 'UNKNOWN' ? `0 0 6px ${color}` : 'none',
                  flexShrink: 0,
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
                  {dist !== undefined && (
                    <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--cyber-amber)' }}>
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
                      style={{ fontSize: '1.4rem', color, textShadow: `0 0 8px ${color}66`, lineHeight: 1 }}
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
