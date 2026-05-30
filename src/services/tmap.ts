'use client';

const BASE = 'https://apis.openapi.sk.com/tmap';

export interface GeoPoint {
  lat:  number;
  lng:  number;
  name: string;
  addr?: string;
}

// T-Map 경로 옵션값 (optionValue)
export type TMapRouteOption =
  | '0'   // 추천 (기본)
  | '1'   // 최단거리
  | '2'   // 무료도로 우선
  | '3'   // 고속도로 우선
  | '4'   // 고속도로 회피
  | '5';  // 유료도로 회피

export interface TMapRouteOptions {
  optionValue?: TMapRouteOption;
  trafficInfo?: 'Y' | 'N';    // 실시간 교통 반영
}

// ── POI 검색 (키워드 → 좌표 후보 목록) ──────────────────────────────────────
export async function searchTMapPOI(keyword: string): Promise<GeoPoint[]> {
  const key = process.env.NEXT_PUBLIC_TMAP_API_KEY;
  if (!key || !keyword.trim()) return [];

  const params = new URLSearchParams({
    version:        '1',
    searchKeyword:  keyword,
    resCoordType:   'WGS84GEO',
    reqCoordType:   'WGS84GEO',
    count:          '7',
    appKey:         key,
  });

  const r = await fetch(`${BASE}/pois?${params}`);
  if (!r.ok) throw new Error(`POI 검색 실패: ${r.status}`);
  const d = await r.json();
  const pois: Record<string, string>[] = d?.searchPoiInfo?.pois?.poi ?? [];
  return pois
    .filter((p) => p.noorLat && p.noorLon)
    .map((p) => ({
      lat:  parseFloat(p.noorLat),
      lng:  parseFloat(p.noorLon),
      name: p.name ?? keyword,
      addr: [p.upperAddrName, p.middleAddrName, p.lowerAddrName]
        .filter(Boolean).join(' '),
    }));
}

// ── 경로 계산 → 폴리라인 [lng, lat][] 반환 ────────────────────────────────
export async function getTMapRoute(
  start:   GeoPoint,
  end:     GeoPoint,
  options: TMapRouteOptions = {},
): Promise<[number, number][]> {
  const key = process.env.NEXT_PUBLIC_TMAP_API_KEY;
  if (!key) throw new Error('TMAP_API_KEY 없음');

  const r = await fetch(`${BASE}/routes?version=1&format=json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', appKey: key },
    body: JSON.stringify({
      startX:       String(start.lng),
      startY:       String(start.lat),
      endX:         String(end.lng),
      endY:         String(end.lat),
      reqCoordType: 'WGS84GEO',
      resCoordType: 'WGS84GEO',
      startName:    encodeURIComponent(start.name),
      endName:      encodeURIComponent(end.name),
      optionValue:  options.optionValue ?? '0',
      trafficInfo:  options.trafficInfo ?? 'Y',
    }),
  });

  if (!r.ok) throw new Error(`경로 계산 실패: ${r.status}`);
  const d = await r.json();

  const coords: [number, number][] = [];
  for (const f of d?.features ?? []) {
    if (f.geometry?.type === 'LineString') {
      coords.push(...(f.geometry.coordinates as [number, number][]));
    }
  }
  return coords;
}
