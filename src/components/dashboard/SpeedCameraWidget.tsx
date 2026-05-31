'use client';
import { SpeedCamera, CameraType } from '@/hooks/useSpeedCamera';

// ── 타입별 레이블 · 아이콘 ────────────────────────────────────────────────────

const LABEL: Record<CameraType, string> = {
  school:        '스쿨존',
  mobile:        '이동식',
  section_start: '구간단속',
  fixed:         '고정식',
  signal:        '신호위반',
  bus:           '버스전용',
  multipurpose:  '다목적',
};

const ICON: Record<CameraType, string> = {
  school:        '🏫',
  mobile:        '🚔',
  section_start: '📏',
  fixed:         '📷',
  signal:        '🚦',
  bus:           '🚌',
  multipurpose:  '📷',
};

// ── 거리 포매터 ──────────────────────────────────────────────────────────────

function fmtDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

// ── 거리별 긴급도 ────────────────────────────────────────────────────────────

type Urgency = 'critical' | 'high' | 'mid' | 'low';

function urgencyOf(distM: number): Urgency {
  if (distM < 200)  return 'critical';
  if (distM < 500)  return 'high';
  if (distM < 1000) return 'mid';
  return 'low';
}

const URGENCY_COLOR: Record<Urgency, string> = {
  critical: '#E03232',
  high:     '#C06820',
  mid:      '#A87800',
  low:      '#3A6A9C',
};

const URGENCY_BG: Record<Urgency, string> = {
  critical: 'rgba(224,50,50,0.12)',
  high:     'rgba(192,104,32,0.10)',
  mid:      'rgba(168,120,0,0.08)',
  low:      'rgba(58,106,156,0.07)',
};

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface Props {
  camera: SpeedCamera | null;
  speedKmh: number | null;
  compact?: boolean; // 가로 모드 HUD용 축소 레이아웃
}

export function SpeedCameraWidget({ camera, speedKmh, compact = false }: Props) {
  if (!camera) return null;

  const urg    = urgencyOf(camera.distanceM);
  const color  = URGENCY_COLOR[urg];
  const bg     = URGENCY_BG[urg];
  const speed  = speedKmh !== null ? Math.round(speedKmh) : null;
  const isOver = camera.speedLimit > 0 && speed !== null && speed > camera.speedLimit;
  const blink  = urg === 'critical' || isOver;

  if (compact) {
    // ── 가로 모드용 한 줄 배지 ──────────────────────────────────────────────
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: bg,
          border: `1px solid ${color}50`,
          borderRadius: 8,
          padding: '6px 14px',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{ICON[camera.type]}</span>
        <span
          className={`font-display font-black ${blink ? 'count-blink' : ''}`}
          style={{ fontSize: '1.1rem', color, lineHeight: 1 }}
        >
          {fmtDist(camera.distanceM)}
        </span>
        <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          {LABEL[camera.type]}
        </span>
        {camera.speedLimit > 0 && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="font-vfd" style={{ fontSize: '0.38rem', color: 'var(--text-dim)' }}>제한</span>
              <span
                className={`font-display font-black ${isOver ? 'safety-blink' : ''}`}
                style={{ fontSize: '1rem', color: isOver ? '#FF4A4A' : 'var(--text-primary)', lineHeight: 1 }}
              >
                {camera.speedLimit}
              </span>
            </div>
            {isOver && (
              <span className="font-vfd" style={{ fontSize: '0.5rem', color: '#FF4A4A', letterSpacing: '0.08em', animation: 'safety-blink 0.4s step-end infinite' }}>
                ▲ 초과!
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  // ── 세로 모드용 풀 카드 ────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}45`,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* 아이콘 + 타입 레이블 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 34 }}>
        <span style={{ fontSize: '1.25rem' }}>{ICON[camera.type]}</span>
        <span className="font-vfd" style={{ fontSize: '0.38rem', color, letterSpacing: '0.05em' }}>
          {LABEL[camera.type]}
        </span>
      </div>

      {/* 거리 (큰 숫자) + 부제 */}
      <div style={{ flex: 1 }}>
        <div
          className={`font-display font-black ${blink ? 'count-blink' : ''}`}
          style={{ fontSize: '1.9rem', color, lineHeight: 1 }}
        >
          {fmtDist(camera.distanceM)}
        </div>
        <div className="font-vfd" style={{ fontSize: '0.42rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: 2 }}>
          전방 단속카메라
        </div>
      </div>

      {/* 제한속도 뱃지 */}
      {camera.speedLimit > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: isOver ? 'rgba(255,74,74,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isOver ? '#FF4A4A66' : 'var(--border)'}`,
            borderRadius: 8,
            padding: '6px 10px',
            minWidth: 52,
            gap: 1,
          }}
        >
          <span className="font-vfd" style={{ fontSize: '0.38rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
            제한속도
          </span>
          <span
            className={`font-display font-black ${isOver ? 'safety-blink' : ''}`}
            style={{ fontSize: '1.4rem', color: isOver ? '#FF4A4A' : 'var(--text-primary)', lineHeight: 1 }}
          >
            {camera.speedLimit}
          </span>
          <span className="font-vfd" style={{ fontSize: '0.38rem', color: 'var(--text-dim)' }}>km/h</span>
          {isOver && (
            <span
              className="font-vfd"
              style={{ fontSize: '0.38rem', color: '#FF4A4A', letterSpacing: '0.05em', animation: 'safety-blink 0.4s step-end infinite' }}
            >
              ▲ 초과
            </span>
          )}
        </div>
      )}
    </div>
  );
}
