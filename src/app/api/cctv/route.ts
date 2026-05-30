import { NextRequest, NextResponse } from 'next/server';

// Vercel 서버에서 이 라우트로 오는 경우:
//  - 브라우저가 CF Worker(NEXT_PUBLIC_CF_WORKER_URL) 직접 호출에 실패했을 때만 도달
//  - ITS API(openapi.its.go.kr:9443)는 Vercel IP 차단으로 항상 timeout → 호출 안 함
//  - 브라우저 측 useNearbyNodes.ts 가 applyStaticFallback()으로 정적 데이터 사용
//
// 따라서 이 라우트는 빈 응답을 즉시 반환해 Vercel 함수 timeout을 방지한다.
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { response: { data: [] }, source: 'unavailable' },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
