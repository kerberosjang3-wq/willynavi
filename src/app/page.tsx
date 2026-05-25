'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGPSSnapping } from '@/hooks/useGPSSnapping';
import { useCITSSignal } from '@/hooks/useCITSSignal';
import { VFDDisplay } from '@/components/dashboard/VFDDisplay';
import { SignalIndicator } from '@/components/dashboard/SignalIndicator';
import { CCTVPanel } from '@/components/dashboard/CCTVPanel';
import { SkeuomorphicCard } from '@/components/ui/SkeuomorphicCard';

export default function DashboardPage() {
  // GPS 추적
  const { position, error: gpsError, isWatching } = useGeolocation();

  // GPS → 스내핑 파이프라인
  const snapping = useGPSSnapping(position, { useMock: true });

  // C-ITS 신호 구독 (트리거 존 진입 시에만 폴링)
  const { signal, isSafetyWarning, displayText } = useCITSSignal(
    snapping.activeSignal?.intersectionId ?? null,
    snapping.isInTriggerZone,
    snapping.activeSignal,
  );

  // PWA Service Worker 등록
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const speedKmh = position?.speed !== null && position?.speed !== undefined
    ? position.speed * 3.6
    : null;

  return (
    <main
      className="flex flex-col min-h-dvh max-w-md mx-auto px-3 py-safe"
      style={{
        background: 'radial-gradient(ellipse at top, #0f1a10 0%, #0a0a0e 60%)',
        paddingTop: 'env(safe-area-inset-top, 12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        gap: 12,
      }}
    >
      {/* ── 상태 표시줄 ─────────────────────────────────────────────────────────── */}
      <StatusBar isWatching={isWatching} gpsError={gpsError} accuracy={position?.accuracy ?? null} snappingCount={snapping.nearbyNodesCount} />

      {/* ── VFD 메인 디스플레이 ──────────────────────────────────────────────────── */}
      <VFDDisplay
        currentRoadName={snapping.currentRoadName}
        nextIntersectionName={snapping.nextIntersectionName}
        signalText={displayText}
        signalPhase={signal?.currentPhase ?? null}
        isSafetyWarning={isSafetyWarning}
        speedKmh={speedKmh}
      />

      {/* ── 신호등 인디케이터 ─────────────────────────────────────────────────────── */}
      <SignalIndicator
        phase={signal?.currentPhase ?? null}
        isSafetyWarning={isSafetyWarning}
        remainingSeconds={signal?.remainingSeconds ?? null}
        intersectionName={signal?.name}
      />

      {/* ── CCTV 스트리밍 패널 ────────────────────────────────────────────────────── */}
      <CCTVPanel cctv={snapping.activeCCTVs[0] ?? null} />

      {/* ── 근처 노드 요약 (개발용) ──────────────────────────────────────────────── */}
      <SkeuomorphicCard variant="darker">
        <p className="font-vfd text-xs text-center" style={{ color: '#004422', letterSpacing: '0.1em' }}>
          NEARBY NODES: {snapping.nearbyNodesCount} &nbsp;|&nbsp;
          TRIGGER ZONE: {snapping.isInTriggerZone ? '⚡ ON' : 'OFF'}
        </p>
      </SkeuomorphicCard>
    </main>
  );
}

// ─── 상태 표시줄 컴포넌트 ──────────────────────────────────────────────────────
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
    <div
      className="flex justify-between items-center px-3 py-1 rounded-lg"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid #1a1a24',
      }}
    >
      {/* GPS 상태 */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: gpsError ? '#ff4400' : isWatching ? '#00ff88' : '#666',
            boxShadow: isWatching && !gpsError ? '0 0 6px #00ff88' : 'none',
          }}
        />
        <span className="font-vfd text-xs" style={{ color: '#004422' }}>
          {gpsError ? 'GPS 오류' : isWatching ? `GPS ±${accuracy?.toFixed(0) ?? '?'}m` : 'GPS 대기'}
        </span>
      </div>

      {/* 앱 로고 — invert(흰배경→검정) + screen(검정은 배경에 흡수, 로고는 밝게) */}
      <Image
        src="/icons/logo.png"
        alt="willyNavi"
        width={120}
        height={28}
        priority
        style={{
          objectFit: 'contain',
          filter: 'invert(1)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 스내핑 상태 */}
      <span className="font-vfd text-xs" style={{ color: '#004422' }}>
        {snappingCount} NODE
      </span>
    </div>
  );
}
