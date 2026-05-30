import { CCTVNode, SignalNode } from '@/types';

// ─── 서울 전역 + 경기도 주요 지점 샘플 노드 ─────────────────────────────────

export const MOCK_CCTV_NODES: CCTVNode[] = [
  // ── 서울 도심 ──────────────────────────────────────────────────────────────
  { id: 'cctv-001', type: 'CCTV', name: '광화문 사거리 CCTV',       coordinate: { lat: 37.5752, lng: 126.9769 }, streamUrl: 'https://example-its.go.kr/cctv/gwanghwamun.m3u8',   source: 'ITS', roadName: '세종대로' },
  { id: 'cctv-002', type: 'CCTV', name: '서울시청 앞 CCTV',         coordinate: { lat: 37.5665, lng: 126.9776 }, streamUrl: 'https://example-its.go.kr/cctv/cityhall.m3u8',      source: 'ITS', roadName: '세종대로' },
  { id: 'cctv-003', type: 'CCTV', name: '동대문역사공원 CCTV',      coordinate: { lat: 37.5658, lng: 127.0100 }, streamUrl: 'https://example-its.go.kr/cctv/ddp.m3u8',          source: 'ITS', roadName: '을지로' },
  { id: 'cctv-004', type: 'CCTV', name: '서울역 CCTV',              coordinate: { lat: 37.5549, lng: 126.9707 }, streamUrl: 'https://example-its.go.kr/cctv/seoulstation.m3u8', source: 'ITS', roadName: '한강대로' },
  { id: 'cctv-005', type: 'CCTV', name: '이태원 교차로 CCTV',       coordinate: { lat: 37.5347, lng: 126.9947 }, streamUrl: 'https://example-its.go.kr/cctv/itaewon.m3u8',      source: 'ITS', roadName: '이태원로' },

  // ── 강남 ───────────────────────────────────────────────────────────────────
  { id: 'cctv-010', type: 'CCTV', name: '강남역 CCTV',              coordinate: { lat: 37.4979, lng: 127.0277 }, streamUrl: 'https://example-its.go.kr/cctv/gangnam.m3u8',      source: 'ITS', roadName: '강남대로' },
  { id: 'cctv-011', type: 'CCTV', name: '삼성역 CCTV',              coordinate: { lat: 37.5088, lng: 127.0632 }, streamUrl: 'https://example-its.go.kr/cctv/samsung.m3u8',      source: 'ITS', roadName: '테헤란로' },
  { id: 'cctv-012', type: 'CCTV', name: '수서역 CCTV',              coordinate: { lat: 37.4891, lng: 127.1024 }, streamUrl: 'https://example-its.go.kr/cctv/suseo.m3u8',        source: 'ITS', roadName: '헌릉로' },
  { id: 'cctv-013', type: 'CCTV', name: '사당역 CCTV',              coordinate: { lat: 37.4764, lng: 126.9815 }, streamUrl: 'https://example-its.go.kr/cctv/sadang.m3u8',       source: 'ITS', roadName: '남부순환로' },

  // ── 서울 동부 ──────────────────────────────────────────────────────────────
  { id: 'cctv-020', type: 'CCTV', name: '천호역 사거리 CCTV',       coordinate: { lat: 37.5386, lng: 127.1237 }, streamUrl: 'https://example-its.go.kr/cctv/cheonho.m3u8',      source: 'ITS', roadName: '천호대로' },
  { id: 'cctv-021', type: 'CCTV', name: '잠실역 CCTV',              coordinate: { lat: 37.5133, lng: 127.1001 }, streamUrl: 'https://example-its.go.kr/cctv/jamsil.m3u8',       source: 'ITS', roadName: '올림픽로' },
  { id: 'cctv-022', type: 'CCTV', name: '건대입구역 CCTV',          coordinate: { lat: 37.5402, lng: 127.0705 }, streamUrl: 'https://example-its.go.kr/cctv/konkuk.m3u8',       source: 'ITS', roadName: '능동로' },
  { id: 'cctv-023', type: 'CCTV', name: '왕십리역 CCTV',            coordinate: { lat: 37.5613, lng: 127.0385 }, streamUrl: 'https://example-its.go.kr/cctv/wangsimni.m3u8',    source: 'ITS', roadName: '왕십리로' },
  { id: 'cctv-024', type: 'CCTV', name: '성수대교 북단 CCTV',       coordinate: { lat: 37.5445, lng: 127.0553 }, streamUrl: 'https://example-its.go.kr/cctv/seongsu.m3u8',      source: 'SEOUL', roadName: '강변북로' },

  // ── 서울 서부·마포 ─────────────────────────────────────────────────────────
  { id: 'cctv-030', type: 'CCTV', name: '홍대입구역 CCTV',          coordinate: { lat: 37.5571, lng: 126.9245 }, streamUrl: 'https://example-its.go.kr/cctv/hongdae.m3u8',      source: 'ITS', roadName: '양화로' },
  { id: 'cctv-031', type: 'CCTV', name: '신촌 교차로 CCTV',         coordinate: { lat: 37.5551, lng: 126.9369 }, streamUrl: 'https://example-its.go.kr/cctv/sinchon.m3u8',      source: 'ITS', roadName: '신촌로' },
  { id: 'cctv-032', type: 'CCTV', name: '여의도 국회의사당 CCTV',   coordinate: { lat: 37.5326, lng: 126.9145 }, streamUrl: 'https://example-its.go.kr/cctv/yeouido.m3u8',      source: 'ITS', roadName: '의사당대로' },
  { id: 'cctv-033', type: 'CCTV', name: '당산역 교차로 CCTV',       coordinate: { lat: 37.5342, lng: 126.9009 }, streamUrl: 'https://example-its.go.kr/cctv/dangsan.m3u8',      source: 'ITS', roadName: '양화로' },
  { id: 'cctv-034', type: 'CCTV', name: '오목교역 CCTV',            coordinate: { lat: 37.5238, lng: 126.8726 }, streamUrl: 'https://example-its.go.kr/cctv/omokgyo.m3u8',      source: 'ITS', roadName: '목동로' },
  { id: 'cctv-035', type: 'CCTV', name: '신도림역 CCTV',            coordinate: { lat: 37.5085, lng: 126.8913 }, streamUrl: 'https://example-its.go.kr/cctv/sindorim.m3u8',     source: 'ITS', roadName: '도림로' },
  { id: 'cctv-036', type: 'CCTV', name: '구로디지털단지 CCTV',      coordinate: { lat: 37.4850, lng: 126.9015 }, streamUrl: 'https://example-its.go.kr/cctv/gurodigital.m3u8', source: 'ITS', roadName: '디지털로' },

  // ── 서울 북부 ──────────────────────────────────────────────────────────────
  { id: 'cctv-040', type: 'CCTV', name: '노원역 CCTV',              coordinate: { lat: 37.6554, lng: 127.0637 }, streamUrl: 'https://example-its.go.kr/cctv/nowon.m3u8',        source: 'ITS', roadName: '동일로' },
  { id: 'cctv-041', type: 'CCTV', name: '수유역 CCTV',              coordinate: { lat: 37.6390, lng: 127.0254 }, streamUrl: 'https://example-its.go.kr/cctv/suyu.m3u8',         source: 'ITS', roadName: '한천로' },
  { id: 'cctv-042', type: 'CCTV', name: '도봉산역 CCTV',            coordinate: { lat: 37.6900, lng: 127.0474 }, streamUrl: 'https://example-its.go.kr/cctv/dobongsan.m3u8',    source: 'ITS', roadName: '도봉로' },

  // ── 경기도 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-100', type: 'CCTV', name: '수원역 CCTV',              coordinate: { lat: 37.2658, lng: 127.0001 }, streamUrl: 'https://example-its.go.kr/cctv/suwon.m3u8',        source: 'ITS', roadName: '덕영대로' },
  { id: 'cctv-101', type: 'CCTV', name: '수원시청 CCTV',            coordinate: { lat: 37.2636, lng: 127.0286 }, streamUrl: 'https://example-its.go.kr/cctv/suwoncity.m3u8',    source: 'ITS', roadName: '효원로' },
  { id: 'cctv-102', type: 'CCTV', name: '판교역 CCTV',              coordinate: { lat: 37.3948, lng: 127.1112 }, streamUrl: 'https://example-its.go.kr/cctv/pangyo.m3u8',       source: 'ITS', roadName: '판교역로' },
  { id: 'cctv-103', type: 'CCTV', name: '성남시청 CCTV',            coordinate: { lat: 37.4449, lng: 127.1388 }, streamUrl: 'https://example-its.go.kr/cctv/seongnam.m3u8',     source: 'ITS', roadName: '성남대로' },
  { id: 'cctv-104', type: 'CCTV', name: '부천역 CCTV',              coordinate: { lat: 37.4975, lng: 126.7824 }, streamUrl: 'https://example-its.go.kr/cctv/bucheon.m3u8',      source: 'ITS', roadName: '경인로' },
  { id: 'cctv-105', type: 'CCTV', name: '일산 백석역 CCTV',         coordinate: { lat: 37.6565, lng: 126.7779 }, streamUrl: 'https://example-its.go.kr/cctv/ilsan.m3u8',        source: 'ITS', roadName: '중앙로' },
  { id: 'cctv-106', type: 'CCTV', name: '안양시청 CCTV',            coordinate: { lat: 37.3943, lng: 126.9568 }, streamUrl: 'https://example-its.go.kr/cctv/anyang.m3u8',       source: 'ITS', roadName: '시민대로' },
  { id: 'cctv-107', type: 'CCTV', name: '구리역 CCTV',              coordinate: { lat: 37.5960, lng: 127.1297 }, streamUrl: 'https://example-its.go.kr/cctv/guri.m3u8',         source: 'ITS', roadName: '경춘로' },
  { id: 'cctv-108', type: 'CCTV', name: '의정부역 CCTV',            coordinate: { lat: 37.7381, lng: 127.0338 }, streamUrl: 'https://example-its.go.kr/cctv/uijeongbu.m3u8',    source: 'ITS', roadName: '평화로' },
  { id: 'cctv-109', type: 'CCTV', name: '안산 중앙역 CCTV',         coordinate: { lat: 37.3219, lng: 126.8309 }, streamUrl: 'https://example-its.go.kr/cctv/ansan.m3u8',        source: 'ITS', roadName: '중앙대로' },
  { id: 'cctv-110', type: 'CCTV', name: '용인 기흥역 CCTV',         coordinate: { lat: 37.2757, lng: 127.1157 }, streamUrl: 'https://example-its.go.kr/cctv/giheung.m3u8',      source: 'ITS', roadName: '용구대로' },
  { id: 'cctv-111', type: 'CCTV', name: '고양 화정역 CCTV',         coordinate: { lat: 37.6338, lng: 126.8318 }, streamUrl: 'https://example-its.go.kr/cctv/hwajung.m3u8',      source: 'ITS', roadName: '호국로' },
  { id: 'cctv-112', type: 'CCTV', name: '남양주 마석 CCTV',         coordinate: { lat: 37.6361, lng: 127.2167 }, streamUrl: 'https://example-its.go.kr/cctv/namyangju.m3u8',    source: 'ITS', roadName: '경춘로' },
];

export const MOCK_SIGNAL_NODES: SignalNode[] = [
  // ── 서울 도심 ──────────────────────────────────────────────────────────────
  { id: 'sig-001', type: 'SIGNAL', name: '광화문 사거리',       intersectionId: 'INT-GWH-001', coordinate: { lat: 37.5752, lng: 126.9769 }, currentPhase: 'GREEN',  remainingSeconds: 32, cycleSeconds: 120, lastUpdated: Date.now() },
  { id: 'sig-002', type: 'SIGNAL', name: '서울시청 앞',         intersectionId: 'INT-CTH-001', coordinate: { lat: 37.5665, lng: 126.9776 }, currentPhase: 'RED',    remainingSeconds: 44, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-003', type: 'SIGNAL', name: '동대문역사공원',      intersectionId: 'INT-DDP-001', coordinate: { lat: 37.5658, lng: 127.0100 }, currentPhase: 'GREEN',  remainingSeconds: 18, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-004', type: 'SIGNAL', name: '서울역 교차로',       intersectionId: 'INT-SLS-001', coordinate: { lat: 37.5549, lng: 126.9707 }, currentPhase: 'YELLOW', remainingSeconds: 4,  cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 강남 ───────────────────────────────────────────────────────────────────
  { id: 'sig-010', type: 'SIGNAL', name: '강남역 사거리',       intersectionId: 'INT-GNM-001', coordinate: { lat: 37.4979, lng: 127.0277 }, currentPhase: 'GREEN',  remainingSeconds: 25, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-011', type: 'SIGNAL', name: '삼성역 교차로',       intersectionId: 'INT-SMS-001', coordinate: { lat: 37.5088, lng: 127.0632 }, currentPhase: 'RED',    remainingSeconds: 36, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-012', type: 'SIGNAL', name: '사당역 사거리',       intersectionId: 'INT-SDG-001', coordinate: { lat: 37.4764, lng: 126.9815 }, currentPhase: 'GREEN',  remainingSeconds: 14, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 서울 동부 ──────────────────────────────────────────────────────────────
  { id: 'sig-020', type: 'SIGNAL', name: '천호역 사거리',       intersectionId: 'INT-CHH-001', coordinate: { lat: 37.5386, lng: 127.1237 }, currentPhase: 'GREEN',  remainingSeconds: 28, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-021', type: 'SIGNAL', name: '잠실역 교차로',       intersectionId: 'INT-JMS-001', coordinate: { lat: 37.5133, lng: 127.1001 }, currentPhase: 'RED',    remainingSeconds: 42, cycleSeconds: 120, lastUpdated: Date.now() },
  { id: 'sig-022', type: 'SIGNAL', name: '건대입구역 교차로',   intersectionId: 'INT-KKU-001', coordinate: { lat: 37.5402, lng: 127.0705 }, currentPhase: 'GREEN',  remainingSeconds: 20, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-023', type: 'SIGNAL', name: '왕십리 교차로',       intersectionId: 'INT-WSR-001', coordinate: { lat: 37.5613, lng: 127.0385 }, currentPhase: 'YELLOW', remainingSeconds: 3,  cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 서울 서부 ──────────────────────────────────────────────────────────────
  { id: 'sig-030', type: 'SIGNAL', name: '홍대입구 교차로',     intersectionId: 'INT-HDG-001', coordinate: { lat: 37.5571, lng: 126.9245 }, currentPhase: 'RED',    remainingSeconds: 30, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-031', type: 'SIGNAL', name: '당산역 사거리',       intersectionId: 'INT-DGS-001', coordinate: { lat: 37.5342, lng: 126.9009 }, currentPhase: 'RED',    remainingSeconds: 18, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-032', type: 'SIGNAL', name: '오목교역 교차로',     intersectionId: 'INT-OMK-001', coordinate: { lat: 37.5238, lng: 126.8726 }, currentPhase: 'GREEN',  remainingSeconds: 33, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-033', type: 'SIGNAL', name: '신도림역 교차로',     intersectionId: 'INT-SDL-001', coordinate: { lat: 37.5085, lng: 126.8913 }, currentPhase: 'GREEN',  remainingSeconds: 22, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 서울 북부 ──────────────────────────────────────────────────────────────
  { id: 'sig-040', type: 'SIGNAL', name: '노원역 사거리',       intersectionId: 'INT-NWN-001', coordinate: { lat: 37.6554, lng: 127.0637 }, currentPhase: 'GREEN',  remainingSeconds: 16, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-041', type: 'SIGNAL', name: '수유역 교차로',       intersectionId: 'INT-SYY-001', coordinate: { lat: 37.6390, lng: 127.0254 }, currentPhase: 'RED',    remainingSeconds: 28, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 경기도 ─────────────────────────────────────────────────────────────────
  { id: 'sig-100', type: 'SIGNAL', name: '수원역 교차로',       intersectionId: 'INT-SWN-001', coordinate: { lat: 37.2658, lng: 127.0001 }, currentPhase: 'GREEN',  remainingSeconds: 24, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-101', type: 'SIGNAL', name: '판교역 교차로',       intersectionId: 'INT-PGY-001', coordinate: { lat: 37.3948, lng: 127.1112 }, currentPhase: 'RED',    remainingSeconds: 38, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-102', type: 'SIGNAL', name: '부천역 교차로',       intersectionId: 'INT-BCN-001', coordinate: { lat: 37.4975, lng: 126.7824 }, currentPhase: 'GREEN',  remainingSeconds: 20, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-103', type: 'SIGNAL', name: '일산 백석역 교차로',  intersectionId: 'INT-ILS-001', coordinate: { lat: 37.6565, lng: 126.7779 }, currentPhase: 'RED',    remainingSeconds: 45, cycleSeconds: 120, lastUpdated: Date.now() },
  { id: 'sig-104', type: 'SIGNAL', name: '안양역 교차로',       intersectionId: 'INT-AYG-001', coordinate: { lat: 37.3943, lng: 126.9568 }, currentPhase: 'GREEN',  remainingSeconds: 12, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-105', type: 'SIGNAL', name: '의정부역 교차로',     intersectionId: 'INT-UJB-001', coordinate: { lat: 37.7381, lng: 127.0338 }, currentPhase: 'YELLOW', remainingSeconds: 5,  cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-106', type: 'SIGNAL', name: '구리역 교차로',       intersectionId: 'INT-GRI-001', coordinate: { lat: 37.5960, lng: 127.1297 }, currentPhase: 'RED',    remainingSeconds: 32, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-107', type: 'SIGNAL', name: '용인 기흥역 교차로',  intersectionId: 'INT-GHG-001', coordinate: { lat: 37.2757, lng: 127.1157 }, currentPhase: 'GREEN',  remainingSeconds: 18, cycleSeconds: 90,  lastUpdated: Date.now() },
];

export const ALL_MOCK_NODES = [...MOCK_CCTV_NODES, ...MOCK_SIGNAL_NODES];
