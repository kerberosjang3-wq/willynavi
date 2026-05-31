'use client';
import { useEffect, useRef } from 'react';
import NoSleep from 'nosleep.js';

// 화면 잠금 방지
// - Android Chrome / Samsung Internet: Wake Lock API 사용
// - iPhone Safari (iOS): 무음 동영상 루프 재생으로 우회 (nosleep.js)
// 둘 다 사용자 인터랙션(터치/클릭) 후 자동 활성화
export function useWakeLock() {
  const noSleepRef = useRef<NoSleep | null>(null);

  useEffect(() => {
    noSleepRef.current = new NoSleep();

    const enable = () => {
      noSleepRef.current?.enable().catch(() => {});
    };

    // 첫 터치/클릭 시 활성화 (iOS 자동재생 정책 대응)
    document.addEventListener('touchstart', enable, { capture: true, once: true });
    document.addEventListener('click',      enable, { capture: true, once: true });

    return () => {
      document.removeEventListener('touchstart', enable, { capture: true });
      document.removeEventListener('click',      enable, { capture: true });
      noSleepRef.current?.disable();
    };
  }, []);
}
