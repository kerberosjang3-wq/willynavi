'use client';
import { useState } from 'react';
import { SignalPhase, CCTVNode } from '@/types';
import { CCTVPanel } from './CCTVPanel';
import { SpeedCameraWidget } from './SpeedCameraWidget';
import { SpeedCamera } from '@/hooks/useSpeedCamera';

interface DriveModeViewProps {
  phase: SignalPhase | null;
  remainingSeconds: number | null;
  isSafetyWarning: boolean;
  intersectionName?: string;
  approachDir: string | null;
  cycleSeconds: number;
  speedKmh: number | null;
  activeCCTVs: CCTVNode[];
  camera: SpeedCamera | null;
}

const PHASE_COLOR: Record<string, string> = {
  GREEN:   '#00E676',
  YELLOW:  '#FFD600',
  RED:     '#FF4A4A',
  UNKNOWN: '#252836',
};

const PHASE_GLOW: Record<string, string> = {
  GREEN:   'rgba(0,230,118,0.08)',
  YELLOW:  'rgba(255,214,0,0.08)',
  RED:     'rgba(255,74,74,0.12)',
  UNKNOWN: 'transparent',
};

function phaseDuration(phase: SignalPhase, cycleSeconds: number): number {
  if (phase === 'YELLOW') return 3;
  if (phase === 'GREEN' || phase === 'RED') return Math.round(cycleSeconds * 0.45);
  return cycleSeconds;
}

// SVG 원형 프로그레스 링
function ProgressRing({
  phase,
  remaining,
  cycleSeconds,
  isSafetyWarning,
  intersectionName,
  approachDir,
}: {
  phase: SignalPhase | null;
  remaining: number | null;
  cycleSeconds: number;
  isSafetyWarning: boolean;
  intersectionName?: string;
  approachDir: string | null;
}) {
  const SIZE = 240;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;

  const color = phase ? (PHASE_COLOR[phase] ?? PHASE_COLOR.UNKNOWN) : PHASE_COLOR.UNKNOWN;
  const total = phase && phase !== 'UNKNOWN' ? phaseDuration(phase, cycleSeconds) : cycleSeconds;
  const ratio = (remaining != null && total > 0) ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const dashOffset = CIRC * (1 - ratio);
  const isBlinking = (remaining ?? 0) <= 5 && (remaining ?? 0) > 0 && phase !== 'UNKNOWN';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE} height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* 배경 링 */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#252836" strokeWidth={STROKE} />
          {/* 프로그레스 링 */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke={color} strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s' }}
          />
        </svg>

        {/* 내부 컨텐츠 */}
        <div className="flex flex-col items-center justify-center z-10 gap-0.5">
          <span
            className={`font-display font-black ${isBlinking ? 'count-blink' : ''}`}
            style={{ fontSize: '5.5rem', color, lineHeight: 1, transition: 'color 0.3s' }}
          >
            {remaining !== null && phase !== null && phase !== 'UNKNOWN'
              ? remaining
              : '--'}
          </span>
          <span className="font-vfd text-sm" style={{ color: 'var(--text-dim)' }}>초</span>
          {phase && phase !== 'UNKNOWN' && (
            <span className="font-vfd text-xs mt-1" style={{ color, fontSize: '0.6rem', letterSpacing: '0.15em' }}>
              {phase === 'GREEN' ? '● 녹색' : phase === 'YELLOW' ? '● 황색' : '● 적색'}
            </span>
          )}
        </div>
      </div>

      {/* 교차로명 */}
      <div className="flex items-center gap-2">
        <span className="font-vfd text-xs text-center" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em', maxWidth: 280 }}>
          {intersectionName ?? '신호등 정보 없음'}
        </span>
        {approachDir && (
          <span className="font-vfd text-xs" style={{ color: 'var(--tl-yellow)', fontSize: '0.55rem' }}>
            {approachDir}
          </span>
        )}
      </div>
    </div>
  );
}

export function DriveModeView({
  phase,
  remainingSeconds,
  isSafetyWarning,
  intersectionName,
  approachDir,
  cycleSeconds,
  speedKmh,
  activeCCTVs,
  camera,
}: DriveModeViewProps) {
  const [showCCTV, setShowCCTV] = useState(false);
  const [cctvIndex, setCctvIndex] = useState(0);

  const bgGlow = phase ? (PHASE_GLOW[phase] ?? 'transparent') : 'transparent';
  const nearestCCTV = activeCCTVs[cctvIndex] ?? null;
  const nearestDist = nearestCCTV?.distance;

  return (
    <div className="flex flex-col" style={{ gap: 0, minHeight: '80dvh' }}>

      {/* ── 상단 50%: 신호 HUD ────────────────────────────────────────── */}
      <div
        className="signal-bg-transition flex flex-col items-center justify-center py-6 rounded-xl"
        style={{
          flex: '0 0 auto',
          minHeight: '48dvh',
          background: `radial-gradient(ellipse at center, ${bgGlow} 0%, transparent 65%), var(--bg-surface)`,
          border: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {/* 안전 경고 오버레이 */}
        {isSafetyWarning && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ border: '2px solid var(--tl-red)', opacity: 0.5 }}
          />
        )}

        <ProgressRing
          phase={phase}
          remaining={remainingSeconds}
          cycleSeconds={cycleSeconds}
          isSafetyWarning={isSafetyWarning}
          intersectionName={intersectionName}
          approachDir={approachDir}
        />
      </div>

      {/* ── 하단 50%: 속도 + 버튼 + CCTV ────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 pt-3">

        {/* 속도 + 버튼 행 */}
        <div className="flex items-center gap-3">
          {/* 속도 카드 */}
          <div
            className="flex flex-col items-center justify-center rounded-xl py-3 flex-1"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>SPEED</span>
            <span
              className="font-display font-black"
              style={{ fontSize: '3rem', color: 'var(--tl-yellow)', lineHeight: 1 }}
            >
              {speedKmh !== null ? Math.round(speedKmh) : '--'}
            </span>
            <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)' }}>km/h</span>
          </div>

          {/* 버튼 열 */}
          <div className="flex flex-col gap-2 flex-1">
            <button
              onClick={() => setShowCCTV((v) => !v)}
              className="rounded-xl py-3 font-vfd text-sm"
              style={{
                background: showCCTV ? 'rgba(0,230,118,0.10)' : 'var(--bg-surface)',
                border: `1px solid ${showCCTV ? 'var(--tl-green)' : 'var(--border)'}`,
                color: showCCTV ? 'var(--tl-green)' : 'var(--text-secondary)',
                letterSpacing: '0.08em',
                transition: 'all 0.2s',
              }}
            >
              📷 CCTV
            </button>
            <button
              className="rounded-xl py-3 font-vfd text-sm"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                letterSpacing: '0.08em',
              }}
              disabled
            >
              🚦 교통정보
            </button>
          </div>
        </div>

        {/* 단속카메라 경고 */}
        {camera && (
          <SpeedCameraWidget camera={camera} speedKmh={speedKmh} />
        )}

        {/* CCTV 패널 */}
        {showCCTV && (
          <div className="flex flex-col gap-2">
            {/* 거리 안내 */}
            {nearestCCTV && (
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)' }}>
                  {nearestDist !== undefined
                    ? `다음 CCTV까지 ${nearestDist < 1000 ? nearestDist + 'm' : (nearestDist / 1000).toFixed(1) + 'km'}`
                    : '전방 CCTV'}
                </span>
                {activeCCTVs.length > 1 && (
                  <div className="flex gap-1">
                    <button
                      className="font-vfd text-xs px-2 py-0.5 rounded"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-dim)' }}
                      onClick={() => setCctvIndex((i) => Math.max(0, i - 1))}
                      disabled={cctvIndex === 0}
                    >‹</button>
                    <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', alignSelf: 'center' }}>
                      {cctvIndex + 1}/{activeCCTVs.length}
                    </span>
                    <button
                      className="font-vfd text-xs px-2 py-0.5 rounded"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-dim)' }}
                      onClick={() => setCctvIndex((i) => Math.min(activeCCTVs.length - 1, i + 1))}
                      disabled={cctvIndex >= activeCCTVs.length - 1}
                    >›</button>
                  </div>
                )}
              </div>
            )}
            <CCTVPanel cctv={nearestCCTV} />
          </div>
        )}
      </div>
    </div>
  );
}
