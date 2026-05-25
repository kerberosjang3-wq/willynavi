'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

// HLS 스트림을 <video> 요소에 안전하게 연결하는 훅
// iOS Safari: 네이티브 HLS 지원 / 기타: hls.js 폴리필
export function useHLSPlayer(
  videoRef: React.RefObject<HTMLVideoElement>,
  streamUrl: string | null,
) {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // 기존 인스턴스 정리
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari / iOS — 네이티브 HLS
      video.src = streamUrl;
      video.load();
    } else if (Hls.isSupported()) {
      // Chrome / Android — hls.js
      const hls = new Hls({
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hlsRef.current = hls;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [videoRef, streamUrl]);
}
