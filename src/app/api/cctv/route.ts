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

export async function GET(req: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const { searchParams } = req.nextUrl;

  const minLat = parseFloat(searchParams.get('minY') ?? searchParams.get('minLat') ?? '0');
  const maxLat = parseFloat(searchParams.get('maxY') ?? searchParams.get('maxLat') ?? '90');
  const minLng = parseFloat(searchParams.get('minX') ?? searchParams.get('minLng') ?? '0');
  const maxLng = parseFloat(searchParams.get('maxX') ?? searchParams.get('maxLng') ?? '180');

  if (!useMock) {
    // ── 1. 국가 ITS CCTV API ─────────────────────────────────────────────────
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
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000),
            headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
          });
          if (!res.ok) continue;
          const text = await res.text();
          const rows = parseITSXML(text);
          if (rows.length > 0) {
            return NextResponse.json({ response: { data: rows }, source: 'its' });
          }
        } catch { /* 다음 후보 */ }
      }
    }

    // ── 2. 서울시 CCTV API ───────────────────────────────────────────────────
    const seoulKey = process.env.SEOUL_API_KEY;
    if (seoulKey) {
      for (const svcName of SEOUL_SERVICE_NAMES) {
        try {
          // 서울 OpenAPI 표준 URL: /{KEY}/json/{SERVICE}/{START}/{END}/
          const url = `http://openapi.seoul.go.kr:8088/${seoulKey}/json/${svcName}/1/100/`;
          const res = await fetch(url, {
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) continue;
          const json = await res.json();

          // 서울 API 응답 구조 정규화
          const rows: Record<string, string>[] =
            json?.[svcName]?.row ??
            json?.SeoulRtd?.row ??
            json?.row ??
            [];

          if (rows.length === 0) continue;

          // bbox 필터 + 정규화
          const normalized = rows
            .filter((r) => {
              const lat = parseFloat(r.LATITUDE ?? r.coordy ?? '0');
              const lng = parseFloat(r.LONGITUDE ?? r.coordx ?? '0');
              return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
            })
            .map((r) => ({
              cctvid:       r.CCTV_ID ?? `seoul-${r.LATITUDE}_${r.LONGITUDE}`,
              cctvname:     r.CCTV_NAME ?? r.cctvname ?? '서울 CCTV',
              coordy:       r.LATITUDE ?? r.coordy ?? '0',
              coordx:       r.LONGITUDE ?? r.coordx ?? '0',
              cctvurl:      (r.CCTV_URL ?? r.cctvurl ?? '').replace(/^http:\/\//i, 'https://'),
              cctvformat:   'HLS',
              roadsectionid: r.ROAD_NM ?? r.roadsectionid ?? '',
            }));

          if (normalized.length > 0) {
            return NextResponse.json({ response: { data: normalized }, source: 'seoul' });
          }
        } catch { /* 다음 서비스명 시도 */ }
      }
    }
  }

  // ── 3. Mock 폴백 ──────────────────────────────────────────────────────────
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
