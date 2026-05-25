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
    GREEN:   '#00ee44',
    YELLOW:  '#ffc107',
    RED:     '#ff3333',
    UNKNOWN: '#00d4ff',
  };

  const sigColor = signalPhase ? PHASE_COLOR[signalPhase] : '#00d4ff';

  return (
    <div className="cyber-panel px-4 py-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.2em' }}>
          ROAD NAV
        </span>
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-border)', letterSpacing: '0.1em' }}>
          C-ITS v1.0
        </span>
      </div>

      <div style={{ height: 1, background: 'var(--cyber-border)' }} />

      <NavRow label="NOW" value={currentRoadName} />
      <NavRow label="FWD" value={nextIntersectionName} />

      <div style={{ height: 1, background: 'var(--cyber-border)' }} />

      <div className="flex items-center justify-between pt-0.5">
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.2em' }}>
          SIG
        </span>
        <span
          className={clsx('font-vfd text-xl tracking-widest', isSafetyWarning && 'safety-warning')}
          style={{
            color: isSafetyWarning ? '#ff3333' : sigColor,
            textShadow: isSafetyWarning
              ? '0 0 12px #ff3333, 0 0 24px #cc0000'
              : `0 0 8px ${sigColor}, 0 0 18px ${sigColor}66`,
          }}
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
      <span
        className="font-vfd text-xs w-8 shrink-0"
        style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.15em' }}
      >
        {label}
      </span>
      <span
        className="font-vfd text-sm flex-1 truncate"
        style={{
          color: 'var(--cyber-cyan)',
          textShadow: '0 0 6px #00d4ff66',
          letterSpacing: '0.05em',
        }}
      >
        {value || '---'}
      </span>
    </div>
  );
}
