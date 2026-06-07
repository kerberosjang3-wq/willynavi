'use client';
import { useEffect, useRef } from 'react';
import NoSleep from 'nosleep.js';

// 화면 잠금 방지
// - Android Chrome / Samsung Internet: Screen Wake Lock API (네이티브)
// - iPhone Safari: 무음 동영상 루프 재생으로 우회 (nosleep.js)
// 첫 터치 후 활성화, 화면 복귀 시 자동 재취득
export function useWakeLock() {
  const noSleepRef = useRef<NoSleep | null>(null);
  const enabledRef = useRef(false); // 사용자가 한 번이라도 활성화했는지 추적

  useEffect(() => {
    noSleepRef.current = new NoSleep();

    const doEnable = () => {
      noSleepRef.current?.enable().catch(() => {});
    };

    const enable = () => {
      enabledRef.current = true;
      doEnable();
    };

    // Android: Wake Lock API는 페이지가 hidden → visible 복귀 시 자동 해제됨
    // → visibilitychange에서 재취득해야 화면 잠금 방지가 유지됨
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        doEnable();
      }
    };

    // 첫 터치/클릭 시 활성화 (iOS 자동재생 정책 대응)
    document.addEventListener('touchstart', enable, { capture: true, once: true });
    document.addEventListener('click',      enable, { capture: true, once: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('touchstart', enable, { capture: true });
      document.removeEventListener('click',      enable, { capture: true });
      document.removeEventListener('visibilitychange', onVisibilityChange);
      noSleepRef.current?.disable();
    };
  }, []);
}
