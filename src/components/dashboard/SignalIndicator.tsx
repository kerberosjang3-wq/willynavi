'use client';
import { SignalPhase } from '@/types';
import clsx from 'clsx';

interface SignalIndicatorProps {
  phase: SignalPhase | null;
  isSafetyWarning: boolean;
  remainingSeconds: number | null;
  intersectionName?: string;
  approachDir?: string | null;
}

export function SignalIndicator({
  phase,
  isSafetyWarning,
  remainingSeconds,
  intersectionName,
  approachDir,
}: SignalIndicatorProps) {
  const color = phase ? phaseColor(phase) : 'var(--border)';

  return (
    <div className="cyber-panel px-3 py-3 h-full flex flex-col gap-2">
      <div className="flex items-center justify-center gap-1 w-full">
        <span className="font-vfd text-xs truncate" style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
          {intersectionName ?? '신호 없음'}
        </span>
        {approachDir && (
          <span className="font-vfd shrink-0" style={{ fontSize: '0.5rem', color: 'var(--tl-yellow)', letterSpacing: '0.08em' }}>
            {approachDir}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 flex-1">
        <div
          className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl"
          style={{ background: '#0E1018', border: '1px solid var(--border)' }}
        >
          <SignalDot color="red"    active={phase === 'RED'}    pulse={phase === 'RED' && isSafetyWarning} />
          <SignalDot color="yellow" active={phase === 'YELLOW'} pulse={phase === 'YELLOW' && isSafetyWarning} />
          <SignalDot color="green"  active={phase === 'GREEN'}  pulse={false} />
        </div>

        <div className="flex flex-col items-center justify-center gap-0.5">
          {isSafetyWarning ? (
            <span className="font-vfd text-sm text-center safety-warning leading-tight" style={{ maxWidth: 72 }}>
              신호<br />변경주의
            </span>
          ) : (
            <>
              <span
                className="font-display font-black leading-none"
                style={{ fontSize: '3rem', color, textShadow: 'none' }}
              >
                {remainingSeconds !== null && phase !== null
                  ? String(remainingSeconds).padStart(2, '0')
                  : '--'}
              </span>
              <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)' }}>초</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type DotColor = 'red' | 'yellow' | 'green';

const DOT: Record<DotColor, { active: string; dim: string }> = {
  red:    { active: '#FF4A4A', dim: '#1C0808' },
  yellow: { active: '#FFD600', dim: '#1C1800' },
  green:  { active: '#00E676', dim: '#081C10' },
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
        border: `1px solid ${active ? s.active + '44' : '#0d0d0d'}`,
        transition: 'background 0.3s',
      }}
    />
  );
}

function phaseColor(phase: SignalPhase): string {
  switch (phase) {
    case 'GREEN':  return '#00E676';
    case 'YELLOW': return '#FFD600';
    case 'RED':    return '#FF4A4A';
    default:       return 'var(--text-dim)';
  }
}
