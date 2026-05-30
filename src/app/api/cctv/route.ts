import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CCTV_NODES } from '@/data/mockNodes';

// 국가 ITS CCTV API (Java 샘플 기준 확인)
const ITS_CCTV_URLS = [
  'https://openapi.its.go.kr:9443/cctvInfo',
  'http://openapi.its.go.kr:9443/cctvInfo',
];

// 서울시 열린데이터광장 CCTV API 서비스명 후보
// TODO: data.seoul.go.kr 해당 데이터셋 → API 명세 → 서비스명(영문) 확인 후 맨 앞에 추가
const SEOUL_SERVICE_NAMES = [
  'SeoulRtdTrfficInfo',
  'SfrCctvInfoInqireService',
  'CCTV_INFO',
  'SeoulRtd',
];

// 경기도 교통정보센터(GITS) CCTV API 후보
const GG_CCTV_URLS = [
  'https://openapigits.gg.go.kr/api/json/getCctvInfo',
  'https://openapigits.gg.go.kr/api/json/getRoadCctvInfo',
  'https://openapigits.gg.go.kr/api/json/getCCTVInfoList',
  'https://openapigits.gg.go.kr/api/json/getCCTV',
];

export async function GET(req: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const { searchParams } = req.nextUrl;

  const minLat = parseFloat(searchParams.get('minY') ?? searchParams.get('minLat') ?? '0');
  const maxLat = parseFloat(searchParams.get('maxY') ?? searchParams.get('maxLat') ?? '90');
  const minLng = parseFloat(searchParams.get('minX') ?? searchParams.get('minLng') ?? '0');
  const maxLng = parseFloat(searchParams.get('maxX') ?? searchParams.get('maxLng') ?? '180');

  if (!useMock) {
    // ── 0. Cloudflare Worker 프록시 (한국 ICN 엣지, 우선 시도) ────────────────
    const cfWorkerUrl = process.env.CF_WORKER_URL;
    if (cfWorkerUrl) {
      try {
        const params = new URLSearchParams({
          minX: String(minLng), maxX: String(maxLng),
          minY: String(minLat), maxY: String(maxLat),
        });
        const res = await fetch(`${cfWorkerUrl}/cctv?${params}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = await res.json();
          const rows = data?.response?.data ?? [];
          if (rows.length > 0) {
            return NextResponse.json({ response: { data: rows }, source: 'its' });
          }
        }
      } catch (e) {
        console.error('[CCTV] CF Worker 실패:', (e as Error).message);
      }
    }

    // ── 1. 국가 ITS CCTV API (Vercel IP로 직접 시도, 국내 배포 시 동작) ────────
    const itsKey = process.env.ITS_API_KEY;
    if (itsKey) {
      const params = new URLSearchParams({
        apiKey:   itsKey,
        type:     'all',
        cctvType: '1',
        minX:     String(minLng),
        maxX:     String(maxLng),
        minY:     String(minLat),
        maxY:     String(maxLat),
        getType:  'xml',
      });
      for (const baseUrl of ITS_CCTV_URLS) {
        try {
          const res = await fetch(`${baseUrl}?${params}`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok) {
            console.error(`[CCTV] ITS ${baseUrl} → HTTP ${res.status}`);
            continue;
          }
          const rows = parseITSXML(await res.text());
          if (rows.length > 0) {
            return NextResponse.json({ response: { data: rows }, source: 'its' });
          }
          console.error(`[CCTV] ITS ${baseUrl} → 파싱 결과 0건`);
        } catch (e) {
          console.error(`[CCTV] ITS ${baseUrl} → 예외:`, (e as Error).message);
        }
      }
    }

    // ── 2. 서울시 CCTV API ───────────────────────────────────────────────────
    const seoulKey = process.env.SEOUL_API_KEY;
    if (seoulKey) {
      for (const svcName of SEOUL_SERVICE_NAMES) {
        try {
          const url = `http://openapi.seoul.go.kr:8088/${seoulKey}/json/${svcName}/1/100/`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (!res.ok) continue;
          const json = await res.json();
          const rows: Record<string, string>[] =
            json?.[svcName]?.row ?? json?.SeoulRtd?.row ?? json?.row ?? [];
          if (rows.length === 0) continue;
          const normalized = rows
            .filter((r) => {
              const lat = parseFloat(r.LATITUDE ?? r.coordy ?? '0');
              const lng = parseFloat(r.LONGITUDE ?? r.coordx ?? '0');
              return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
            })
            .map((r) => ({
              cctvid:        r.CCTV_ID ?? `seoul-${r.LATITUDE}_${r.LONGITUDE}`,
              cctvname:      r.CCTV_NAME ?? r.cctvname ?? '서울 CCTV',
              coordy:        r.LATITUDE ?? r.coordy ?? '0',
              coordx:        r.LONGITUDE ?? r.coordx ?? '0',
              cctvurl:       (r.CCTV_URL ?? r.cctvurl ?? '').replace(/^http:\/\//i, 'https://'),
              cctvformat:    'HLS',
              roadsectionid: r.ROAD_NM ?? r.roadsectionid ?? '',
            }));
          if (normalized.length > 0) {
            return NextResponse.json({ response: { data: normalized }, source: 'seoul' });
          }
        } catch { /* 다음 서비스명 */ }
      }
    }

    // ── 3. 경기도 GITS CCTV API ──────────────────────────────────────────────
    const ggKey = process.env.GG_API_KEY;
    if (ggKey) {
      const ggParams = new URLSearchParams({
        serviceKey: ggKey,
        minLat:     String(minLat),
        maxLat:     String(maxLat),
        minLon:     String(minLng),
        maxLon:     String(maxLng),
        pageNo:     '1',
        numOfRows:  '50',
        type:       'json',
      });
      for (const url of GG_CCTV_URLS) {
        try {
          const res = await fetch(`${url}?${ggParams}`, { signal: AbortSignal.timeout(4000) });
          if (!res.ok) continue;
          const json = await res.json();
          const rows: Record<string, string>[] =
            json?.response?.body?.items?.item ?? json?.items?.item ?? json?.data ?? [];
          const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
          const normalized = list
            .filter((r) => r.cctvUrl || r.CCTV_URL || r.streamUrl)
            .map((r) => ({
              cctvid:        r.cctvId ?? r.CCTV_ID ?? `gg-${r.lat}_${r.lon}`,
              cctvname:      r.cctvName ?? r.CCTV_NAME ?? '경기 CCTV',
              coordy:        r.lat ?? r.latitude ?? r.coordY ?? '0',
              coordx:        r.lon ?? r.longitude ?? r.coordX ?? '0',
              cctvurl:       (r.cctvUrl ?? r.CCTV_URL ?? r.streamUrl ?? '')
                               .replace(/^http:\/\//i, 'https://'),
              cctvformat:    'HLS',
              roadsectionid: r.roadNm ?? r.ROAD_NM ?? '',
            }));
          if (normalized.length > 0) {
            return NextResponse.json({ response: { data: normalized }, source: 'gg' });
          }
        } catch { /* 다음 후보 */ }
      }
    }
  }

  // ── 4. Mock 폴백 ──────────────────────────────────────────────────────────
  const filtered = MOCK_CCTV_NODES.filter(
    (n) =>
      n.coordinate.lat >= minLat && n.coordinate.lat <= maxLat &&
      n.coordinate.lng >= minLng && n.coordinate.lng <= maxLng,
  );
  return NextResponse.json({ response: { data: filtered.map(toMockRaw) }, source: 'mock' });
}

// ─── ITS XML 파서 ────────────────────────────────────────────────────────────
function parseITSXML(xml: string): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  for (const match of xml.matchAll(/<data>([\s\S]*?)<\/data>/g)) {
    const obj: Record<string, string> = {};
    for (const [, key, value] of match[1].matchAll(/<(\w+)>([^<]*)<\/\1>/g)) {
      let v = value.trim().replace(/;$/, '');
      if (key === 'cctvurl') v = v.replace(/^http:\/\//i, 'https://');
      obj[key] = v;
    }
    if (obj.coordy && obj.coordx && obj.cctvurl) {
      if (!obj.cctvid) obj.cctvid = `${obj.coordy}_${obj.coordx}`;
      results.push(obj);
    }
  }
  return results;
}

function toMockRaw(node: (typeof MOCK_CCTV_NODES)[0]) {
  return {
    cctvid:        node.id,
    cctvname:      node.name,
    coordy:        String(node.coordinate.lat),
    coordx:        String(node.coordinate.lng),
    cctvurl:       node.streamUrl,
    cctvformat:    'HLS',
    roadsectionid: node.roadName ?? '',
  };
}
