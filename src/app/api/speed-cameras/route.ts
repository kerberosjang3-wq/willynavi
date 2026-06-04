import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat    = searchParams.get('lat');
  const lng    = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '3500';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
  }

  const key = process.env.TMAP_API_KEY;
  if (!key) {
    return NextResponse.json({ resultData: { body: [] } });
  }

  try {
    const params = new URLSearchParams({ version: '1', lat, lon: lng, radius, appKey: key });
    const res = await fetch(
      `https://apis.openapi.sk.com/tmap/safety/speed?${params}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return NextResponse.json({ resultData: { body: [] } });
    const json = await res.json();
    return NextResponse.json(json, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ resultData: { body: [] } });
  }
}
