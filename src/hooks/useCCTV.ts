'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export function useHLSPlayer(
  videoRef: React.RefObject<HTMLVideoElement>,
  streamUrl: string | null,
  onError?: () => void,
  retryKey = 0,
) {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.removeAttribute('src');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      video.onerror = () => onError?.();
    } else if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, maxBufferLength: 10, maxMaxBufferLength: 20 });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) onError?.();
      });
      hlsRef.current = hls;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  // retryKey 변경 시 강제 재시도
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, streamUrl, retryKey]);
}
