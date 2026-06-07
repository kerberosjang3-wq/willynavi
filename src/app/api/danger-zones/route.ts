import { NextRequest, NextResponse } from 'next/server';

// T-Map 안전운전 위험구간 API
// safetyType 코드:
//   11: 사고다발지점  12: 어린이보호구역사고다발
//   21: 급커브       31: 결빙위험  41: 낙석위험
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat    = searchParams.get('lat');
  const lng    = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '2000';

  if (!lat || !lng) {
    return NextResponse.json({ resultData: { body: [] } }, { status: 400 });
  }

  const key = process.env.TMAP_API_KEY ?? process.env.NEXT_PUBLIC_TMAP_API_KEY;
  if (!key) {
    console.warn('[danger-zones] TMAP API key not set');
    return NextResponse.json({ resultData: { body: [] } });
  }

  try {
    const params = new URLSearchParams({ version: '1', lat, lon: lng, radius, appKey: key });

    const res = await fetch(
      `https://apis.openapi.sk.com/tmap/safety/accident?${params}`,
      { cache: 'no-store' },
    );

    if (!res.ok) {
      console.error(`[danger-zones] T-Map API error: HTTP ${res.status}`);
      return NextResponse.json({ resultData: { body: [] } });
    }

    const json = await res.json();
    return NextResponse.json(json, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[danger-zones] fetch failed:', e);
    return NextResponse.json({ resultData: { body: [] } });
  }
}
