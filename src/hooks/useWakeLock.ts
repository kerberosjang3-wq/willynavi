'use client';
import { useEffect, useRef } from 'react';

// 화면 잠금 방지 — 앱이 포그라운드에 있는 동안 Wake Lock 유지
// 탭 전환·화면 off 후 복귀 시 자동 재획득
export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // 배터리 부족 등으로 실패해도 무시
    }
  };

  useEffect(() => {
    acquire();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      lockRef.current?.release().catch(() => {});
    };
  }, []);
}
