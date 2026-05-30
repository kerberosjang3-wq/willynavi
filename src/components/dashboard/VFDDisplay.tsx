'use client';
import { SignalPhase } from '@/types';
import clsx from 'clsx';

interface VFDDisplayProps {
  currentRoadName: string;
  nextIntersectionName: string;
  signalText: string;
  signalPhase: SignalPhase | null;
  isSafetyWarning: boolean;
  speedKmh?: number | null;
}

export function VFDDisplay({
  currentRoadName,
  nextIntersectionName,
  signalText,
  signalPhase,
  isSafetyWarning,
}: VFDDisplayProps) {
  const PHASE_COLOR: Record<SignalPhase, string> = {
    GREEN:   '#00E676',
    YELLOW:  '#FFD600',
    RED:     '#FF4A4A',
    UNKNOWN: 'var(--text-dim)',
  };

  const sigColor = signalPhase ? PHASE_COLOR[signalPhase] : 'var(--text-dim)';

  return (
    <div className="cyber-panel px-4 py-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.2em' }}>
          ROAD NAV
        </span>
        <span className="font-vfd text-xs" style={{ color: 'var(--border)', letterSpacing: '0.1em' }}>
          C-ITS v1.0
        </span>
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />

      <NavRow label="NOW" value={currentRoadName} />
      <NavRow label="FWD" value={nextIntersectionName} />

      <div style={{ height: 1, background: 'var(--border)' }} />

      <div className="flex items-center justify-between pt-0.5">
        <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
          신호등 정보
        </span>
        <span
          className={clsx('font-vfd text-xl tracking-widest', isSafetyWarning && 'safety-warning')}
          style={{ color: isSafetyWarning ? '#FF4A4A' : sigColor }}
        >
          {signalText}
        </span>
      </div>
    </div>
  );
}

function NavRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-vfd text-xs w-8 shrink-0" style={{ color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
        {label}
      </span>
      <span className="font-vfd text-sm flex-1 truncate" style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>
        {value || '---'}
      </span>
    </div>
  );
}
