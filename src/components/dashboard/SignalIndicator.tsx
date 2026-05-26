'use client';
import { SignalPhase } from '@/types';
import clsx from 'clsx';

interface SignalIndicatorProps {
  phase: SignalPhase | null;
  isSafetyWarning: boolean;
  remainingSeconds: number | null;
  intersectionName?: string;
}

export function SignalIndicator({
  phase,
  isSafetyWarning,
  remainingSeconds,
  intersectionName,
}: SignalIndicatorProps) {
  const color = phase ? phaseColor(phase) : 'var(--cyber-border)';

  return (
    <div className="cyber-panel px-3 py-3 h-full flex flex-col gap-2">
      {/* 교차로명 */}
      <span
        className="font-vfd text-xs truncate text-center w-full"
        style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.06em' }}
      >
        {intersectionName ?? '신호 없음'}
      </span>

      {/* 신호등 + 카운트다운 */}
      <div className="flex items-center justify-center gap-3 flex-1">
        {/* 세로 신호등 하우징 */}
        <div
          className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl"
          style={{
            background: '#080808',
            border: '1px solid var(--cyber-border)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          <SignalDot color="red"    active={phase === 'RED'}    pulse={phase === 'RED' && isSafetyWarning} />
          <SignalDot color="yellow" active={phase === 'YELLOW'} pulse={phase === 'YELLOW' && isSafetyWarning} />
          <SignalDot color="green"  active={phase === 'GREEN'}  pulse={false} />
        </div>

        {/* 카운트다운 */}
        <div className="flex flex-col items-center justify-center gap-0.5">
          {isSafetyWarning ? (
            <span
              className="font-vfd text-sm text-center safety-warning leading-tight"
              style={{ maxWidth: 72 }}
            >
              신호<br />변경주의
            </span>
          ) : (
            <>
              <span
                className="font-display font-black leading-none"
                style={{
                  fontSize: '3rem',
                  color,
                  textShadow: phase ? `0 0 14px ${color}, 0 0 28px ${color}66` : 'none',
                }}
              >
                {remainingSeconds !== null && phase !== null
                  ? String(remainingSeconds).padStart(2, '0')
                  : '--'}
              </span>
              <span className="font-vfd text-xs" style={{ color: 'var(--cyber-border)' }}>
                초
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type DotColor = 'red' | 'yellow' | 'green';

const DOT: Record<DotColor, { active: string; glow: string; dim: string }> = {
  red:    { active: '#ff3333', glow: '#cc0000', dim: '#1c0505' },
  yellow: { active: '#ffc107', glow: '#cc9900', dim: '#1c1505' },
  green:  { active: '#00ee44', glow: '#009933', dim: '#051c0a' },
};

function SignalDot({ color, active, pulse }: { color: DotColor; active: boolean; pulse: boolean }) {
  const s = DOT[color];
  return (
    <div
      className={clsx(active && pulse && 'dot-pulse')}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: active ? s.active : s.dim,
        boxShadow: active
          ? `0 0 10px ${s.active}, 0 0 22px ${s.glow}, inset 0 1px 2px rgba(255,255,255,0.2)`
          : 'inset 0 1px 3px rgba(0,0,0,0.8)',
        border: `1px solid ${active ? s.active + '66' : '#0d0d0d'}`,
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    />
  );
}

function phaseColor(phase: SignalPhase): string {
  switch (phase) {
    case 'GREEN':  return '#00ee44';
    case 'YELLOW': return '#ffc107';
    case 'RED':    return '#ff3333';
    default:       return '#00d4ff';
  }
}
