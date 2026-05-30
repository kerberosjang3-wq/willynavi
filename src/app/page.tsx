'use client';
import { useEffect, useMemo, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearbyNodes, type ApiSource } from '@/hooks/useNearbyNodes';
import { useGPSSnapping } from '@/hooks/useGPSSnapping';
import { useCITSSignal } from '@/hooks/useCITSSignal';
import { VFDDisplay } from '@/components/dashboard/VFDDisplay';
import { SignalIndicator } from '@/components/dashboard/SignalIndicator';
import { CCTVPanel } from '@/components/dashboard/CCTVPanel';
import { CCTVList } from '@/components/dashboard/CCTVList';
import { CCTVNode } from '@/types';
import { haversineDistance } from '@/utils/geo.utils';

export default function DashboardPage() {
  const { position, error: gpsError, isWatching } = useGeolocation();
  const { nodes: nearbyNodes, cctvSource, signalSource } = useNearbyNodes(position);
  const snapping = useGPSSnapping(position, { nodes: nearbyNodes, useMock: false });

  // 사용자가 선택한 CCTV (null이면 스내핑 추천 CCTV 자동 사용)
  const [userSelectedCCTV, setUserSelectedCCTV] = useState<CCTVNode | null>(null);

  // 스내핑 추천 CCTV가 바뀌면 사용자 선택 초기화
  const recommendedCCTV = snapping.activeCCTVs[0] ?? null;
  useEffect(() => {
    setUserSelectedCCTV(null);
  }, [recommendedCCTV?.id]);

  const displayedCCTV = userSelectedCCTV ?? recommendedCCTV;

  // 스내핑 1.5km 필터와 무관하게 API가 가져온 모든 CCTV를 거리순 정렬
  const allNearbyCCTVs = useMemo<CCTVNode[]>(() => {
    const cctvs = nearbyNodes.filter((n): n is CCTVNode => n.type === 'CCTV');
    if (!position) return cctvs;
    return cctvs
      .map((c) => ({ ...c, distance: Math.round(haversineDistance(position, c.coordinate)) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [nearbyNodes, position]);
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
        cctvCount={allNearbyCCTVs.length}
        cctvSource={cctvSource}
        signalSource={signalSource}
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

      {/* ── 주변 CCTV 선택 목록 ───────────────────────────────────────── */}
      <CCTVList
        cctvs={allNearbyCCTVs}
        selectedId={displayedCCTV?.id ?? null}
        recommendedId={recommendedCCTV?.id ?? null}
        onSelect={(cctv) => setUserSelectedCCTV(cctv)}
        isWatching={isWatching}
      />

      {/* ── CCTV 스트리밍 패널 ─────────────────────────────────────────── */}
      <CCTVPanel cctv={displayedCCTV} />
    </main>
  );
}

// ─── 상태 표시줄 ────────────────────────────────────────────────────────────
const SOURCE_LABEL: Record<ApiSource, string> = {
  its:     'ITS',
  gg:      'GITS',
  mock:    'MOCK',
  loading: '...',
};
const SOURCE_COLOR: Record<ApiSource, string> = {
  its:     'var(--cyber-cyan)',
  gg:      '#00ff88',
  mock:    'var(--cyber-amber)',
  loading: 'var(--cyber-border)',
};

function StatusBar({
  isWatching,
  gpsError,
  accuracy,
  cctvCount,
  cctvSource,
  signalSource,
}: {
  isWatching: boolean;
  gpsError: string | null;
  accuracy: number | null;
  cctvCount: number;
  cctvSource: ApiSource;
  signalSource: ApiSource;
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

      <span
        className="font-display font-black"
        style={{
          fontSize: '0.85rem',
          letterSpacing: '0.18em',
          color: 'var(--cyber-cyan)',
          textShadow: '0 0 8px #00d4ff, 0 0 20px #0088bb',
        }}
      >
        WILLY<span style={{ color: 'var(--cyber-amber)', margin: '0 1px' }}>·</span>NAVI
      </span>

      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span style={{ fontSize: '0.5rem', color: 'var(--cyber-cyan-dim)', fontFamily: 'inherit' }}>CCTV</span>
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: SOURCE_COLOR[cctvSource] }}>
            {SOURCE_LABEL[cctvSource]}
          </span>
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: 'var(--cyber-cyan)' }}>
            {cctvCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: '0.5rem', color: 'var(--cyber-cyan-dim)', fontFamily: 'inherit' }}>신호</span>
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: SOURCE_COLOR[signalSource] }}>
            {SOURCE_LABEL[signalSource]}
          </span>
        </div>
      </div>
    </div>
  );
}
