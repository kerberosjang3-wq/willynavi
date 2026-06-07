import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat    = searchParams.get('lat');
  const lng    = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '3500';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
  }

  // .env.local 에는 NEXT_PUBLIC_TMAP_API_KEY 로 저장되어 있음
  // 서버 사이드에서는 두 이름 모두 접근 가능하므로 순서대로 시도
  const key = process.env.TMAP_API_KEY ?? process.env.NEXT_PUBLIC_TMAP_API_KEY;
  if (!key) {
    console.warn('[speed-cameras] TMAP API key not set');
    return NextResponse.json({ resultData: { body: [] } });
  }

  try {
    const params = new URLSearchParams({ version: '1', lat, lon: lng, radius, appKey: key });
    const res = await fetch(
      `https://apis.openapi.sk.com/tmap/safety/speed?${params}`,
      { cache: 'no-store' },
    );

    if (!res.ok) {
      console.error(`[speed-cameras] T-Map API error: HTTP ${res.status}`);
      return NextResponse.json({ resultData: { body: [] } });
    }

    const json = await res.json();
    return NextResponse.json(json, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    console.error('[speed-cameras] fetch failed:', e);
    return NextResponse.json({ resultData: { body: [] } });
  }
}
