// 올림픽대로 인근 ITS CCTV 정적 목록
// 출처: 국가교통정보센터(openapi.its.go.kr) — 국내 IP에서 수집
// 참고: 올림픽대로 본선 구간은 서울시 TOPIS 관할로 국가 ITS API 미제공.
//       아래 카메라는 올림픽대로 서쪽(경인선 신월 분기) 및 동쪽(수도권1순환선 하남) 접속부.
import { CCTVNode } from '@/types';

export const OLYMPIC_BLVD_CCTVS: CCTVNode[] = [
  // ── 서쪽 접속부 (강서 방향 · 신월 인터체인지) ────────────────────────────────
  {
    id: 'its-olympic-60',
    type: 'CCTV',
    name: '[경인선] 신월',
    coordinate: { lat: 37.52247501, lng: 126.8158529 },
    streamUrl: 'https://cctvsec.ktict.co.kr/60/imJ9UZ5rJeSDYVETdGtuTBKI57MWPWSh3eLEo42+D+QboB7st0uCX+qNHgkhaJ1LZpWYt2d/6r0zlJ9taLPgG/8iwX5qsR5zR6FGayDlBJQ=',
    source: 'ITS',
    roadName: '올림픽대로 서측(경인선 분기)',
  },
  {
    id: 'its-olympic-3898',
    type: 'CCTV',
    name: '[경인선] 신월-1',
    coordinate: { lat: 37.523105, lng: 126.819481 },
    streamUrl: 'https://cctvsec.ktict.co.kr/3898/tO3Pr+zZ35jrgMpZ2CxZjCkoET5UBNQjdlF9okHP1gGYlFFtIlgrbFq3wjuZSRExCSolhCVj4iNnW1fa6ELzG6kbdoilIi+CKcFFtUo0VlQ=',
    source: 'ITS',
    roadName: '올림픽대로 서측(경인선 분기)',
  },
  {
    id: 'its-olympic-8616',
    type: 'CCTV',
    name: '[경인선] 신월2',
    coordinate: { lat: 37.524419, lng: 126.82817 },
    streamUrl: 'https://cctvsec.ktict.co.kr/8616/aOKW1hb2+bZ41ubc8EwafHxIkU0bKneYRzi7pNq68LzZKom9K1NYax6y0e3Ed4rDnNHyvp7ukMqNGeteg+uWm3I6ElbuX6TrkTNoFDR3D/8=',
    source: 'ITS',
    roadName: '올림픽대로 서측(경인선 분기)',
  },
  // ── 동쪽 접속부 (하남 방향 · 수도권1순환선) ──────────────────────────────────
  {
    id: 'its-olympic-539',
    type: 'CCTV',
    name: '[수도권제1순환선] 거여고가교',
    coordinate: { lat: 37.49291779, lng: 127.1389115 },
    streamUrl: 'https://cctvsec.ktict.co.kr/539/DQunVkjkfhB8pKrn9Ra/UypH6p6nYZRea5VCBj/HeamDivejZQRsS5itG+H1ng0TMqEQlA/PrI+16DYb1EW2yEyyNw/uTwJrJARLCSp12To=',
    source: 'ITS',
    roadName: '올림픽대로 동측(수도권1순환선)',
  },
  {
    id: 'its-olympic-3956',
    type: 'CCTV',
    name: '[수도권제1순환선] 서하남',
    coordinate: { lat: 37.5064468383789, lng: 127.145568847656 },
    streamUrl: 'https://cctvsec.ktict.co.kr/3956/A1ORqaBUWBMU8+se5KXX5nh7lviTqkm55UC6qdLMIIIiwzrvbBhvhUSqSdIkw5h0dB3s1YwIVJu+Kaz4jFgf+qORRP9ccteR+4gjdam6e1U=',
    source: 'ITS',
    roadName: '올림픽대로 동측(수도권1순환선)',
  },
  {
    id: 'its-olympic-5',
    type: 'CCTV',
    name: '[수도권제1순환선] 서하남2',
    coordinate: { lat: 37.51167, lng: 127.14972 },
    streamUrl: 'https://cctvsec.ktict.co.kr/5/n2agfEIUPhxlBe6rAEVr9RmESjyJ0H5J7sQWdQtDYDGLk2bthtACHXkUUubmQMKzeV26wbfK3YdaRmSZcbM+0A==',
    source: 'ITS',
    roadName: '올림픽대로 동측(수도권1순환선)',
  },
];
