/**
 * WillyNavi ITS Proxy Worker
 * Cloudflare ICN(인천) 엣지에서 한국 ITS API를 대리 호출
 *
 * 엔드포인트:
 *   GET /cctv?minX=&maxX=&minY=&maxY=   → ITS CCTV 목록 JSON
 *   GET /signal?id={itstId}              → ITS 신호 잔여시간 JSON
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ITS XML → JSON 파서 (route.ts 동일 로직)
function parseITSXML(xml) {
  const results = [];
  for (const match of xml.matchAll(/<data>([\s\S]*?)<\/data>/g)) {
    const obj = {};
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

async function handleCCTV(url, env) {
  const p = url.searchParams;
  const minX = p.get('minX') ?? p.get('minLng') ?? '126';
  const maxX = p.get('maxX') ?? p.get('maxLng') ?? '130';
  const minY = p.get('minY') ?? p.get('minLat') ?? '34';
  const maxY = p.get('maxY') ?? p.get('maxLat') ?? '38';

  const params = new URLSearchParams({
    apiKey:   env.ITS_API_KEY,
    type:     'all',
    cctvType: '1',
    minX, maxX, minY, maxY,
    getType:  'xml',
  });

  const res = await fetch(
    `https://openapi.its.go.kr:9443/cctvInfo?${params}`,
    { signal: AbortSignal.timeout(8000) },
  );

  if (!res.ok) return json({ error: `ITS HTTP ${res.status}` }, 502);

  const rows = parseITSXML(await res.text());
  return json({ response: { data: rows }, source: 'its' });
}

async function handleSignal(url, env) {
  const itstId = url.searchParams.get('id');

  // 1) 국가 ITS 신호 API
  const itsParams = new URLSearchParams({
    key:  env.ITS_API_KEY,
    type: 'ex',
    ...(itstId ? { itstId } : {}),
  });
  const ITS_SIGNAL_URLS = [
    'http://openapi.its.go.kr/api/NSignalPhaseInfo',
    'http://openapi.its.go.kr/api/NCITSSignalInfo',
    'http://openapi.its.go.kr/api/NSignalInfo',
  ];
  for (const base of ITS_SIGNAL_URLS) {
    try {
      const res = await fetch(`${base}?${itsParams}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const rows = data?.response?.data ?? data?.Data ?? data?.data ?? [];
      if (rows.length > 0) return json(rows[0]);
    } catch { /* next */ }
  }

  return json({ error: 'signal not found' }, 404);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/cctv')   return await handleCCTV(url, env);
      if (url.pathname === '/signal') return await handleSignal(url, env);
      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: e.message ?? 'internal error' }, 500);
    }
  },
};
