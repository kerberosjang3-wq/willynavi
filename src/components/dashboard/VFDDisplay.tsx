'use client';
import { SignalPhase } from '@/types';
import clsx from 'clsx';

interface VFDDisplayProps {
  currentRoadName: string;
  nextIntersectionName: string;
  signalText: string;        // "GRN 24s" | "신호 변경 주의" | "신호 없음"
  signalPhase: SignalPhase | null;
  isSafetyWarning: boolean;
  speedKmh: number | null;
}

// ─── VFD (진공형광디스플레이) 스타일 대시보드 패널 ────────────────────────────
export function VFDDisplay({
  currentRoadName,
  nextIntersectionName,
  signalText,
  signalPhase,
  isSafetyWarning,
  speedKmh,
}: VFDDisplayProps) {
  const phaseColor: Record<SignalPhase, string> = {
    GREEN:   'text-green-400',
    YELLOW:  'text-yellow-300',
    RED:     'text-red-400',
    UNKNOWN: 'text-vfd-glow',
  };

  const signalColor = signalPhase ? phaseColor[signalPhase] : 'text-vfd-glow';

  return (
    <div className="vfd-housing rounded-xl p-1 shadow-2xl" style={{ background: 'linear-gradient(145deg, #1c2b1e, #0d150e)', border: '2px solid #2a3d2c' }}>
      {/* 베젤 스크루 장식 */}
      <div className="flex justify-between px-2 pt-1 pb-0">
        <Screw /><Screw />
      </div>

      {/* 스크린 */}
      <div
        className="rounded-lg mx-1 mb-1 px-4 py-3 space-y-2"
        style={{
          background: '#030a07',
          boxShadow: 'inset 0 0 24px rgba(0,0,0,0.9), inset 0 0 4px rgba(0,255,136,0.05)',
          border: '1px solid #0d1a0f',
        }}
      >
        {/* 브랜드 레이블 */}
        <div className="flex justify-between items-center mb-1">
          <span className="font-vfd text-xs" style={{ color: '#004422', letterSpacing: '0.3em' }}>
            WILLY-NAVI
          </span>
          <span className="font-vfd text-xs" style={{ color: '#004422' }}>
            GPS ACTIVE
          </span>
        </div>

        {/* 라인 1: 현재 도로명 */}
        <VFDLine label="NOW" value={currentRoadName} />

        {/* 라인 2: 전방 교차로 */}
        <VFDLine label="FWD" value={nextIntersectionName} />

        {/* 구분선 */}
        <div style={{ height: 1, background: '#0a2010', margin: '4px 0' }} />

        {/* 라인 3: 신호 정보 (핵심) */}
        <div className="flex items-center justify-between">
          <span className="font-vfd text-xs" style={{ color: '#004422', letterSpacing: '0.15em' }}>
            SIG
          </span>
          <span
            className={clsx(
              'font-vfd text-2xl tracking-widest',
              signalColor,
              isSafetyWarning && 'animate-flicker',
              !isSafetyWarning && 'animate-pulse_glow',
            )}
            style={{
              textShadow: isSafetyWarning
                ? '0 0 12px #ff4400, 0 0 24px #ff2200'
                : undefined,
            }}
          >
            {signalText}
          </span>
        </div>

        {/* 속도 */}
        <div className="flex justify-end items-baseline gap-1 pt-1">
          <span
            className="font-vfd text-3xl font-bold"
            style={{ color: '#00ff88', textShadow: '0 0 8px #00ff88, 0 0 20px #00cc66' }}
          >
            {speedKmh !== null ? String(Math.round(speedKmh)).padStart(3, ' ') : '---'}
          </span>
          <span className="font-vfd text-xs" style={{ color: '#004422' }}>km/h</span>
        </div>
      </div>

      {/* 하단 스크루 */}
      <div className="flex justify-between px-2 pb-1 pt-0">
        <Screw /><Screw />
      </div>
    </div>
  );
}

// VFD 한 라인 (레이블 + 값)
function VFDLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-vfd text-xs w-8 shrink-0"
        style={{ color: '#004422', letterSpacing: '0.15em' }}
      >
        {label}
      </span>
      {/* 어두운 "꺼진 세그먼트" 배경 텍스트 */}
      <div className="relative flex-1 overflow-hidden">
        <span
          className="font-vfd text-sm absolute inset-0 truncate"
          style={{ color: '#021a0e', letterSpacing: '0.05em' }}
          aria-hidden
        >
          {'█'.repeat(24)}
        </span>
        <span
          className="font-vfd text-sm relative truncate block"
          style={{
            color: '#00ff88',
            textShadow: '0 0 8px #00ff88, 0 0 16px #00cc66',
            letterSpacing: '0.05em',
          }}
        >
          {value || '---'}
        </span>
      </div>
    </div>
  );
}

// 스큐어모피즘 스크루 장식
function Screw() {
  return (
    <div
      className="w-3 h-3 rounded-full"
      style={{
        background: 'radial-gradient(circle at 35% 35%, #666, #222)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.15)',
      }}
    >
      {/* 스크루 홈 */}
      <div
        className="w-full h-px mt-1"
        style={{ background: 'rgba(0,0,0,0.6)', transform: 'rotate(45deg)', transformOrigin: 'center' }}
      />
    </div>
  );
}
