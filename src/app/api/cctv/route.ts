import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CCTV_NODES } from '@/data/mockNodes';

// 국가교통정보센터 CCTV API 프록시 + Mock 폴백
export async function GET(req: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const { searchParams } = req.nextUrl;

  if (useMock) {
    const minLat = parseFloat(searchParams.get('minY') ?? searchParams.get('minLat') ?? '0');
    const maxLat = parseFloat(searchParams.get('maxY') ?? searchParams.get('maxLat') ?? '90');
    const minLng = parseFloat(searchParams.get('minX') ?? searchParams.get('minLng') ?? '0');
    const maxLng = parseFloat(searchParams.get('maxX') ?? searchParams.get('maxLng') ?? '180');

    const filtered = MOCK_CCTV_NODES.filter(
      (n) =>
        n.coordinate.lat >= minLat &&
        n.coordinate.lat <= maxLat &&
        n.coordinate.lng >= minLng &&
        n.coordinate.lng <= maxLng,
    );

    return NextResponse.json({ response: { data: filtered.map(toRawITS) } });
  }

  const apiKey = process.env.ITS_API_KEY;
  const minLat = parseFloat(searchParams.get('minY') ?? searchParams.get('minLat') ?? '0');
  const maxLat = parseFloat(searchParams.get('maxY') ?? searchParams.get('maxLat') ?? '90');
  const minLng = parseFloat(searchParams.get('minX') ?? searchParams.get('minLng') ?? '0');
  const maxLng = parseFloat(searchParams.get('maxX') ?? searchParams.get('maxLng') ?? '180');

  if (apiKey) {
    const CCTV_URLS = [
      'http://openapi.its.go.kr/api/NCCTVInfo',
      'https://openapi.its.go.kr/api/NCCTVInfo',
    ];
    const params = new URLSearchParams({
      key: apiKey,
      ReqType: '2',
      MinX: searchParams.get('minX') ?? String(minLng),
      MaxX: searchParams.get('maxX') ?? String(maxLng),
      MinY: searchParams.get('minY') ?? String(minLat),
      MaxY: searchParams.get('maxY') ?? String(maxLat),
      type: 'ex',
    });

    for (const baseUrl of CCTV_URLS) {
      try {
        const upstream = await fetch(`${baseUrl}?${params}`, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(5000),
        });
        if (!upstream.ok) continue;
        const data = await upstream.json();
        const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];
        if (rows.length > 0) {
          return NextResponse.json({ response: { data: rows } });
        }
      } catch { /* 다음 후보 또는 Mock 폴백 */ }
    }
  }

  // 실API 실패 → bbox 내 Mock CCTV 반환
  const filtered = MOCK_CCTV_NODES.filter(
    (n) =>
      n.coordinate.lat >= minLat && n.coordinate.lat <= maxLat &&
      n.coordinate.lng >= minLng && n.coordinate.lng <= maxLng,
  );
  return NextResponse.json({ response: { data: filtered.map(toRawITS) } });
}

function toRawITS(node: (typeof MOCK_CCTV_NODES)[0]) {
  return {
    cctvid: node.id,
    cctvname: node.name,
    coordy: String(node.coordinate.lat),
    coordx: String(node.coordinate.lng),
    cctvurl: node.streamUrl,
    roadsectionid: node.roadName ?? '',
  };
}
