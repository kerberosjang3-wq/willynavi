'use client';
import { useMemo } from 'react';
import { useVirtualRPM, RPM_REDLINE, RPM_MAX } from '@/hooks/useVirtualRPM';

// 70 segments = 100 RPM each (0–7000 RPM)
const SEG_COUNT   = 70;
const REDLINE_SEG = Math.round((RPM_REDLINE / RPM_MAX) * SEG_COUNT); // 60

function segColor(i: number): string {
  const r = (i / SEG_COUNT) * RPM_MAX;
  if (r >= RPM_REDLINE) return '#FF4A4A';  // 레드존
  if (r >= 5000)        return '#FFD600';  // 옐로우존
  if (r >= 3000)        return '#00E676';  // 그린존
  return '#5B9FFF';                        // 사이언존
}

export function LandscapeRPMView({ speedKmh }: { speedKmh: number | null }) {
  const { rpm, gear, isShifting } = useVirtualRPM(speedKmh);

  const activeSeg    = Math.min(SEG_COUNT, Math.round((rpm / RPM_MAX) * SEG_COUNT));
  const speedDisplay = speedKmh !== null ? Math.round(speedKmh) : '--';

  // Segment colours computed once
  const segColors = useMemo(() => Array.from({ length: SEG_COUNT }, (_, i) => segColor(i)), []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#090D1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft:   'max(20px, env(safe-area-inset-left))',
        paddingRight:  'max(20px, env(safe-area-inset-right))',
        paddingTop:    'max(8px,  env(safe-area-inset-top))',
        paddingBottom: 'max(8px,  env(safe-area-inset-bottom))',
      }}
    >
      {/* 변속 순간 앰비언트 플래시 */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 35%, rgba(255,74,74,0.09) 0%, transparent 65%)',
          opacity: isShifting ? 1 : 0,
          transition: 'opacity 0.06s',
        }}
      />

      {/* ── 헤더 ── */}
      <div
        style={{
          position: 'absolute',
          top:   'max(8px, env(safe-area-inset-top))',
          left:  'max(20px, env(safe-area-inset-left))',
          right: 'max(20px, env(safe-area-inset-right))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="font-display" style={{ fontSize: '0.6rem', color: '#5B9FFF', letterSpacing: '0.3em' }}>
          WILLY<span style={{ color: '#FFD600', margin: '0 2px' }}>·</span>NAVI
        </span>
        <span className="font-vfd" style={{ fontSize: '0.5rem', color: '#252836', letterSpacing: '0.18em' }}>
          VIRTUAL RPM MODE
        </span>
      </div>

      {/* ── 속도 + 기어 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginBottom: 24 }}>
        {/* 속도 대형 숫자 */}
        <div
          className="font-display font-black"
          style={{
            fontSize: 'clamp(3.5rem, 13vw, 6.5rem)',
            lineHeight: 1,
            color: '#FFD600',
            letterSpacing: '-0.03em',
            textShadow: isShifting ? '0 0 50px rgba(255,214,0,0.42)' : 'none',
            transition: 'text-shadow 0.08s',
          }}
        >
          {speedDisplay}
        </div>

        <span className="font-vfd" style={{ fontSize: '0.65rem', color: '#4A5872', letterSpacing: '0.45em' }}>
          km/h
        </span>

        {/* 기어 / SHIFT! 인디케이터 */}
        <div
          className="font-display"
          style={{
            marginTop: 8,
            fontSize: '0.8rem',
            letterSpacing: '0.28em',
            color: isShifting ? '#FF4A4A' : '#5B9FFF',
            transition: 'color 0.05s',
            minWidth: 72,
            textAlign: 'center',
          }}
        >
          {isShifting ? 'SHIFT !' : `GEAR  ${gear}`}
        </div>
      </div>

      {/* ── RPM 게이지 ── */}
      <div style={{ width: '100%', maxWidth: 720 }}>
        {/* RPM 수치 표시 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span
            className="font-display font-black"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
              color: rpm >= RPM_REDLINE ? '#FF4A4A' : '#C8D8E8',
              transition: 'color 0.1s',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {rpm.toLocaleString()}
          </span>
          <span className="font-vfd" style={{ fontSize: '0.55rem', color: '#4A5872', letterSpacing: '0.22em' }}>
            RPM
          </span>
          {rpm >= RPM_REDLINE && (
            <span
              className="font-vfd"
              style={{
                fontSize: '0.5rem',
                color: '#FF4A4A',
                letterSpacing: '0.12em',
                animation: 'safety-blink 0.4s step-end infinite',
              }}
            >
              ▲ REDLINE
            </span>
          )}
        </div>

        {/* 세그먼트 타코미터 바 */}
        <div style={{ display: 'flex', gap: 2, height: 22, alignItems: 'stretch' }}>
          {segColors.map((color, i) => {
            const active  = i < activeSeg;
            const redZone = i >= REDLINE_SEG;
            const isTip   = active && i === activeSeg - 1; // 선두 세그먼트 글로우
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 2,
                  background: active
                    ? color
                    : redZone
                    ? 'rgba(255,74,74,0.1)'
                    : 'rgba(255,255,255,0.035)',
                  boxShadow: isTip ? `0 0 10px 2px ${color}99` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* 스케일 레이블: 0–7 (×1000 RPM) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span
              key={n}
              className="font-vfd"
              style={{
                fontSize: '0.44rem',
                color: n >= 6 ? 'rgba(255,74,74,0.4)' : '#1E2130',
                letterSpacing: 0,
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
