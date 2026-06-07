import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ roadName: null }, { status: 400 });
  }

  const key = process.env.TMAP_API_KEY ?? process.env.NEXT_PUBLIC_TMAP_API_KEY;
  if (!key) {
    console.warn('[road-name] TMAP API key not set');
    return NextResponse.json({ roadName: null });
  }

  try {
    const params = new URLSearchParams({
      version:     '1',
      lat,
      lon:         lng,
      coordType:   'WGS84GEO',
      addressType: 'A04',  // 도로명주소
      appKey:      key,
    });

    const res = await fetch(
      `https://apis.openapi.sk.com/tmap/geo/reversegeocoding?${params}`,
      { cache: 'no-store' },
    );

    if (!res.ok) return NextResponse.json({ roadName: null });

    const json = await res.json();
    const info = json?.addressInfo;

    // 도로명 우선, 없으면 읍면동명 사용
    const roadName: string | null = info?.roadName || info?.eupmyundong || null;

    return NextResponse.json({ roadName }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    console.error('[road-name] fetch failed:', e);
    return NextResponse.json({ roadName: null });
  }
}
