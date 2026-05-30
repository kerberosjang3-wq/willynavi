'use client';
import { useVirtualRPM, RPM_REDLINE, RPM_MAX } from '@/hooks/useVirtualRPM';
import { SpeedCamera } from '@/hooks/useSpeedCamera';
import { SpeedCameraWidget } from './SpeedCameraWidget';

function rpmZoneColor(rpm: number): string {
  if (rpm >= RPM_REDLINE) return '#FF4A4A';
  if (rpm >= 5000)        return '#FFD600';
  if (rpm >= 3000)        return '#00E676';
  return '#5B9FFF';
}

export function LandscapeRPMView({ speedKmh, camera }: { speedKmh: number | null; camera: SpeedCamera | null }) {
  const { rpm, gear, isShifting, hasSpeed } = useVirtualRPM(speedKmh);

  const speedDisplay = speedKmh !== null ? Math.round(speedKmh) : '--';
  const rpmRatio     = rpm / RPM_MAX;
  const zoneColor    = rpmZoneColor(rpm);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#090D1A',
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        paddingLeft:   'max(14px, env(safe-area-inset-left))',
        paddingRight:  'max(14px, env(safe-area-inset-right))',
        paddingTop:    'max(10px, env(safe-area-inset-top))',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}
    >
      {/* 변속 앰비언트 플래시 */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 25% 50%, rgba(255,74,74,0.08) 0%, transparent 55%)',
          opacity: isShifting ? 1 : 0,
          transition: 'opacity 0.06s',
        }}
      />

      {/* ── LEFT: 속도 패널 ───────────────────────────────────────── */}
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255,255,255,0.018)',
          border: '1px solid #141828',
          borderRadius: 14,
          padding: '14px 18px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 속도 숫자 (세로 중앙) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div
            className="font-display font-black"
            style={{
              fontSize: 'clamp(3.8rem, 13vw, 8rem)',
              lineHeight: 1,
              color: hasSpeed ? '#FFD600' : '#252836',
              letterSpacing: '-0.03em',
              textShadow: isShifting ? '0 0 60px rgba(255,214,0,0.45)' : 'none',
              transition: 'color 0.4s, text-shadow 0.08s',
            }}
          >
            {speedDisplay}
          </div>
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: '#2A3555', letterSpacing: '0.4em' }}>
            km/h
          </span>
        </div>

        {/* RPM 그라데이션 바 (하단 고정) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span
              className="font-display"
              style={{ fontSize: '0.58rem', color: rpm >= RPM_REDLINE ? '#FF4A4A' : '#2A3555', fontVariantNumeric: 'tabular-nums', transition: 'color 0.15s' }}
            >
              {rpm.toLocaleString()}
            </span>
            <span className="font-vfd" style={{ fontSize: '0.38rem', color: '#1A2035', letterSpacing: '0.18em' }}>
              RPM
            </span>
            {rpm >= RPM_REDLINE && (
              <span className="font-vfd" style={{ fontSize: '0.38rem', color: '#FF4A4A', letterSpacing: '0.1em', animation: 'safety-blink 0.4s step-end infinite' }}>
                ▲ REDLINE
              </span>
            )}
          </div>

          {/* 그라데이션 필 바 */}
          <div style={{ height: 8, background: '#07090F', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${rpmRatio * 100}%`,
                height: '100%',
                background: 'linear-gradient(to right, #5B9FFF 0%, #00E676 43%, #FFD600 71%, #FF4A4A 86%)',
                borderRadius: 4,
                transition: 'width 0.07s linear',
                boxShadow: `0 0 8px 1px ${zoneColor}55`,
              }}
            />
          </div>
        </div>

        {/* RPM 존 앰비언트 글로우 (패널 하단) */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
            background: `linear-gradient(to top, ${zoneColor}1A, transparent)`,
            pointerEvents: 'none',
            transition: 'background 0.35s',
          }}
        />
      </div>

      {/* ── CENTER: 정보 패널 ─────────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 auto',
          width: 'clamp(80px, 18vw, 140px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        <span className="font-display" style={{ fontSize: '0.5rem', color: '#5B9FFF', letterSpacing: '0.28em', textAlign: 'center' }}>
          WILLY<span style={{ color: '#FFD600', margin: '0 2px' }}>·</span>NAVI
        </span>

        {/* 기어 / SHIFT */}
        <div
          className="font-display font-black"
          style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
            letterSpacing: '0.15em',
            color: isShifting ? '#FF4A4A' : '#5B9FFF',
            transition: 'color 0.05s',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          {isShifting ? '!!' : `G${gear}`}
        </div>
        <span className="font-vfd" style={{ fontSize: '0.36rem', color: isShifting ? '#FF4A4A55' : '#1A2040', letterSpacing: '0.12em' }}>
          {isShifting ? 'SHIFT' : 'GEAR'}
        </span>

        {/* GPS 상태 */}
        <span
          className="font-vfd"
          style={{ fontSize: '0.34rem', color: hasSpeed ? '#1B3A22' : '#3A2A10', letterSpacing: '0.12em', textAlign: 'center' }}
        >
          {hasSpeed ? 'GPS·ON' : 'GPS·WAIT'}
        </span>
      </div>

      {/* ── RIGHT: 과속카메라 패널 ───────────────────────────────── */}
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255,255,255,0.018)',
          border: '1px solid #141828',
          borderRadius: 14,
          padding: '14px 18px',
          alignItems: camera ? 'stretch' : 'center',
          justifyContent: 'center',
        }}
      >
        {camera ? (
          <SpeedCameraWidget camera={camera} speedKmh={speedKmh} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.18 }}>
            <span style={{ fontSize: '2rem' }}>📷</span>
            <span className="font-vfd" style={{ fontSize: '0.4rem', color: '#C8D8E8', letterSpacing: '0.12em' }}>
              단속구간 없음
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
