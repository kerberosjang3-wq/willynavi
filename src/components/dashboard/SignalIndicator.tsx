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
  return (
    <div className="cyber-panel px-3 py-3 flex flex-col items-center justify-between gap-1 h-full">
      <span
        className="font-vfd text-xs truncate w-full text-center"
        style={{ color: 'var(--cyber-border)', letterSpacing: '0.08em' }}
      >
        {intersectionName ?? 'NO SIGNAL'}
      </span>

      <div className="flex gap-3 items-center py-1">
        <SignalDot color="red"    active={phase === 'RED'}    pulse={phase === 'RED' && isSafetyWarning} />
        <SignalDot color="yellow" active={phase === 'YELLOW'} pulse={phase === 'YELLOW' && isSafetyWarning} />
        <SignalDot color="green"  active={phase === 'GREEN'}  pulse={false} />
      </div>

      {isSafetyWarning ? (
        <span className="font-vfd text-sm safety-warning">주의</span>
      ) : remainingSeconds !== null && phase !== null ? (
        <span
          className="font-display text-4xl font-black leading-none"
          style={{
            color: phaseColor(phase),
            textShadow: `0 0 14px ${phaseColor(phase)}, 0 0 28px ${phaseColor(phase)}66`,
          }}
        >
          {String(remainingSeconds).padStart(2, '0')}
        </span>
      ) : (
        <span
          className="font-display text-4xl font-black leading-none"
          style={{ color: 'var(--cyber-border)' }}
        >
          --
        </span>
      )}

      <span className="font-vfd text-xs" style={{ color: 'var(--cyber-border)' }}>
        sec
      </span>
    </div>
  );
}

type DotColor = 'red' | 'yellow' | 'green';

const DOT: Record<DotColor, { active: string; glow: string; dim: string }> = {
  red:    { active: '#ff3333', glow: '#cc0000', dim: '#1a0505' },
  yellow: { active: '#ffc107', glow: '#cc9900', dim: '#1a1505' },
  green:  { active: '#00ee44', glow: '#009933', dim: '#051a0a' },
};

function SignalDot({ color, active, pulse }: { color: DotColor; active: boolean; pulse: boolean }) {
  const s = DOT[color];
  return (
    <div
      className={clsx(active && pulse && 'dot-pulse')}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: active ? s.active : s.dim,
        boxShadow: active ? `0 0 8px ${s.active}, 0 0 18px ${s.glow}` : 'none',
        border: `1px solid ${active ? s.active + '55' : 'var(--cyber-border)'}`,
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
