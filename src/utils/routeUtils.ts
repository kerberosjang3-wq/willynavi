import { CCTVNode } from '@/types';
import { haversineDistance } from './geo.utils';

const DEFAULT_THRESHOLD_M = 300;

export interface RouteCCTV extends CCTVNode {
  routeDistM: number;  // 출발지로부터 경로상 누적 거리(m)
  perpDistM:  number;  // 경로 중심선으로부터 수직 거리(m)
}

// 점 P → 선분 AB 최단거리 + 투영 파라미터 t(0~1)
function pointToSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): { dist: number; t: number } {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0) {
    t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  }
  const cx = ax + t * dx, cy = ay + t * dy;
  const dist = haversineDistance({ lat: py, lng: px }, { lat: cy, lng: cx });
  return { dist, t };
}

// 폴리라인([lng,lat][]) 위에서 경로 threshold 이내 CCTV를 경로 순서로 반환
export function filterCCTVsAlongRoute(
  cctvs: CCTVNode[],
  polyline: [number, number][],
  thresholdM = DEFAULT_THRESHOLD_M,
): RouteCCTV[] {
  if (polyline.length < 2) return [];

  // 세그먼트별 시작 누적 거리
  const segStart: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    const d = haversineDistance(
      { lat: polyline[i - 1][1], lng: polyline[i - 1][0] },
      { lat: polyline[i][1],     lng: polyline[i][0]     },
    );
    segStart.push(segStart[i - 1] + d);
  }

  const results: RouteCCTV[] = [];

  for (const cctv of cctvs) {
    let minDist = Infinity;
    let bestRouteDistM = 0;

    for (let i = 0; i < polyline.length - 1; i++) {
      const [ax, ay] = polyline[i];
      const [bx, by] = polyline[i + 1];
      const { dist, t } = pointToSegment(
        cctv.coordinate.lng, cctv.coordinate.lat,
        ax, ay, bx, by,
      );
      if (dist < minDist) {
        minDist = dist;
        const segLen = haversineDistance(
          { lat: ay, lng: ax }, { lat: by, lng: bx },
        );
        bestRouteDistM = segStart[i] + t * segLen;
      }
    }

    if (minDist <= thresholdM) {
      results.push({
        ...cctv,
        routeDistM: Math.round(bestRouteDistM),
        perpDistM:  Math.round(minDist),
      });
    }
  }

  return results.sort((a, b) => a.routeDistM - b.routeDistM);
}

export function formatDist(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}
