'use client';
import { useEffect, useRef, useState } from 'react';
import { Coordinate, GPSPosition } from '@/types';
import { estimateHeading } from '@/utils/geo.utils';

interface GeolocationState {
  position: GPSPosition | null;
  error: string | null;
  isWatching: boolean;
}

// GPS heading 이 null 일 때 연속 좌표로 방향을 추정하는 위치 훅
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isWatching: false,
  });

  const prevCoord = useRef<Coordinate | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Geolocation을 지원하지 않는 브라우저입니다.' }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 1_000,
    };

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, heading, speed, accuracy } = pos.coords;
        const curr: Coordinate = { lat, lng };

        // 네이티브 heading 이 없으면 이전 좌표로 추정
        let finalHeading: number | null = heading;
        if ((finalHeading === null || finalHeading === undefined) && prevCoord.current) {
          const dist = Math.hypot(lat - prevCoord.current.lat, lng - prevCoord.current.lng);
          if (dist > 0.00001) {
            finalHeading = estimateHeading(prevCoord.current, curr);
          }
        }

        prevCoord.current = curr;

        setState({
          position: {
            lat,
            lng,
            heading: finalHeading,
            speed: speed ?? null,
            accuracy,
            timestamp: pos.timestamp,
          },
          error: null,
          isWatching: true,
        });
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, isWatching: false }));
      },
      options,
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return state;
}
