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

  useEffect(() => {
    setIsError(false);
    setIsLoading(true);
    setRetryKey(0);
  }, [cctv?.id]);

  const handleError = () => { setIsError(true); setIsLoading(false); };
  const handleRetry = () => { setIsError(false); setIsLoading(true); setRetryKey((k) => k + 1); };

  const streamUrl = cctv && !isMockUrl(cctv.streamUrl) ? cctv.streamUrl : null;
  useHLSPlayer(videoRef, streamUrl, handleError, retryKey);

  const isMock = cctv ? isMockUrl(cctv.streamUrl) : false;
  const sourceLabel = isMock ? 'MOCK' : (cctv?.source ?? '---');

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0E1018', border: '1px solid var(--border)' }}
    >
      <div
        className="flex justify-between items-center px-3 py-1.5"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-vfd text-xs" style={{ color: 'var(--tl-green)', letterSpacing: '0.15em' }}>
          ▶ LIVE
        </span>
        <span className="font-vfd text-xs truncate max-w-[55%]" style={{ color: 'var(--text-secondary)' }}>
          {cctv?.name ?? '---'}
        </span>
        <span className="font-vfd text-xs" style={{ color: isMock ? 'var(--tl-yellow)' : 'var(--text-dim)' }}>
          {sourceLabel}
        </span>
      </div>

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
              autoPlay muted playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={handleError}
            />
            {isLoading && !isError && <LoadingOverlay />}
            {isError && <ErrorOverlay name={cctv.name} onRetry={handleRetry} />}
          </>
        )}
      </div>

      {cctv?.roadName && (
        <div className="px-3 py-1.5" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
          <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
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
      <span className="font-vfd text-xs" style={{ color: 'var(--tl-yellow)', letterSpacing: '0.1em' }}>
        실 스트림 미연결
      </span>
      <span className="font-vfd text-xs text-center px-4" style={{ color: 'var(--text-dim)' }}>
        {name}
      </span>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-2">
      <div className="font-vfd text-sm animate-pulse" style={{ color: '#00E676' }}>
        스트림 연결 중...
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#00E676', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function ErrorOverlay({ name, onRetry }: { name: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-2">
      <span className="font-vfd text-xs" style={{ color: 'var(--tl-red)' }}>스트림 오류</span>
      <span className="font-vfd text-xs text-center px-4" style={{ color: 'var(--text-dim)' }}>{name}</span>
      <button
        onClick={onRetry}
        className="font-vfd text-xs px-3 py-1 rounded"
        style={{
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          background: 'rgba(91,159,255,0.08)',
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
      <div className="font-vfd text-sm" style={{ color: 'var(--tl-red)', letterSpacing: '0.1em' }}>
        CCTV 정보 없음
      </div>
      <div className="font-vfd text-xs text-center px-6" style={{ color: 'var(--text-dim)' }}>
        현재 위치 주변 CCTV 미제공 구간
      </div>
    </div>
  );
}
