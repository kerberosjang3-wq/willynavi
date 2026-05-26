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
  if (!apiKey) return NextResponse.json({ error: 'ITS_API_KEY not set' }, { status: 500 });

  try {
    const params = new URLSearchParams({
      key: apiKey,
      ReqType: '2',
      MinX: searchParams.get('minX') ?? '126',
      MaxX: searchParams.get('maxX') ?? '128',
      MinY: searchParams.get('minY') ?? '37',
      MaxY: searchParams.get('maxY') ?? '38',
      type: 'ex',
    });

    const upstream = await fetch(
      `http://openapi.its.go.kr/api/NCCTVInfo?${params}`,
      { next: { revalidate: 60 } },
    );
    const data = await upstream.json();
    // 신규 API 응답 구조 정규화
    const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];
    return NextResponse.json({ response: { data: rows } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
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
