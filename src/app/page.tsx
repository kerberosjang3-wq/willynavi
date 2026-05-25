'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGPSSnapping } from '@/hooks/useGPSSnapping';
import { useCITSSignal } from '@/hooks/useCITSSignal';
import { VFDDisplay } from '@/components/dashboard/VFDDisplay';
import { SignalIndicator } from '@/components/dashboard/SignalIndicator';
import { CCTVPanel } from '@/components/dashboard/CCTVPanel';

export default function DashboardPage() {
  const { position, error: gpsError, isWatching } = useGeolocation();
  const snapping = useGPSSnapping(position, { useMock: true });
  const { signal, isSafetyWarning, displayText } = useCITSSignal(
    snapping.activeSignal?.intersectionId ?? null,
    snapping.isInTriggerZone,
    snapping.activeSignal,
  );

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const speedKmh =
    position?.speed !== null && position?.speed !== undefined
      ? position.speed * 3.6
      : null;

  return (
    <main
      className="flex flex-col min-h-dvh max-w-md mx-auto px-3"
      style={{
        background: 'var(--cyber-bg)',
        paddingTop: 'env(safe-area-inset-top, 12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        gap: 10,
      }}
    >
      {/* ── 상태 표시줄 ────────────────────────────────────────────────── */}
      <StatusBar
        isWatching={isWatching}
        gpsError={gpsError}
        accuracy={position?.accuracy ?? null}
        snappingCount={snapping.nearbyNodesCount}
      />

      {/* ── VFD 도로 정보 패널 ─────────────────────────────────────────── */}
      <VFDDisplay
        currentRoadName={snapping.currentRoadName}
        nextIntersectionName={snapping.nextIntersectionName}
        signalText={displayText}
        signalPhase={signal?.currentPhase ?? null}
        isSafetyWarning={isSafetyWarning}
      />

      {/* ── 2열: 속도 패널 + 신호 인디케이터 ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5" style={{ minHeight: 140 }}>
        {/* 속도 패널 */}
        <div className="cyber-panel flex flex-col items-center justify-center gap-1 px-2 py-3">
          <span
            className="font-vfd text-xs"
            style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.2em' }}
          >
            SPEED
          </span>
          <span
            className="font-display font-black leading-none"
            style={{
              fontSize: '3.5rem',
              color: 'var(--cyber-amber)',
              textShadow: '0 0 14px #ff9d00, 0 0 30px #cc7700',
            }}
          >
            {speedKmh !== null ? Math.round(speedKmh) : '--'}
          </span>
          <span
            className="font-vfd text-xs"
            style={{ color: 'var(--cyber-cyan-dim)' }}
          >
            km/h
          </span>
        </div>

        {/* 신호 인디케이터 */}
        <SignalIndicator
          phase={signal?.currentPhase ?? null}
          isSafetyWarning={isSafetyWarning}
          remainingSeconds={signal?.remainingSeconds ?? null}
          intersectionName={signal?.name}
        />
      </div>

      {/* ── CCTV 스트리밍 패널 ─────────────────────────────────────────── */}
      <CCTVPanel cctv={snapping.activeCCTVs[0] ?? null} />
    </main>
  );
}

// ─── 상태 표시줄 ────────────────────────────────────────────────────────────
function StatusBar({
  isWatching,
  gpsError,
  accuracy,
  snappingCount,
}: {
  isWatching: boolean;
  gpsError: string | null;
  accuracy: number | null;
  snappingCount: number;
}) {
  return (
    <div className="glass-panel flex justify-between items-center px-4 py-2">
      <div className="flex items-center gap-2">
        <span
          className={isWatching && !gpsError ? 'dot-pulse' : ''}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: gpsError ? '#ff3333' : isWatching ? '#00ff88' : 'var(--cyber-border)',
            boxShadow:
              isWatching && !gpsError ? '0 0 6px #00ff88, 0 0 12px #00cc66' : 'none',
          }}
        />
        <span className="font-vfd text-xs cyan-glow">
          {gpsError ? 'GPS ERR' : isWatching ? `±${accuracy?.toFixed(0) ?? '?'}m` : 'WAIT'}
        </span>
      </div>

      <Image
        src="/icons/logo.png"
        alt="willyNavi"
        width={100}
        height={24}
        priority
        style={{ objectFit: 'contain', filter: 'invert(1)', mixBlendMode: 'screen' }}
      />

      <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)' }}>
        {snappingCount} NODE
      </span>
    </div>
  );
}
