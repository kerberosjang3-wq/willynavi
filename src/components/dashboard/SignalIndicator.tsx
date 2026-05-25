'use client';
import { SignalPhase } from '@/types';
import clsx from 'clsx';

interface SignalIndicatorProps {
  phase: SignalPhase | null;
  isSafetyWarning: boolean;
  remainingSeconds: number | null;
  intersectionName?: string;
}

// ─── 스큐어모피즘 신호등 인디케이터 램프 패널 ─────────────────────────────────
export function SignalIndicator({
  phase,
  isSafetyWarning,
  remainingSeconds,
  intersectionName,
}: SignalIndicatorProps) {
  return (
    <div
      className="rounded-2xl p-4 shadow-2xl"
      style={{
        background: 'linear-gradient(160deg, #1e1e28 0%, #12121a 100%)',
        border: '2px solid #2a2a3a',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* 교차로 이름 */}
      {intersectionName && (
        <p
          className="font-vfd text-xs text-center mb-3 truncate"
          style={{ color: '#004422', letterSpacing: '0.1em' }}
        >
          {intersectionName}
        </p>
      )}

      {/* 3개 램프 */}
      <div className="flex justify-center items-center gap-6">
        <Lamp color="red"    active={phase === 'RED'}    pulse={phase === 'RED' && isSafetyWarning} />
        <Lamp color="yellow" active={phase === 'YELLOW'} pulse={phase === 'YELLOW' && isSafetyWarning} />
        <Lamp color="green"  active={phase === 'GREEN'}  pulse={false} />
      </div>

      {/* 잔여 시간 표시 */}
      <div className="mt-4 text-center">
        {isSafetyWarning ? (
          <span
            className="font-vfd text-base animate-flicker"
            style={{ color: '#ff4400', textShadow: '0 0 10px #ff4400' }}
          >
            신호 변경 주의
          </span>
        ) : remainingSeconds !== null && phase !== null ? (
          <span
            className="font-vfd text-2xl"
            style={{
              color: phaseGlowColor(phase),
              textShadow: `0 0 10px ${phaseGlowColor(phase)}`,
            }}
          >
            {String(remainingSeconds).padStart(2, '0')}s
          </span>
        ) : (
          <span className="font-vfd text-sm" style={{ color: '#2a2a3a' }}>
            -- s
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 개별 램프 ─────────────────────────────────────────────────────────────────
type LampColor = 'red' | 'yellow' | 'green';

interface LampProps {
  color: LampColor;
  active: boolean;
  pulse: boolean;
}

const LAMP_STYLES: Record<LampColor, { on: string; glow: string; dim: string }> = {
  red:    { on: 'radial-gradient(circle at 35% 30%, #ff8888, #cc0000)', glow: '#ff2200', dim: '#2a0000' },
  yellow: { on: 'radial-gradient(circle at 35% 30%, #ffe066, #ccaa00)', glow: '#ffcc00', dim: '#2a2200' },
  green:  { on: 'radial-gradient(circle at 35% 30%, #88ff88, #00cc00)', glow: '#00ee00', dim: '#002200' },
};

function Lamp({ color, active, pulse }: LampProps) {
  const s = LAMP_STYLES[color];

  return (
    <div
      className="relative"
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        // 하우징 (오목한 소켓 느낌)
        background: 'radial-gradient(circle at 40% 40%, #333, #1a1a1a)',
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8), 0 2px 4px rgba(255,255,255,0.04)',
        padding: 6,
      }}
    >
      {/* 유리 구 */}
      <div
        className={clsx(pulse && 'animate-lamp_pulse')}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: active ? s.on : s.dim,
          boxShadow: active
            ? `0 0 16px ${s.glow}, 0 0 32px ${s.glow}66, inset 0 0 8px rgba(255,255,255,0.15)`
            : 'inset 0 2px 4px rgba(0,0,0,0.6)',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        {/* 하이라이트 (유리 광택) */}
        {active && (
          <div
            style={{
              position: 'absolute',
              top: '18%',
              left: '22%',
              width: '35%',
              height: '28%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              filter: 'blur(2px)',
            }}
          />
        )}
      </div>
    </div>
  );
}

function phaseGlowColor(phase: SignalPhase): string {
  switch (phase) {
    case 'GREEN':  return '#00ee00';
    case 'YELLOW': return '#ffcc00';
    case 'RED':    return '#ff2200';
    default:       return '#00ff88';
  }
}
