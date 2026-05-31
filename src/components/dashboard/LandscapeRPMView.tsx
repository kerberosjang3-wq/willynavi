'use client';
import { useEffect, useState } from 'react';
import { useVirtualRPM, RPM_REDLINE, RPM_MAX } from '@/hooks/useVirtualRPM';
import { SpeedCamera } from '@/hooks/useSpeedCamera';
import { TrafficLevel } from '@/hooks/useTrafficInfo';
import { SpeedCameraWidget } from './SpeedCameraWidget';

function useIsNight(): boolean {
  const check = () => { const h = new Date().getHours(); return h < 6 || h >= 20; };
  const [isNight, setIsNight] = useState(check);
  useEffect(() => {
    const t = setInterval(() => setIsNight(check()), 60_000);
    return () => clearInterval(t);
  }, []);
  return isNight;
}

interface Props {
  speedKmh:        number | null;
  camera:          SpeedCamera | null;
  speedLimit:      number | null;
  trafficLevel:    TrafficLevel | null;
  trafficSpeedKmh: number | null;
  schoolZoneM:     number | null;
}

// RPM 존별 메탈릭 컬러
function rpmZoneColor(rpm: number): string {
  if (rpm >= RPM_REDLINE) return '#C83030';
  if (rpm >= 5000)        return '#A87800';
  if (rpm >= 3000)        return '#1A8840';
  return '#3A6A9C';
}

const TRAFFIC_COLOR: Record<TrafficLevel, string> = {
  smooth:    '#18A848',
  slow:      '#C89010',
  congested: '#E03232',
};
const TRAFFIC_LABEL: Record<TrafficLevel, string> = {
  smooth: '원활', slow: '서행', congested: '정체',
};

// ── 공통 카드 ──────────────────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  flex: '1 1 0',
  width: '100%',
  background: 'linear-gradient(145deg, #1C1C1C 0%, #111111 100%)',
  border: '1px solid #2A2A2A',
  borderTop: '1px solid #3C3C3C',
  borderLeft: '1px solid #363636',
  borderRadius: 10,
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.5)',
};

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={CARD_STYLE}>
      <span className="font-vfd" style={{ fontSize: '0.3rem', color: '#3A3A3A', letterSpacing: '0.16em' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

// ① 제한속도
function SpeedLimitCard({ limit, speedKmh }: { limit: number | null; speedKmh: number | null }) {
  const isOver = limit !== null && speedKmh !== null && Math.round(speedKmh) > limit;
  return (
    <InfoCard label="제한속도">
      {limit !== null ? (
        <>
          <span
            className={`font-display font-black ${isOver ? 'safety-blink' : ''}`}
            style={{ fontSize: '1.4rem', lineHeight: 1, color: isOver ? '#E03232' : '#B0B0B0' }}
          >
            {limit}
          </span>
          <span className="font-vfd" style={{ fontSize: '0.28rem', color: isOver ? '#E0323266' : '#363636' }}>
            {isOver ? '▲ 초과' : 'km/h'}
          </span>
        </>
      ) : (
        <span className="font-display" style={{ fontSize: '1rem', color: '#282828', lineHeight: 1 }}>--</span>
      )}
    </InfoCard>
  );
}

// ② 교통흐름
function TrafficCard({ level, avgKmh }: { level: TrafficLevel | null; avgKmh: number | null }) {
  const color = level ? TRAFFIC_COLOR[level] : '#282828';
  return (
    <InfoCard label="교통흐름">
      <span className="font-display font-black" style={{ fontSize: '0.9rem', lineHeight: 1, color }}>
        {level ? TRAFFIC_LABEL[level] : '--'}
      </span>
      {avgKmh !== null && (
        <span className="font-vfd" style={{ fontSize: '0.28rem', color: `${color}80` }}>
          {avgKmh} km/h
        </span>
      )}
      {!level && (
        <span className="font-vfd" style={{ fontSize: '0.28rem', color: '#2A2A2A' }}>대기중</span>
      )}
    </InfoCard>
  );
}

// ③ 스쿨존
function SchoolZoneCard({ distM }: { distM: number | null }) {
  const isNear    = distM !== null && distM <= 200;
  const isWarning = distM !== null && distM <= 500;
  const color     = isNear ? '#E03232' : isWarning ? '#C89010' : '#4878A8';
  return (
    <InfoCard label="스쿨존">
      {distM !== null ? (
        <>
          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>🏫</span>
          <span
            className={`font-display font-black ${isNear ? 'count-blink' : ''}`}
            style={{ fontSize: '0.82rem', lineHeight: 1, color }}
          >
            {distM < 1000 ? `${distM}m` : `${(distM / 1000).toFixed(1)}km`}
          </span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '0.9rem', lineHeight: 1, opacity: 0.1 }}>🏫</span>
          <span className="font-vfd" style={{ fontSize: '0.28rem', color: '#282828' }}>없음</span>
        </>
      )}
    </InfoCard>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export function LandscapeRPMView({ speedKmh, camera, speedLimit, trafficLevel, trafficSpeedKmh, schoolZoneM }: Props) {
  const { rpm, isShifting, hasSpeed } = useVirtualRPM(speedKmh);
  const isNight = useIsNight();

  const speedDisplay = speedKmh !== null ? Math.round(speedKmh) : '--';
  const rpmRatio     = rpm / RPM_MAX;
  const zoneColor    = rpmZoneColor(rpm);
  // 주간: 앰버 골드 / 야간: 포레스트 그린 / GPS없음: 어둡게
  const speedColor   = !hasSpeed ? '#282828' : isNight ? '#18A848' : '#C89010';

  const PANEL_STYLE: React.CSSProperties = {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(160deg, #1A1A1A 0%, #101010 100%)',
    border: '1px solid #2A2A2A',
    borderTop: '1px solid #3C3C3C',
    borderLeft: '1px solid #363636',
    borderRadius: 14,
    padding: '14px 18px',
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 3px 12px rgba(0,0,0,0.7)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0C0C0C',
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
          background: 'radial-gradient(ellipse at 50% 50%, rgba(200,50,50,0.06) 0%, transparent 60%)',
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
          alignSelf: 'stretch',
          gap: 8,
        }}
      >
        <SpeedLimitCard limit={speedLimit} speedKmh={speedKmh} />
        <TrafficCard level={trafficLevel} avgKmh={trafficSpeedKmh} />
        <SchoolZoneCard distM={schoolZoneM} />
      </div>

      {/* ── CENTER: 속도 패널 ── */}
      <div style={PANEL_STYLE}>
        {/* 브랜딩 + GPS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="font-display" style={{ fontSize: '0.46rem', color: '#4878A8', letterSpacing: '0.26em' }}>
            WILLY<span style={{ color: '#A87800', margin: '0 2px' }}>·</span>NAVI
          </span>
          <span className="font-vfd" style={{ fontSize: '0.3rem', color: hasSpeed ? '#1A4A28' : '#3A2A10', letterSpacing: '0.1em' }}>
            {hasSpeed ? 'GPS·ON' : 'GPS·WAIT'}
          </span>
        </div>

        {/* 속도 숫자 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div
            className="font-display font-black"
            style={{
              fontSize: 'clamp(3.8rem, 13vw, 8rem)',
              lineHeight: 1,
              color: speedColor,
              letterSpacing: '-0.03em',
              textShadow: isShifting ? `0 0 50px ${speedColor}60` : 'none',
              transition: 'color 0.4s, text-shadow 0.08s',
            }}
          >
            {speedDisplay}
          </div>
          <span className="font-vfd" style={{ fontSize: '0.58rem', color: '#2C2C2C', letterSpacing: '0.4em' }}>
            km/h
          </span>
        </div>

        {/* RPM 그라데이션 바 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span
              className="font-display"
              style={{ fontSize: '0.55rem', color: rpm >= RPM_REDLINE ? '#C83030' : '#383838', fontVariantNumeric: 'tabular-nums', transition: 'color 0.15s' }}
            >
              {rpm.toLocaleString()}
            </span>
            <span className="font-vfd" style={{ fontSize: '0.36rem', color: '#222222', letterSpacing: '0.18em' }}>RPM</span>
            {rpm >= RPM_REDLINE && (
              <span className="font-vfd" style={{ fontSize: '0.36rem', color: '#C83030', animation: 'safety-blink 0.4s step-end infinite' }}>
                ▲ REDLINE
              </span>
            )}
          </div>
          {/* 그라데이션 필 바 */}
          <div style={{ height: 7, background: '#080808', borderRadius: 4, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}>
            <div
              style={{
                width: `${rpmRatio * 100}%`,
                height: '100%',
                background: 'linear-gradient(to right, #3A6A9C 0%, #1A8840 43%, #A87800 71%, #C83030 86%)',
                borderRadius: 4,
                transition: 'width 0.07s linear',
                boxShadow: `0 0 6px 1px ${zoneColor}60`,
              }}
            />
          </div>
        </div>

        {/* 존 앰비언트 글로우 */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(to top, ${zoneColor}18, transparent)`,
            pointerEvents: 'none',
            transition: 'background 0.35s',
          }}
        />
      </div>

      {/* ── RIGHT: 과속카메라 패널 ── */}
      <div
        style={{
          ...PANEL_STYLE,
          alignItems: camera ? 'stretch' : 'center',
          justifyContent: 'center',
        }}
      >
        {camera ? (
          <SpeedCameraWidget camera={camera} speedKmh={speedKmh} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.12 }}>
            <span style={{ fontSize: '2rem' }}>📷</span>
            <span className="font-vfd" style={{ fontSize: '0.38rem', color: '#C0C0C0', letterSpacing: '0.12em' }}>
              단속구간 없음
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
