'use client';
import { useRef, useState } from 'react';
import { CCTVNode } from '@/types';
import { useHLSPlayer } from '@/hooks/useCCTV';

interface CCTVPanelProps {
  cctv: CCTVNode | null;
}

// ─── CCTV HLS 스트리밍 패널 ────────────────────────────────────────────────────
export function CCTVPanel({ cctv }: CCTVPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useHLSPlayer(videoRef, cctv?.streamUrl ?? null);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: '#0a0a0a',
        border: '2px solid #2a2a3a',
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
        <span className="font-vfd text-xs" style={{ color: '#00ff88', letterSpacing: '0.15em' }}>
          ▶ CCTV LIVE
        </span>
        <span className="font-vfd text-xs truncate max-w-[60%]" style={{ color: '#004422' }}>
          {cctv?.name ?? '---'}
        </span>
        <span className="font-vfd text-xs" style={{ color: '#004422' }}>
          {cctv?.source ?? '---'}
        </span>
      </div>

      {/* 비디오 영역 */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        {cctv ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={() => { setIsError(true); setIsLoading(false); }}
            />
            {isLoading && !isError && <LoadingOverlay />}
            {isError && <ErrorOverlay name={cctv.name} />}
          </>
        ) : (
          <NoCCTVOverlay />
        )}
      </div>

      {/* 도로명 푸터 */}
      {cctv?.roadName && (
        <div
          className="px-3 py-1"
          style={{ background: '#0d0d12', borderTop: '1px solid #1a1a24' }}
        >
          <span className="font-vfd text-xs" style={{ color: '#004422' }}>
            {cctv.roadName}
          </span>
        </div>
      )}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <div className="font-vfd text-sm animate-pulse_glow" style={{ color: '#00ff88' }}>
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

function ErrorOverlay({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
      <span className="font-vfd text-xs" style={{ color: '#ff4400' }}>스트림 오류</span>
      <span className="font-vfd text-xs mt-1 text-center px-4" style={{ color: '#004422' }}>
        {name}
      </span>
    </div>
  );
}

function NoCCTVOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95">
      <div className="font-vfd text-sm" style={{ color: '#004422', letterSpacing: '0.1em' }}>
        NO SIGNAL
      </div>
      <div className="mt-1 font-vfd text-xs" style={{ color: '#021a0e' }}>
        전방 CCTV 없음
      </div>
    </div>
  );
}
