'use client';
import { useEffect, useRef, useState } from 'react';
import { CCTVNode } from '@/types';
import { useHLSPlayer } from '@/hooks/useCCTV';

interface CCTVPanelProps {
  cctv: CCTVNode | null;
}

function isMockUrl(url: string | undefined): boolean {
  return !url || url.includes('example-its.go.kr') || url.trim() === '';
}

export function CCTVPanel({ cctv }: CCTVPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  // CCTV가 바뀔 때마다 상태 초기화
  useEffect(() => {
    setIsError(false);
    setIsLoading(true);
    setRetryKey(0);
  }, [cctv?.id]);

  const handleError = () => { setIsError(true); setIsLoading(false); };
  const handleRetry = () => { setIsError(false); setIsLoading(true); setRetryKey((k) => k + 1); };

  // Mock URL이면 HLS 로드 시도하지 않음
  const streamUrl = cctv && !isMockUrl(cctv.streamUrl) ? cctv.streamUrl : null;
  useHLSPlayer(videoRef, streamUrl, handleError, retryKey);

  const isMock = cctv ? isMockUrl(cctv.streamUrl) : false;
  const sourceLabel = isMock ? 'MOCK' : (cctv?.source ?? '---');

  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: '#0a0a0a',
        border: '1px solid var(--cyber-border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      }}
    >
      {/* 패널 헤더 */}
      <div
        className="flex justify-between items-center px-3 py-1"
        style={{
          background: 'linear-gradient(90deg, #1a1a24, #12121a)',
          borderBottom: '1px solid #2a2a3a',
        }}
      >
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan)', letterSpacing: '0.15em', textShadow: '0 0 6px #00d4ff66' }}>
          ▶ LIVE
        </span>
        <span className="font-vfd text-xs truncate max-w-[55%]" style={{ color: 'var(--cyber-cyan)', textShadow: '0 0 6px #00d4ff44' }}>
          {cctv?.name ?? '---'}
        </span>
        <span className="font-vfd text-xs" style={{ color: isMock ? 'var(--cyber-amber)' : 'var(--cyber-amber)' }}>
          {sourceLabel}
        </span>
      </div>

      {/* 비디오 영역 */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        {!cctv ? (
          <NoCCTVOverlay />
        ) : isMock ? (
          <MockOverlay name={cctv.name} />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={handleError}
            />
            {isLoading && !isError && <LoadingOverlay />}
            {isError && <ErrorOverlay name={cctv.name} onRetry={handleRetry} />}
          </>
        )}
      </div>

      {/* 도로명 푸터 */}
      {cctv?.roadName && (
        <div
          className="px-3 py-1"
          style={{ background: '#0d0d12', borderTop: '1px solid #1a1a24' }}
        >
          <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em' }}>
            {cctv.roadName}
          </span>
        </div>
      )}
    </div>
  );
}

function MockOverlay({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-2">
      <span className="font-vfd text-xs" style={{ color: 'var(--cyber-amber)', letterSpacing: '0.1em' }}>
        실 스트림 미연결
      </span>
      <span className="font-vfd text-xs text-center px-4" style={{ color: 'var(--cyber-cyan-dim)' }}>
        {name}
      </span>
      <span className="font-vfd text-center px-4" style={{ color: 'var(--cyber-border)', fontSize: '0.5rem' }}>
        ITS API 응답 대기 중
      </span>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <div className="font-vfd text-sm animate-pulse" style={{ color: '#00ff88' }}>
        스트림 연결 중...
      </div>
      <div className="mt-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#00ff88', animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorOverlay({ name, onRetry }: { name: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-2">
      <span className="font-vfd text-xs" style={{ color: '#ff4400' }}>스트림 오류</span>
      <span className="font-vfd text-xs text-center px-4" style={{ color: 'var(--cyber-cyan-dim)' }}>
        {name}
      </span>
      <button
        onClick={onRetry}
        className="font-vfd text-xs px-3 py-1 rounded"
        style={{
          border: '1px solid var(--cyber-cyan)',
          color: 'var(--cyber-cyan)',
          background: 'rgba(0,212,255,0.08)',
          letterSpacing: '0.1em',
          marginTop: 4,
        }}
      >
        ↺ 재시도
      </button>
    </div>
  );
}

function NoCCTVOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 gap-1">
      <div className="font-vfd text-sm" style={{ color: '#ff6644', letterSpacing: '0.1em' }}>
        CCTV 정보 없음
      </div>
      <div className="font-vfd text-xs text-center px-6" style={{ color: 'var(--cyber-border)' }}>
        현재 위치 주변 CCTV 미제공 구간
      </div>
    </div>
  );
}
