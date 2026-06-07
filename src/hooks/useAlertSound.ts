'use client';
import { useCallback, useEffect, useRef } from 'react';

export type AlertType = 'camera' | 'overspeed' | 'danger';

// Web Audio API로 순수 사인파 비프음 생성 (오디오 파일 불필요)
function playTone(ctx: AudioContext, freq: number, durationSec: number, volume = 0.4) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  // 급격한 클리핑 방지: attack + 자연스러운 감쇠
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationSec + 0.05);
}

export function useAlertSound(): (type: AlertType) => void {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // iOS Safari: 사용자 인터랙션 후에만 AudioContext 생성 가능
    const unlock = () => {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext ?? (window as Record<string, unknown>).webkitAudioContext as typeof AudioContext;
        if (Ctx) ctxRef.current = new Ctx();
      }
      ctxRef.current?.resume().catch(() => {});
    };
    document.addEventListener('touchstart', unlock, { capture: true, once: true });
    document.addEventListener('click',      unlock, { capture: true, once: true });
    return () => {
      document.removeEventListener('touchstart', unlock, { capture: true });
      document.removeEventListener('click',      unlock, { capture: true });
    };
  }, []);

  return useCallback((type: AlertType) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    switch (type) {
      case 'camera':
        // 띵~ 단발 (카메라 1km 진입)
        playTone(ctx, 880, 0.45);
        break;

      case 'overspeed':
        // 삐·삐·삐 빠른 3회 (제한속도 초과)
        playTone(ctx, 1320, 0.14);
        setTimeout(() => playTone(ctx, 1320, 0.14), 200);
        setTimeout(() => playTone(ctx, 1320, 0.14), 400);
        break;

      case 'danger':
        // 부우~ 낮은 경고음 (위험구간 500m 진입)
        playTone(ctx, 520, 0.65);
        setTimeout(() => playTone(ctx, 520, 0.65), 750);
        break;
    }
  }, []);
}
