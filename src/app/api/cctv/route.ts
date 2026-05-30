import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CCTV_NODES } from '@/data/mockNodes';

// ITS CCTV API 확인된 엔드포인트 (Java 샘플 소스 기준)
const CCTV_URLS = [
  'https://openapi.its.go.kr:9443/cctvInfo',
  'http://openapi.its.go.kr:9443/cctvInfo',
];

export async function GET(req: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const { searchParams } = req.nextUrl;

  const minLat = parseFloat(searchParams.get('minY') ?? searchParams.get('minLat') ?? '0');
  const maxLat = parseFloat(searchParams.get('maxY') ?? searchParams.get('maxLat') ?? '90');
  const minLng = parseFloat(searchParams.get('minX') ?? searchParams.get('minLng') ?? '0');
  const maxLng = parseFloat(searchParams.get('maxX') ?? searchParams.get('maxLng') ?? '180');

  if (!useMock) {
    const apiKey = process.env.ITS_API_KEY;
    if (apiKey) {
      const params = new URLSearchParams({
        apiKey:   apiKey,   // 파라미터명 apiKey (Java 샘플 확인)
        type:     'all',    // 도로유형: all=전체, its=국도, ex=고속도로
        cctvType: '1',      // CCTV유형: 1=동영상, 2=이미지
        minX:     String(minLng),
        maxX:     String(maxLng),
        minY:     String(minLat),
        maxY:     String(maxLat),
        getType:  'xml',    // 출력타입: xml
      });

      for (const baseUrl of CCTV_URLS) {
        try {
          const res = await fetch(`${baseUrl}?${params}`, {
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000),
            headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
          });
          if (!res.ok) continue;

          const text = await res.text();

          // XML 응답 파싱 (ITS API는 XML 반환)
          const rows = parseITSXML(text);
          if (rows.length > 0) {
            return NextResponse.json({ response: { data: rows } });
          }

          // JSON 응답 시도 (혹시 JSON일 경우 대비)
          try {
            const json = JSON.parse(text);
            const jsonRows = json?.response?.data ?? json?.Data ?? json?.data ?? [];
            if (jsonRows.length > 0) {
              return NextResponse.json({ response: { data: jsonRows } });
            }
          } catch { /* XML이었으면 무시 */ }
        } catch { /* 다음 후보 */ }
      }
    }
  }

  // Mock 폴백: bbox 내 Mock CCTV 반환
  const filtered = MOCK_CCTV_NODES.filter(
    (n) =>
      n.coordinate.lat >= minLat && n.coordinate.lat <= maxLat &&
      n.coordinate.lng >= minLng && n.coordinate.lng <= maxLng,
  );
  return NextResponse.json({ response: { data: filtered.map(toMockRaw) } });
}

// ─── ITS XML 응답 파서 ────────────────────────────────────────────────────────
// 실제 응답 예시:
// <data>
//   <cctvname>[수도권제1순환선] 성남;</cctvname>
//   <cctvurl>http://cctvsec.ktict.co.kr/2/...</cctvurl>
//   <coordy>37.42889</coordy>
//   <coordx>127.12361;</coordx>
//   <cctvformat>HLS</cctvformat>
//   <cctvtype>1</cctvtype>
//   <roadsectionid/>
// </data>
function parseITSXML(xml: string): Record<string, string>[] {
  const results: Record<string, string>[] = [];
  const dataBlocks = xml.matchAll(/<data>([\s\S]*?)<\/data>/g);

  for (const match of dataBlocks) {
    const block = match[1];
    const obj: Record<string, string> = {};

    // 각 필드 추출
    const fields = block.matchAll(/<(\w+)>([^<]*)<\/\1>/g);
    for (const [, key, value] of fields) {
      // 세미콜론 제거 (coordx, cctvname 등에 붙어오는 경우)
      obj[key] = value.trim().replace(/;$/, '');
    }

    // 필수 필드 있는 것만 포함
    if (obj.coordy && obj.coordx && obj.cctvurl) {
      // cctvid가 없으면 좌표로 생성
      if (!obj.cctvid) {
        obj.cctvid = `${obj.coordy}_${obj.coordx}`;
      }
      results.push(obj);
    }
  }

  return results;
}

// Mock 노드 → ITS 원시 포맷 변환
function toMockRaw(node: (typeof MOCK_CCTV_NODES)[0]) {
  return {
    cctvid:       node.id,
    cctvname:     node.name,
    coordy:       String(node.coordinate.lat),
    coordx:       String(node.coordinate.lng),
    cctvurl:      node.streamUrl,
    cctvformat:   'HLS',
    roadsectionid: node.roadName ?? '',
  };
}
