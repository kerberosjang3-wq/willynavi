'use client';
import { useEffect, useState } from 'react';
import { useVirtualRPM, RPM_REDLINE, RPM_MAX } from '@/hooks/useVirtualRPM';

function useIsNight(): boolean {
  const check = () => { const h = new Date().getHours(); return h < 6 || h >= 20; };
  const [isNight, setIsNight] = useState(check);
  useEffect(() => {
    const t = setInterval(() => setIsNight(check()), 60_000);
    return () => clearInterval(t);
  }, []);
  return isNight;
}
import { SpeedCamera } from '@/hooks/useSpeedCamera';
import { TrafficLevel } from '@/hooks/useTrafficInfo';
import { SpeedCameraWidget } from './SpeedCameraWidget';

interface Props {
  speedKmh:       number | null;
  camera:         SpeedCamera | null;
  speedLimit:     number | null;
  trafficLevel:   TrafficLevel | null;
  trafficSpeedKmh: number | null;
  schoolZoneM:    number | null;
}

function rpmZoneColor(rpm: number): string {
  if (rpm >= RPM_REDLINE) return '#FF4A4A';
  if (rpm >= 5000)        return '#FFD600';
  if (rpm >= 3000)        return '#00E676';
  return '#5B9FFF';
}

const TRAFFIC_COLOR: Record<TrafficLevel, string> = {
  smooth:    '#00E676',
  slow:      '#FFD600',
  congested: '#FF4A4A',
};
const TRAFFIC_LABEL: Record<TrafficLevel, string> = {
  smooth:    '원활',
  slow:      '서행',
  congested: '정체',
};

// ── 중앙 정보 카드 ─────────────────────────────────────────────────────────────

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid #141828',
        borderRadius: 10,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <span className="font-vfd" style={{ fontSize: '0.32rem', color: '#2A3555', letterSpacing: '0.14em' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

// ① 제한속도 카드
function SpeedLimitCard({ limit, speedKmh }: { limit: number | null; speedKmh: number | null }) {
  const isOver = limit !== null && speedKmh !== null && Math.round(speedKmh) > limit;
  return (
    <InfoCard label="제한속도">
      {limit !== null ? (
        <>
          <span
            className={`font-display font-black ${isOver ? 'safety-blink' : ''}`}
            style={{ fontSize: '1.5rem', lineHeight: 1, color: isOver ? '#FF4A4A' : '#C8D8E8' }}
          >
            {limit}
          </span>
          <span className="font-vfd" style={{ fontSize: '0.3rem', color: isOver ? '#FF4A4A88' : '#1A2040' }}>
            {isOver ? '▲ 초과' : 'km/h'}
          </span>
        </>
      ) : (
        <span className="font-display" style={{ fontSize: '1.1rem', color: '#1E2535', lineHeight: 1 }}>--</span>
      )}
    </InfoCard>
  );
}

// ② 교통 혼잡 카드
function TrafficCard({ level, avgKmh }: { level: TrafficLevel | null; avgKmh: number | null }) {
  const color = level ? TRAFFIC_COLOR[level] : '#1E2535';
  const label = level ? TRAFFIC_LABEL[level] : null;
  return (
    <InfoCard label="교통흐름">
      <span className="font-display font-black" style={{ fontSize: '1rem', lineHeight: 1, color }}>
        {label ?? '--'}
      </span>
      {avgKmh !== null && (
        <span className="font-vfd" style={{ fontSize: '0.3rem', color: `${color}88` }}>
          {avgKmh} km/h
        </span>
      )}
      {!label && (
        <span className="font-vfd" style={{ fontSize: '0.3rem', color: '#1A2040' }}>대기중</span>
      )}
    </InfoCard>
  );
}

// ③ 스쿨존 카드
function SchoolZoneCard({ distM }: { distM: number | null }) {
  const isNear    = distM !== null && distM <= 200;
  const isWarning = distM !== null && distM <= 500;
  const color     = isNear ? '#FF4A4A' : isWarning ? '#FFD600' : '#5B9FFF';
  return (
    <InfoCard label="스쿨존">
      {distM !== null ? (
        <>
          <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>🏫</span>
          <span
            className={`font-display font-black ${isNear ? 'count-blink' : ''}`}
            style={{ fontSize: '0.9rem', lineHeight: 1, color }}
          >
            {distM < 1000 ? `${distM}m` : `${(distM / 1000).toFixed(1)}km`}
          </span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '0.95rem', lineHeight: 1, opacity: 0.15 }}>🏫</span>
          <span className="font-vfd" style={{ fontSize: '0.3rem', color: '#1A2040' }}>없음</span>
        </>
      )}
    </InfoCard>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export function LandscapeRPMView({ speedKmh, camera, speedLimit, trafficLevel, trafficSpeedKmh, schoolZoneM }: Props) {
  const { rpm, isShifting, hasSpeed } = useVirtualRPM(speedKmh);
  const isNight = useIsNight();

  const speedDisplay  = speedKmh !== null ? Math.round(speedKmh) : '--';
  const rpmRatio      = rpm / RPM_MAX;
  const zoneColor     = rpmZoneColor(rpm);
  const speedColor    = !hasSpeed ? '#252836' : isNight ? '#00E676' : '#FFD600';

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

      {/* ── LEFT: 3개 정보 카드 ── */}
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <SpeedLimitCard limit={speedLimit} speedKmh={speedKmh} />
        <TrafficCard level={trafficLevel} avgKmh={trafficSpeedKmh} />
        <SchoolZoneCard distM={schoolZoneM} />
      </div>

      {/* ── CENTER: 속도 패널 ── */}
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
        {/* WILLY·NAVI 브랜딩 + GPS 상태 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="font-display" style={{ fontSize: '0.48rem', color: '#5B9FFF', letterSpacing: '0.28em' }}>
            WILLY<span style={{ color: '#FFD600', margin: '0 2px' }}>·</span>NAVI
          </span>
          <span className="font-vfd" style={{ fontSize: '0.32rem', color: hasSpeed ? '#1B3A22' : '#3A2A10', letterSpacing: '0.1em' }}>
            {hasSpeed ? 'GPS·ON' : 'GPS·WAIT'}
          </span>
        </div>

        {/* 속도 숫자 (세로 중앙) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div
            className="font-display font-black"
            style={{
              fontSize: 'clamp(3.8rem, 13vw, 8rem)',
              lineHeight: 1,
              color: speedColor,
              letterSpacing: '-0.03em',
              textShadow: isShifting ? `0 0 60px ${speedColor}70` : 'none',
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
            <span className="font-vfd" style={{ fontSize: '0.38rem', color: '#1A2035', letterSpacing: '0.18em' }}>RPM</span>
            {rpm >= RPM_REDLINE && (
              <span className="font-vfd" style={{ fontSize: '0.38rem', color: '#FF4A4A', animation: 'safety-blink 0.4s step-end infinite' }}>
                ▲ REDLINE
              </span>
            )}
          </div>
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

        {/* RPM 존 앰비언트 글로우 */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
            background: `linear-gradient(to top, ${zoneColor}1A, transparent)`,
            pointerEvents: 'none',
            transition: 'background 0.35s',
          }}
        />
      </div>

      {/* ── RIGHT: 과속카메라 패널 ── */}
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
