'use client';
import { useEffect, useRef, useState } from 'react';
import { useVirtualRPM, RPM_REDLINE, RPM_MAX } from '@/hooks/useVirtualRPM';
import { SpeedCamera } from '@/hooks/useSpeedCamera';
import { TrafficLevel } from '@/hooks/useTrafficInfo';
import { SpeedCameraWidget } from './SpeedCameraWidget';

// GPS는 1~3초마다 업데이트 — 그 사이 60fps로 보간해 부드럽게 표시
function useSmoothedSpeed(rawKmh: number | null): number | null {
  const targetRef    = useRef<number | null>(rawKmh);
  targetRef.current  = rawKmh;

  const smoothRef    = useRef<number | null>(null);
  const lastValidRef = useRef<number>(0);
  const prevDisplay  = useRef<number | null>(null);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const raw = targetRef.current;
      const now = Date.now();

      if (raw !== null) {
        lastValidRef.current = now;
        smoothRef.current = smoothRef.current === null
          ? raw
          : smoothRef.current + (raw - smoothRef.current) * 0.15;
      } else if (now - lastValidRef.current >= 4_000) {
        smoothRef.current = null;
      }
      // GPS 일시적 null → 마지막 보간값 유지 (최대 4초)

      const next = smoothRef.current !== null ? Math.round(smoothRef.current) : null;
      if (next !== prevDisplay.current) {
        prevDisplay.current = next;
        setDisplay(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return display;
}

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

const CARD_STYLE: React.CSSProperties = {
  flex: '1 1 0',
  width: '100%',
  borderRadius: 10,
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
};

function SpeedLimitCard({ limit, speedKmh }: { limit: number | null; speedKmh: number | null }) {
  if (limit === null) return null;
  const isOver = speedKmh !== null && Math.round(speedKmh) > limit;
  return (
    <div style={CARD_STYLE}>
      <span className="font-vfd" style={{ fontSize: '0.3rem', color: '#4A4A4A', letterSpacing: '0.16em' }}>
        제한속도
      </span>
      <span
        className={`font-display font-black ${isOver ? 'safety-blink' : ''}`}
        style={{ fontSize: '1.4rem', lineHeight: 1, color: isOver ? '#E03232' : '#B0B0B0' }}
      >
        {limit}
      </span>
      <span className="font-vfd" style={{ fontSize: '0.28rem', color: isOver ? '#E0323266' : '#404040' }}>
        {isOver ? '▲ 초과' : 'km/h'}
      </span>
    </div>
  );
}

function TrafficCard({ level, avgKmh }: { level: TrafficLevel | null; avgKmh: number | null }) {
  if (level === null) return null;
  const color = TRAFFIC_COLOR[level];
  return (
    <div style={CARD_STYLE}>
      <span className="font-vfd" style={{ fontSize: '0.3rem', color: '#4A4A4A', letterSpacing: '0.16em' }}>
        교통흐름
      </span>
      <span className="font-display font-black" style={{ fontSize: '0.9rem', lineHeight: 1, color }}>
        {TRAFFIC_LABEL[level]}
      </span>
      {avgKmh !== null && (
        <span className="font-vfd" style={{ fontSize: '0.28rem', color: `${color}80` }}>
          {avgKmh} km/h
        </span>
      )}
    </div>
  );
}

function SchoolZoneCard({ distM }: { distM: number | null }) {
  if (distM === null) return null;
  const isNear    = distM <= 200;
  const isWarning = distM <= 500;
  const color     = isNear ? '#E03232' : isWarning ? '#C89010' : '#4878A8';
  return (
    <div style={CARD_STYLE}>
      <span className="font-vfd" style={{ fontSize: '0.3rem', color: '#4A4A4A', letterSpacing: '0.16em' }}>
        스쿨존
      </span>
      <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>🏫</span>
      <span
        className={`font-display font-black ${isNear ? 'count-blink' : ''}`}
        style={{ fontSize: '0.82rem', lineHeight: 1, color }}
      >
        {distM < 1000 ? `${distM}m` : `${(distM / 1000).toFixed(1)}km`}
      </span>
    </div>
  );
}

// ── SVG 원형 게이지 헬퍼 ───────────────────────────────────────────────────────

/** 0° = 12 o'clock, clockwise positive */
function toXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG clockwise arc path from startDeg to endDeg */
function cwArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = toXY(cx, cy, r, startDeg);
  const e = toXY(cx, cy, r, endDeg);
  const span = ((endDeg - startDeg) % 360 + 360) % 360 || 360;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)},${s.y.toFixed(2)} A ${r},${r} 0 ${large} 1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`;
}

// 아크: 225° (7시 30분) → 시계방향 270° → 135° (4시 30분), 하단 90° 갭
const ARC_START = 225;
const ARC_SWEEP = 270;

const RPM_ZONES = [
  { from: 0,                     to: 3000 / RPM_MAX, color: '#3A6A9C' },
  { from: 3000 / RPM_MAX,        to: 5000 / RPM_MAX, color: '#1A8840' },
  { from: 5000 / RPM_MAX,        to: RPM_REDLINE / RPM_MAX, color: '#A87800' },
  { from: RPM_REDLINE / RPM_MAX, to: 1,              color: '#C83030' },
] as const;

// ── 원형 속도계 게이지 컴포넌트 ───────────────────────────────────────────────

function SpeedometerGauge({
  speedDisplay,
  speedColor,
  rpmRatio,
  zoneColor,
  hasSpeed,
}: {
  speedDisplay: string | number;
  speedColor: string;
  rpmRatio: number;
  zoneColor: string;
  hasSpeed: boolean;
}) {
  const S  = 220;
  const cx = S / 2;
  const cy = S / 2;
  const R  = S / 2 - 12; // 아크 반지름
  const W  = 10;          // 아크 선 두께

  const ratio   = Math.min(1, Math.max(0, rpmRatio));
  const progEnd = ARC_START + ratio * ARC_SWEEP;

  // 구역별 세그먼트 생성 (현재 ratio까지만)
  const segments: { d: string; color: string }[] = [];
  for (const z of RPM_ZONES) {
    if (ratio <= z.from) break;
    const segStart = ARC_START + z.from * ARC_SWEEP;
    const segEnd   = ARC_START + Math.min(z.to, ratio) * ARC_SWEEP;
    segments.push({ d: cwArc(cx, cy, R, segStart, segEnd), color: z.color });
  }

  // 아크 팁 위치 (둥근 끝점 글로우용)
  const tip = ratio > 0 ? toXY(cx, cy, R, progEnd) : null;

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="rpm-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="dial-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1C1C1C"/>
          <stop offset="100%" stopColor="#080808"/>
        </radialGradient>
      </defs>

      {/* 다이얼 배경 원 */}
      <circle
        cx={cx} cy={cy}
        r={R - W / 2 - 1}
        fill="url(#dial-bg)"
        stroke="#1E1E1E"
        strokeWidth={0.5}
      />

      {/* 배경 트랙 (270° 전체) */}
      <path
        d={cwArc(cx, cy, R, ARC_START, ARC_START + ARC_SWEEP)}
        fill="none"
        stroke="#181818"
        strokeWidth={W}
        strokeLinecap="round"
      />

      {/* RPM 구역별 컬러 아크 */}
      {segments.map((seg, i) => (
        <path
          key={i}
          d={seg.d}
          fill="none"
          stroke={seg.color}
          strokeWidth={W}
          strokeLinecap="butt"
          filter="url(#rpm-glow)"
        />
      ))}

      {/* 시작점 둥근 캡 */}
      {ratio > 0 && (() => {
        const start = toXY(cx, cy, R, ARC_START);
        return (
          <circle cx={start.x} cy={start.y} r={W / 2} fill="#3A6A9C" filter="url(#rpm-glow)"/>
        );
      })()}

      {/* 끝점 둥근 캡 (팁 글로우) */}
      {tip && (
        <circle cx={tip.x} cy={tip.y} r={W / 2} fill={zoneColor} filter="url(#rpm-glow)"/>
      )}

      {/* 속도 숫자 */}
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: '"DSEG7 Classic", monospace',
          fontStyle: 'italic',
          fontSize: S * 0.27,
          fill: speedColor,
          transition: 'none',
          letterSpacing: '0.05em',
        }}
      >
        {speedDisplay}
      </text>

      {/* km/h 라벨 */}
      <text
        x={cx}
        y={cy + S * 0.21}
        textAnchor="middle"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: S * 0.068,
          fill: hasSpeed ? 'rgba(255,255,255,0.5)' : '#282828',
          letterSpacing: '3px',
          transition: 'none',
        }}
      >
        km/h
      </text>
    </svg>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export function LandscapeRPMView({ speedKmh, camera, speedLimit, trafficLevel, trafficSpeedKmh, schoolZoneM }: Props) {
  const { rpm, isShifting } = useVirtualRPM(speedKmh);
  const smoothedKmh = useSmoothedSpeed(speedKmh);
  useIsNight();

  const speedDisplay = smoothedKmh !== null ? smoothedKmh : '--';
  const rpmRatio     = rpm / RPM_MAX;
  const zoneColor    = rpmZoneColor(rpm);
  const speedColor   = smoothedKmh === null ? '#282828' : '#FFFFFF';
  const hasSpeed     = smoothedKmh !== null;

  const hasLeftData  = speedLimit !== null || trafficLevel !== null || schoolZoneM !== null;

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

      {/* ── LEFT: 정보 있을 때만 표시 ── */}
      {hasLeftData && (
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
      )}

      {/* ── CENTER: 속도 패널 ── */}
      <div style={PANEL_STYLE}>
        {/* 브랜딩 + GPS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span className="font-display" style={{ fontSize: '0.46rem', color: '#FFFFFF', letterSpacing: '0.26em' }}>
            WILLY<span style={{ color: '#A87800', margin: '0 2px' }}>·</span>NAVI
          </span>
          <span className="font-vfd" style={{ fontSize: '0.3rem', color: hasSpeed ? '#1A4A28' : '#3A2A10', letterSpacing: '0.1em' }}>
            {hasSpeed ? 'GPS·ON' : 'GPS·WAIT'}
          </span>
        </div>

        {/* 원형 속도계 + RPM 아크 */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SpeedometerGauge
            speedDisplay={speedDisplay}
            speedColor={speedColor}
            rpmRatio={rpmRatio}
            zoneColor={zoneColor}
            hasSpeed={hasSpeed}
          />
        </div>

        {/* RPM 수치 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* ── RIGHT: 과속카메라 있을 때만 표시 ── */}
      {camera && (
        <div
          style={{
            ...PANEL_STYLE,
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
        >
          <SpeedCameraWidget camera={camera} speedKmh={speedKmh} compact />
        </div>
      )}
    </div>
  );
}
