import { CCTVNode, SignalNode } from '@/types';

// ─── 서울 25개 구 전역 + 경기도 주요 지점 노드 ──────────────────────────────

export const MOCK_CCTV_NODES: CCTVNode[] = [
  // ── 종로구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-001', type: 'CCTV', name: '광화문 사거리 CCTV',      coordinate: { lat: 37.5752, lng: 126.9769 }, streamUrl: 'https://example-its.go.kr/cctv/gwanghwamun.m3u8', source: 'ITS',   roadName: '세종대로' },
  { id: 'cctv-002', type: 'CCTV', name: '종로3가 CCTV',            coordinate: { lat: 37.5711, lng: 126.9920 }, streamUrl: 'https://example-its.go.kr/cctv/jongno3.m3u8',     source: 'ITS',   roadName: '종로' },
  { id: 'cctv-003', type: 'CCTV', name: '혜화역 CCTV',             coordinate: { lat: 37.5826, lng: 127.0017 }, streamUrl: 'https://example-its.go.kr/cctv/hyehwa.m3u8',      source: 'ITS',   roadName: '창경궁로' },

  // ── 중구 ───────────────────────────────────────────────────────────────────
  { id: 'cctv-010', type: 'CCTV', name: '서울시청 앞 CCTV',        coordinate: { lat: 37.5665, lng: 126.9776 }, streamUrl: 'https://example-its.go.kr/cctv/cityhall.m3u8',    source: 'ITS',   roadName: '세종대로' },
  { id: 'cctv-011', type: 'CCTV', name: '명동역 CCTV',             coordinate: { lat: 37.5607, lng: 126.9853 }, streamUrl: 'https://example-its.go.kr/cctv/myeongdong.m3u8', source: 'ITS',   roadName: '퇴계로' },
  { id: 'cctv-012', type: 'CCTV', name: '동대문역사공원 CCTV',     coordinate: { lat: 37.5658, lng: 127.0100 }, streamUrl: 'https://example-its.go.kr/cctv/ddp.m3u8',         source: 'ITS',   roadName: '을지로' },

  // ── 용산구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-020', type: 'CCTV', name: '서울역 CCTV',             coordinate: { lat: 37.5549, lng: 126.9707 }, streamUrl: 'https://example-its.go.kr/cctv/seoulstation.m3u8',source: 'ITS',   roadName: '한강대로' },
  { id: 'cctv-021', type: 'CCTV', name: '삼각지역 CCTV',           coordinate: { lat: 37.5389, lng: 126.9741 }, streamUrl: 'https://example-its.go.kr/cctv/samgakji.m3u8',   source: 'ITS',   roadName: '한강대로' },
  { id: 'cctv-022', type: 'CCTV', name: '이태원 교차로 CCTV',      coordinate: { lat: 37.5347, lng: 126.9947 }, streamUrl: 'https://example-its.go.kr/cctv/itaewon.m3u8',    source: 'ITS',   roadName: '이태원로' },

  // ── 성동구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-030', type: 'CCTV', name: '왕십리역 CCTV',           coordinate: { lat: 37.5613, lng: 127.0385 }, streamUrl: 'https://example-its.go.kr/cctv/wangsimni.m3u8',  source: 'ITS',   roadName: '왕십리로' },
  { id: 'cctv-031', type: 'CCTV', name: '성수대교 북단 CCTV',      coordinate: { lat: 37.5445, lng: 127.0553 }, streamUrl: 'https://example-its.go.kr/cctv/seongsu.m3u8',    source: 'SEOUL', roadName: '강변북로' },

  // ── 광진구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-040', type: 'CCTV', name: '건대입구역 CCTV',         coordinate: { lat: 37.5402, lng: 127.0705 }, streamUrl: 'https://example-its.go.kr/cctv/konkuk.m3u8',     source: 'ITS',   roadName: '능동로' },
  { id: 'cctv-041', type: 'CCTV', name: '구의역 CCTV',             coordinate: { lat: 37.5414, lng: 127.0934 }, streamUrl: 'https://example-its.go.kr/cctv/guui.m3u8',       source: 'ITS',   roadName: '자양로' },

  // ── 동대문구 ───────────────────────────────────────────────────────────────
  { id: 'cctv-050', type: 'CCTV', name: '청량리역 CCTV',           coordinate: { lat: 37.5797, lng: 127.0472 }, streamUrl: 'https://example-its.go.kr/cctv/cheongnyangni.m3u8',source: 'ITS', roadName: '왕산로' },
  { id: 'cctv-051', type: 'CCTV', name: '답십리역 CCTV',           coordinate: { lat: 37.5651, lng: 127.0562 }, streamUrl: 'https://example-its.go.kr/cctv/dapsimni.m3u8',   source: 'ITS',   roadName: '천호대로' },

  // ── 중랑구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-060', type: 'CCTV', name: '상봉역 CCTV',             coordinate: { lat: 37.5952, lng: 127.0882 }, streamUrl: 'https://example-its.go.kr/cctv/sangbong.m3u8',   source: 'ITS',   roadName: '망우로' },
  { id: 'cctv-061', type: 'CCTV', name: '면목사거리 CCTV',         coordinate: { lat: 37.5637, lng: 127.0814 }, streamUrl: 'https://example-its.go.kr/cctv/myeonmok.m3u8',   source: 'ITS',   roadName: '면목로' },

  // ── 성북구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-070', type: 'CCTV', name: '길음역 CCTV',             coordinate: { lat: 37.6030, lng: 127.0267 }, streamUrl: 'https://example-its.go.kr/cctv/gireum.m3u8',     source: 'ITS',   roadName: '도봉로' },
  { id: 'cctv-071', type: 'CCTV', name: '미아사거리 CCTV',         coordinate: { lat: 37.6167, lng: 127.0266 }, streamUrl: 'https://example-its.go.kr/cctv/mia.m3u8',        source: 'ITS',   roadName: '도봉로' },

  // ── 강북구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-080', type: 'CCTV', name: '수유역 CCTV',             coordinate: { lat: 37.6390, lng: 127.0254 }, streamUrl: 'https://example-its.go.kr/cctv/suyu.m3u8',       source: 'ITS',   roadName: '한천로' },
  { id: 'cctv-081', type: 'CCTV', name: '번동사거리 CCTV',         coordinate: { lat: 37.6480, lng: 127.0258 }, streamUrl: 'https://example-its.go.kr/cctv/beondong.m3u8',   source: 'ITS',   roadName: '노해로' },

  // ── 도봉구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-090', type: 'CCTV', name: '창동역 CCTV',             coordinate: { lat: 37.6528, lng: 127.0472 }, streamUrl: 'https://example-its.go.kr/cctv/changdong.m3u8',  source: 'ITS',   roadName: '마들로' },
  { id: 'cctv-091', type: 'CCTV', name: '도봉산역 CCTV',           coordinate: { lat: 37.6900, lng: 127.0474 }, streamUrl: 'https://example-its.go.kr/cctv/dobongsan.m3u8',  source: 'ITS',   roadName: '도봉로' },

  // ── 노원구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-100', type: 'CCTV', name: '노원역 CCTV',             coordinate: { lat: 37.6554, lng: 127.0637 }, streamUrl: 'https://example-its.go.kr/cctv/nowon.m3u8',      source: 'ITS',   roadName: '동일로' },
  { id: 'cctv-101', type: 'CCTV', name: '중계역 CCTV',             coordinate: { lat: 37.6366, lng: 127.0679 }, streamUrl: 'https://example-its.go.kr/cctv/junggye.m3u8',    source: 'ITS',   roadName: '중계로' },

  // ── 은평구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-110', type: 'CCTV', name: '연신내역 CCTV',           coordinate: { lat: 37.6188, lng: 126.9205 }, streamUrl: 'https://example-its.go.kr/cctv/yeonsinnae.m3u8', source: 'ITS',   roadName: '통일로' },
  { id: 'cctv-111', type: 'CCTV', name: '불광역 CCTV',             coordinate: { lat: 37.6104, lng: 126.9290 }, streamUrl: 'https://example-its.go.kr/cctv/bulgwang.m3u8',   source: 'ITS',   roadName: '통일로' },

  // ── 서대문구 ───────────────────────────────────────────────────────────────
  { id: 'cctv-120', type: 'CCTV', name: '신촌 교차로 CCTV',        coordinate: { lat: 37.5551, lng: 126.9369 }, streamUrl: 'https://example-its.go.kr/cctv/sinchon.m3u8',    source: 'ITS',   roadName: '신촌로' },
  { id: 'cctv-121', type: 'CCTV', name: '홍제역 CCTV',             coordinate: { lat: 37.5923, lng: 126.9387 }, streamUrl: 'https://example-its.go.kr/cctv/hongjae.m3u8',    source: 'ITS',   roadName: '통일로' },

  // ── 마포구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-130', type: 'CCTV', name: '홍대입구역 CCTV',         coordinate: { lat: 37.5571, lng: 126.9245 }, streamUrl: 'https://example-its.go.kr/cctv/hongdae.m3u8',    source: 'ITS',   roadName: '양화로' },
  { id: 'cctv-131', type: 'CCTV', name: '합정역 CCTV',             coordinate: { lat: 37.5496, lng: 126.9143 }, streamUrl: 'https://example-its.go.kr/cctv/hapjeong.m3u8',   source: 'ITS',   roadName: '양화로' },
  { id: 'cctv-132', type: 'CCTV', name: '마포역 CCTV',             coordinate: { lat: 37.5377, lng: 126.9509 }, streamUrl: 'https://example-its.go.kr/cctv/mapo.m3u8',       source: 'ITS',   roadName: '마포대로' },

  // ── 양천구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-140', type: 'CCTV', name: '오목교역 CCTV',           coordinate: { lat: 37.5238, lng: 126.8726 }, streamUrl: 'https://example-its.go.kr/cctv/omokgyo.m3u8',    source: 'ITS',   roadName: '목동로' },
  { id: 'cctv-141', type: 'CCTV', name: '신정네거리역 CCTV',       coordinate: { lat: 37.5271, lng: 126.8590 }, streamUrl: 'https://example-its.go.kr/cctv/sinjeong.m3u8',   source: 'ITS',   roadName: '신월로' },

  // ── 강서구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-150', type: 'CCTV', name: '마곡나루역 CCTV',         coordinate: { lat: 37.5704, lng: 126.8261 }, streamUrl: 'https://example-its.go.kr/cctv/magok.m3u8',      source: 'ITS',   roadName: '공항대로' },
  { id: 'cctv-151', type: 'CCTV', name: '화곡역 CCTV',             coordinate: { lat: 37.5476, lng: 126.8520 }, streamUrl: 'https://example-its.go.kr/cctv/hwagok.m3u8',     source: 'ITS',   roadName: '강서로' },
  { id: 'cctv-152', type: 'CCTV', name: '김포공항역 CCTV',         coordinate: { lat: 37.5616, lng: 126.8011 }, streamUrl: 'https://example-its.go.kr/cctv/gimpoairport.m3u8',source: 'ITS',  roadName: '공항대로' },

  // ── 구로구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-160', type: 'CCTV', name: '구로역 CCTV',             coordinate: { lat: 37.5010, lng: 126.8871 }, streamUrl: 'https://example-its.go.kr/cctv/guro.m3u8',       source: 'ITS',   roadName: '경인로' },
  { id: 'cctv-161', type: 'CCTV', name: '신도림역 CCTV',           coordinate: { lat: 37.5085, lng: 126.8913 }, streamUrl: 'https://example-its.go.kr/cctv/sindorim.m3u8',   source: 'ITS',   roadName: '도림로' },
  { id: 'cctv-162', type: 'CCTV', name: '구로디지털단지 CCTV',     coordinate: { lat: 37.4850, lng: 126.9015 }, streamUrl: 'https://example-its.go.kr/cctv/gurodigital.m3u8',source: 'ITS',   roadName: '디지털로' },

  // ── 금천구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-170', type: 'CCTV', name: '가산디지털단지역 CCTV',   coordinate: { lat: 37.4814, lng: 126.8820 }, streamUrl: 'https://example-its.go.kr/cctv/gasan.m3u8',      source: 'ITS',   roadName: '디지털로' },
  { id: 'cctv-171', type: 'CCTV', name: '독산역 CCTV',             coordinate: { lat: 37.4726, lng: 126.8957 }, streamUrl: 'https://example-its.go.kr/cctv/doksan.m3u8',     source: 'ITS',   roadName: '시흥대로' },

  // ── 영등포구 ───────────────────────────────────────────────────────────────
  { id: 'cctv-180', type: 'CCTV', name: '영등포역 CCTV',           coordinate: { lat: 37.5159, lng: 126.9068 }, streamUrl: 'https://example-its.go.kr/cctv/yeongdeungpo.m3u8',source: 'ITS',  roadName: '경인로' },
  { id: 'cctv-181', type: 'CCTV', name: '여의도 국회의사당 CCTV',  coordinate: { lat: 37.5326, lng: 126.9145 }, streamUrl: 'https://example-its.go.kr/cctv/yeouido.m3u8',    source: 'ITS',   roadName: '의사당대로' },
  { id: 'cctv-182', type: 'CCTV', name: '당산역 교차로 CCTV',      coordinate: { lat: 37.5342, lng: 126.9009 }, streamUrl: 'https://example-its.go.kr/cctv/dangsan.m3u8',    source: 'ITS',   roadName: '양화로' },

  // ── 동작구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-190', type: 'CCTV', name: '노량진역 CCTV',           coordinate: { lat: 37.5136, lng: 126.9422 }, streamUrl: 'https://example-its.go.kr/cctv/noryangjin.m3u8', source: 'ITS',   roadName: '노량진로' },
  { id: 'cctv-191', type: 'CCTV', name: '사당역 CCTV',             coordinate: { lat: 37.4764, lng: 126.9815 }, streamUrl: 'https://example-its.go.kr/cctv/sadang.m3u8',     source: 'ITS',   roadName: '남부순환로' },

  // ── 관악구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-200', type: 'CCTV', name: '신림역 CCTV',             coordinate: { lat: 37.4844, lng: 126.9292 }, streamUrl: 'https://example-its.go.kr/cctv/sillim.m3u8',     source: 'ITS',   roadName: '신림로' },
  { id: 'cctv-201', type: 'CCTV', name: '봉천사거리 CCTV',         coordinate: { lat: 37.4833, lng: 126.9523 }, streamUrl: 'https://example-its.go.kr/cctv/bongcheon.m3u8',  source: 'ITS',   roadName: '봉천로' },

  // ── 서초구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-210', type: 'CCTV', name: '서초역 CCTV',             coordinate: { lat: 37.4915, lng: 127.0115 }, streamUrl: 'https://example-its.go.kr/cctv/seocho.m3u8',     source: 'ITS',   roadName: '서초대로' },
  { id: 'cctv-211', type: 'CCTV', name: '양재역 CCTV',             coordinate: { lat: 37.4842, lng: 127.0342 }, streamUrl: 'https://example-its.go.kr/cctv/yangjae.m3u8',    source: 'ITS',   roadName: '강남대로' },
  { id: 'cctv-212', type: 'CCTV', name: '반포사거리 CCTV',         coordinate: { lat: 37.5054, lng: 126.9998 }, streamUrl: 'https://example-its.go.kr/cctv/banpo.m3u8',      source: 'ITS',   roadName: '반포대로' },

  // ── 강남구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-220', type: 'CCTV', name: '강남역 CCTV',             coordinate: { lat: 37.4979, lng: 127.0277 }, streamUrl: 'https://example-its.go.kr/cctv/gangnam.m3u8',    source: 'ITS',   roadName: '강남대로' },
  { id: 'cctv-221', type: 'CCTV', name: '역삼역 CCTV',             coordinate: { lat: 37.5005, lng: 127.0367 }, streamUrl: 'https://example-its.go.kr/cctv/yeoksam.m3u8',    source: 'ITS',   roadName: '테헤란로' },
  { id: 'cctv-222', type: 'CCTV', name: '삼성역 CCTV',             coordinate: { lat: 37.5088, lng: 127.0632 }, streamUrl: 'https://example-its.go.kr/cctv/samsung.m3u8',    source: 'ITS',   roadName: '테헤란로' },
  { id: 'cctv-223', type: 'CCTV', name: '압구정역 CCTV',           coordinate: { lat: 37.5273, lng: 127.0298 }, streamUrl: 'https://example-its.go.kr/cctv/apgujeong.m3u8',  source: 'ITS',   roadName: '강남대로' },

  // ── 송파구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-230', type: 'CCTV', name: '잠실역 CCTV',             coordinate: { lat: 37.5133, lng: 127.1001 }, streamUrl: 'https://example-its.go.kr/cctv/jamsil.m3u8',     source: 'ITS',   roadName: '올림픽로' },
  { id: 'cctv-231', type: 'CCTV', name: '석촌역 CCTV',             coordinate: { lat: 37.5037, lng: 127.1008 }, streamUrl: 'https://example-its.go.kr/cctv/seokchon.m3u8',   source: 'ITS',   roadName: '송파대로' },
  { id: 'cctv-232', type: 'CCTV', name: '가락시장역 CCTV',         coordinate: { lat: 37.4923, lng: 127.1174 }, streamUrl: 'https://example-its.go.kr/cctv/garak.m3u8',      source: 'ITS',   roadName: '위례성대로' },

  // ── 강동구 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-240', type: 'CCTV', name: '천호역 사거리 CCTV',      coordinate: { lat: 37.5386, lng: 127.1237 }, streamUrl: 'https://example-its.go.kr/cctv/cheonho.m3u8',    source: 'ITS',   roadName: '천호대로' },
  { id: 'cctv-241', type: 'CCTV', name: '강동역 CCTV',             coordinate: { lat: 37.5295, lng: 127.1362 }, streamUrl: 'https://example-its.go.kr/cctv/gangdong.m3u8',   source: 'ITS',   roadName: '천호대로' },
  { id: 'cctv-242', type: 'CCTV', name: '길동사거리 CCTV',         coordinate: { lat: 37.5328, lng: 127.1534 }, streamUrl: 'https://example-its.go.kr/cctv/gildong.m3u8',    source: 'ITS',   roadName: '고덕로' },

  // ── 경기도 ─────────────────────────────────────────────────────────────────
  { id: 'cctv-300', type: 'CCTV', name: '수원역 CCTV',             coordinate: { lat: 37.2658, lng: 127.0001 }, streamUrl: 'https://example-its.go.kr/cctv/suwon.m3u8',      source: 'ITS',   roadName: '덕영대로' },
  { id: 'cctv-301', type: 'CCTV', name: '수원시청 CCTV',           coordinate: { lat: 37.2636, lng: 127.0286 }, streamUrl: 'https://example-its.go.kr/cctv/suwoncity.m3u8',  source: 'ITS',   roadName: '효원로' },
  { id: 'cctv-302', type: 'CCTV', name: '판교역 CCTV',             coordinate: { lat: 37.3948, lng: 127.1112 }, streamUrl: 'https://example-its.go.kr/cctv/pangyo.m3u8',     source: 'ITS',   roadName: '판교역로' },
  { id: 'cctv-303', type: 'CCTV', name: '성남시청 CCTV',           coordinate: { lat: 37.4449, lng: 127.1388 }, streamUrl: 'https://example-its.go.kr/cctv/seongnam.m3u8',   source: 'ITS',   roadName: '성남대로' },
  { id: 'cctv-304', type: 'CCTV', name: '부천역 CCTV',             coordinate: { lat: 37.4975, lng: 126.7824 }, streamUrl: 'https://example-its.go.kr/cctv/bucheon.m3u8',    source: 'ITS',   roadName: '경인로' },
  { id: 'cctv-305', type: 'CCTV', name: '일산 백석역 CCTV',        coordinate: { lat: 37.6565, lng: 126.7779 }, streamUrl: 'https://example-its.go.kr/cctv/ilsan.m3u8',      source: 'ITS',   roadName: '중앙로' },
  { id: 'cctv-306', type: 'CCTV', name: '안양시청 CCTV',           coordinate: { lat: 37.3943, lng: 126.9568 }, streamUrl: 'https://example-its.go.kr/cctv/anyang.m3u8',     source: 'ITS',   roadName: '시민대로' },
  { id: 'cctv-307', type: 'CCTV', name: '구리역 CCTV',             coordinate: { lat: 37.5960, lng: 127.1297 }, streamUrl: 'https://example-its.go.kr/cctv/guri.m3u8',       source: 'ITS',   roadName: '경춘로' },
  { id: 'cctv-308', type: 'CCTV', name: '의정부역 CCTV',           coordinate: { lat: 37.7381, lng: 127.0338 }, streamUrl: 'https://example-its.go.kr/cctv/uijeongbu.m3u8',  source: 'ITS',   roadName: '평화로' },
  { id: 'cctv-309', type: 'CCTV', name: '안산 중앙역 CCTV',        coordinate: { lat: 37.3219, lng: 126.8309 }, streamUrl: 'https://example-its.go.kr/cctv/ansan.m3u8',      source: 'ITS',   roadName: '중앙대로' },
  { id: 'cctv-310', type: 'CCTV', name: '용인 기흥역 CCTV',        coordinate: { lat: 37.2757, lng: 127.1157 }, streamUrl: 'https://example-its.go.kr/cctv/giheung.m3u8',    source: 'ITS',   roadName: '용구대로' },
  { id: 'cctv-311', type: 'CCTV', name: '고양 화정역 CCTV',        coordinate: { lat: 37.6338, lng: 126.8318 }, streamUrl: 'https://example-its.go.kr/cctv/hwajung.m3u8',    source: 'ITS',   roadName: '호국로' },

  // ── 남양주시 ───────────────────────────────────────────────────────────────
  { id: 'cctv-320', type: 'CCTV', name: '남양주 도농역 CCTV',      coordinate: { lat: 37.5952, lng: 127.1698 }, streamUrl: 'https://example-its.go.kr/cctv/donong.m3u8',     source: 'ITS',   roadName: '경춘로' },
  { id: 'cctv-321', type: 'CCTV', name: '남양주시청(다산) CCTV',   coordinate: { lat: 37.6369, lng: 127.2166 }, streamUrl: 'https://example-its.go.kr/cctv/dasan.m3u8',      source: 'ITS',   roadName: '다산중앙로' },
  { id: 'cctv-322', type: 'CCTV', name: '남양주 평내호평역 CCTV',  coordinate: { lat: 37.6487, lng: 127.2146 }, streamUrl: 'https://example-its.go.kr/cctv/pyeongnae.m3u8',  source: 'ITS',   roadName: '호평로' },
  { id: 'cctv-323', type: 'CCTV', name: '남양주 진접읍 CCTV',      coordinate: { lat: 37.7012, lng: 127.2056 }, streamUrl: 'https://example-its.go.kr/cctv/jincheop.m3u8',   source: 'ITS',   roadName: '진접로' },
  { id: 'cctv-324', type: 'CCTV', name: '남양주 화도읍 CCTV',      coordinate: { lat: 37.6637, lng: 127.3064 }, streamUrl: 'https://example-its.go.kr/cctv/hwado.m3u8',      source: 'ITS',   roadName: '화도로' },
  { id: 'cctv-325', type: 'CCTV', name: '남양주 덕소 CCTV',        coordinate: { lat: 37.5821, lng: 127.2108 }, streamUrl: 'https://example-its.go.kr/cctv/deokso.m3u8',     source: 'ITS',   roadName: '팔당로' },
  { id: 'cctv-326', type: 'CCTV', name: '남양주 마석 CCTV',        coordinate: { lat: 37.6361, lng: 127.2167 }, streamUrl: 'https://example-its.go.kr/cctv/maseok.m3u8',     source: 'ITS',   roadName: '경춘로' },
];

export const MOCK_SIGNAL_NODES: SignalNode[] = [
  // ── 종로구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-001', type: 'SIGNAL', name: '광화문 사거리',      intersectionId: 'INT-GWH-001', coordinate: { lat: 37.5752, lng: 126.9769 }, currentPhase: 'GREEN',  remainingSeconds: 32, cycleSeconds: 120, lastUpdated: Date.now() },
  { id: 'sig-002', type: 'SIGNAL', name: '종로3가 교차로',     intersectionId: 'INT-JN3-001', coordinate: { lat: 37.5711, lng: 126.9920 }, currentPhase: 'RED',    remainingSeconds: 28, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 중구 ───────────────────────────────────────────────────────────────────
  { id: 'sig-010', type: 'SIGNAL', name: '서울시청 앞',        intersectionId: 'INT-CTH-001', coordinate: { lat: 37.5665, lng: 126.9776 }, currentPhase: 'RED',    remainingSeconds: 44, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-011', type: 'SIGNAL', name: '명동역 교차로',      intersectionId: 'INT-MYD-001', coordinate: { lat: 37.5607, lng: 126.9853 }, currentPhase: 'GREEN',  remainingSeconds: 15, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 용산구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-020', type: 'SIGNAL', name: '서울역 교차로',      intersectionId: 'INT-SLS-001', coordinate: { lat: 37.5549, lng: 126.9707 }, currentPhase: 'YELLOW', remainingSeconds: 4,  cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-021', type: 'SIGNAL', name: '삼각지역 교차로',    intersectionId: 'INT-SGJ-001', coordinate: { lat: 37.5389, lng: 126.9741 }, currentPhase: 'GREEN',  remainingSeconds: 22, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 성동구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-030', type: 'SIGNAL', name: '왕십리 교차로',      intersectionId: 'INT-WSR-001', coordinate: { lat: 37.5613, lng: 127.0385 }, currentPhase: 'YELLOW', remainingSeconds: 3,  cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 광진구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-040', type: 'SIGNAL', name: '건대입구역 교차로',  intersectionId: 'INT-KKU-001', coordinate: { lat: 37.5402, lng: 127.0705 }, currentPhase: 'GREEN',  remainingSeconds: 20, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-041', type: 'SIGNAL', name: '구의역 교차로',      intersectionId: 'INT-GUI-001', coordinate: { lat: 37.5414, lng: 127.0934 }, currentPhase: 'RED',    remainingSeconds: 35, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 동대문구 ───────────────────────────────────────────────────────────────
  { id: 'sig-050', type: 'SIGNAL', name: '청량리역 교차로',    intersectionId: 'INT-CLR-001', coordinate: { lat: 37.5797, lng: 127.0472 }, currentPhase: 'GREEN',  remainingSeconds: 18, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 중랑구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-060', type: 'SIGNAL', name: '상봉역 교차로',      intersectionId: 'INT-SBG-001', coordinate: { lat: 37.5952, lng: 127.0882 }, currentPhase: 'RED',    remainingSeconds: 40, cycleSeconds: 110, lastUpdated: Date.now() },

  // ── 성북구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-070', type: 'SIGNAL', name: '길음역 교차로',      intersectionId: 'INT-GRM-001', coordinate: { lat: 37.6030, lng: 127.0267 }, currentPhase: 'GREEN',  remainingSeconds: 25, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-071', type: 'SIGNAL', name: '미아사거리',         intersectionId: 'INT-MIA-001', coordinate: { lat: 37.6167, lng: 127.0266 }, currentPhase: 'RED',    remainingSeconds: 30, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 강북구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-080', type: 'SIGNAL', name: '수유역 교차로',      intersectionId: 'INT-SYY-001', coordinate: { lat: 37.6390, lng: 127.0254 }, currentPhase: 'RED',    remainingSeconds: 28, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 도봉구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-090', type: 'SIGNAL', name: '창동역 교차로',      intersectionId: 'INT-CDG-001', coordinate: { lat: 37.6528, lng: 127.0472 }, currentPhase: 'GREEN',  remainingSeconds: 14, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 노원구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-100', type: 'SIGNAL', name: '노원역 사거리',      intersectionId: 'INT-NWN-001', coordinate: { lat: 37.6554, lng: 127.0637 }, currentPhase: 'GREEN',  remainingSeconds: 16, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 은평구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-110', type: 'SIGNAL', name: '연신내역 교차로',    intersectionId: 'INT-YSN-001', coordinate: { lat: 37.6188, lng: 126.9205 }, currentPhase: 'RED',    remainingSeconds: 36, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 서대문구 ───────────────────────────────────────────────────────────────
  { id: 'sig-120', type: 'SIGNAL', name: '신촌 교차로',        intersectionId: 'INT-SCN-001', coordinate: { lat: 37.5551, lng: 126.9369 }, currentPhase: 'GREEN',  remainingSeconds: 22, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 마포구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-130', type: 'SIGNAL', name: '홍대입구 교차로',    intersectionId: 'INT-HDG-001', coordinate: { lat: 37.5571, lng: 126.9245 }, currentPhase: 'RED',    remainingSeconds: 30, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-131', type: 'SIGNAL', name: '합정역 교차로',      intersectionId: 'INT-HJG-001', coordinate: { lat: 37.5496, lng: 126.9143 }, currentPhase: 'GREEN',  remainingSeconds: 18, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 양천구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-140', type: 'SIGNAL', name: '오목교역 교차로',    intersectionId: 'INT-OMK-001', coordinate: { lat: 37.5238, lng: 126.8726 }, currentPhase: 'GREEN',  remainingSeconds: 33, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 강서구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-150', type: 'SIGNAL', name: '마곡나루 교차로',    intersectionId: 'INT-MGK-001', coordinate: { lat: 37.5704, lng: 126.8261 }, currentPhase: 'RED',    remainingSeconds: 42, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-151', type: 'SIGNAL', name: '화곡역 교차로',      intersectionId: 'INT-HGK-001', coordinate: { lat: 37.5476, lng: 126.8520 }, currentPhase: 'GREEN',  remainingSeconds: 20, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 구로구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-160', type: 'SIGNAL', name: '신도림역 교차로',    intersectionId: 'INT-SDL-001', coordinate: { lat: 37.5085, lng: 126.8913 }, currentPhase: 'GREEN',  remainingSeconds: 22, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 금천구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-170', type: 'SIGNAL', name: '가산디지털단지 교차로', intersectionId: 'INT-GSD-001', coordinate: { lat: 37.4814, lng: 126.8820 }, currentPhase: 'RED',  remainingSeconds: 25, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 영등포구 ───────────────────────────────────────────────────────────────
  { id: 'sig-180', type: 'SIGNAL', name: '영등포역 교차로',    intersectionId: 'INT-YDP-001', coordinate: { lat: 37.5159, lng: 126.9068 }, currentPhase: 'GREEN',  remainingSeconds: 12, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-181', type: 'SIGNAL', name: '당산역 사거리',      intersectionId: 'INT-DGS-001', coordinate: { lat: 37.5342, lng: 126.9009 }, currentPhase: 'RED',    remainingSeconds: 18, cycleSeconds: 110, lastUpdated: Date.now() },

  // ── 동작구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-190', type: 'SIGNAL', name: '노량진역 교차로',    intersectionId: 'INT-NRJ-001', coordinate: { lat: 37.5136, lng: 126.9422 }, currentPhase: 'GREEN',  remainingSeconds: 27, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-191', type: 'SIGNAL', name: '사당역 사거리',      intersectionId: 'INT-SDG-001', coordinate: { lat: 37.4764, lng: 126.9815 }, currentPhase: 'GREEN',  remainingSeconds: 14, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 관악구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-200', type: 'SIGNAL', name: '신림역 교차로',      intersectionId: 'INT-SLM-001', coordinate: { lat: 37.4844, lng: 126.9292 }, currentPhase: 'RED',    remainingSeconds: 38, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 서초구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-210', type: 'SIGNAL', name: '서초역 교차로',      intersectionId: 'INT-SCH-001', coordinate: { lat: 37.4915, lng: 127.0115 }, currentPhase: 'GREEN',  remainingSeconds: 20, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-211', type: 'SIGNAL', name: '양재역 교차로',      intersectionId: 'INT-YJR-001', coordinate: { lat: 37.4842, lng: 127.0342 }, currentPhase: 'RED',    remainingSeconds: 45, cycleSeconds: 110, lastUpdated: Date.now() },

  // ── 강남구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-220', type: 'SIGNAL', name: '강남역 사거리',      intersectionId: 'INT-GNM-001', coordinate: { lat: 37.4979, lng: 127.0277 }, currentPhase: 'GREEN',  remainingSeconds: 25, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-221', type: 'SIGNAL', name: '삼성역 교차로',      intersectionId: 'INT-SMS-001', coordinate: { lat: 37.5088, lng: 127.0632 }, currentPhase: 'RED',    remainingSeconds: 36, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-222', type: 'SIGNAL', name: '압구정 교차로',      intersectionId: 'INT-AGJ-001', coordinate: { lat: 37.5273, lng: 127.0298 }, currentPhase: 'GREEN',  remainingSeconds: 18, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 송파구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-230', type: 'SIGNAL', name: '잠실역 교차로',      intersectionId: 'INT-JMS-001', coordinate: { lat: 37.5133, lng: 127.1001 }, currentPhase: 'RED',    remainingSeconds: 42, cycleSeconds: 120, lastUpdated: Date.now() },
  { id: 'sig-231', type: 'SIGNAL', name: '석촌역 교차로',      intersectionId: 'INT-SCN-002', coordinate: { lat: 37.5037, lng: 127.1008 }, currentPhase: 'GREEN',  remainingSeconds: 16, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 강동구 ─────────────────────────────────────────────────────────────────
  { id: 'sig-240', type: 'SIGNAL', name: '천호역 사거리',      intersectionId: 'INT-CHH-001', coordinate: { lat: 37.5386, lng: 127.1237 }, currentPhase: 'GREEN',  remainingSeconds: 28, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-241', type: 'SIGNAL', name: '강동역 교차로',      intersectionId: 'INT-GDD-001', coordinate: { lat: 37.5295, lng: 127.1362 }, currentPhase: 'RED',    remainingSeconds: 32, cycleSeconds: 100, lastUpdated: Date.now() },

  // ── 경기도 ─────────────────────────────────────────────────────────────────
  { id: 'sig-300', type: 'SIGNAL', name: '수원역 교차로',      intersectionId: 'INT-SWN-001', coordinate: { lat: 37.2658, lng: 127.0001 }, currentPhase: 'GREEN',  remainingSeconds: 24, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-301', type: 'SIGNAL', name: '판교역 교차로',      intersectionId: 'INT-PGY-001', coordinate: { lat: 37.3948, lng: 127.1112 }, currentPhase: 'RED',    remainingSeconds: 38, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-302', type: 'SIGNAL', name: '부천역 교차로',      intersectionId: 'INT-BCN-001', coordinate: { lat: 37.4975, lng: 126.7824 }, currentPhase: 'GREEN',  remainingSeconds: 20, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-303', type: 'SIGNAL', name: '일산 백석역 교차로', intersectionId: 'INT-ILS-001', coordinate: { lat: 37.6565, lng: 126.7779 }, currentPhase: 'RED',    remainingSeconds: 45, cycleSeconds: 120, lastUpdated: Date.now() },
  { id: 'sig-304', type: 'SIGNAL', name: '안양역 교차로',      intersectionId: 'INT-AYG-001', coordinate: { lat: 37.3943, lng: 126.9568 }, currentPhase: 'GREEN',  remainingSeconds: 12, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-305', type: 'SIGNAL', name: '의정부역 교차로',    intersectionId: 'INT-UJB-001', coordinate: { lat: 37.7381, lng: 127.0338 }, currentPhase: 'YELLOW', remainingSeconds: 5,  cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-306', type: 'SIGNAL', name: '구리역 교차로',      intersectionId: 'INT-GRI-001', coordinate: { lat: 37.5960, lng: 127.1297 }, currentPhase: 'RED',    remainingSeconds: 32, cycleSeconds: 110, lastUpdated: Date.now() },
  { id: 'sig-307', type: 'SIGNAL', name: '용인 기흥역 교차로', intersectionId: 'INT-GHG-001', coordinate: { lat: 37.2757, lng: 127.1157 }, currentPhase: 'GREEN',  remainingSeconds: 18, cycleSeconds: 90,  lastUpdated: Date.now() },

  // ── 남양주시 ───────────────────────────────────────────────────────────────
  { id: 'sig-320', type: 'SIGNAL', name: '남양주 도농역 교차로',   intersectionId: 'INT-NJD-001', coordinate: { lat: 37.5952, lng: 127.1698 }, currentPhase: 'GREEN',  remainingSeconds: 22, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-321', type: 'SIGNAL', name: '남양주시청 교차로',      intersectionId: 'INT-NJC-001', coordinate: { lat: 37.6369, lng: 127.2166 }, currentPhase: 'RED',    remainingSeconds: 35, cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-322', type: 'SIGNAL', name: '남양주 평내호평 교차로', intersectionId: 'INT-NJP-001', coordinate: { lat: 37.6487, lng: 127.2146 }, currentPhase: 'GREEN',  remainingSeconds: 16, cycleSeconds: 90,  lastUpdated: Date.now() },
  { id: 'sig-323', type: 'SIGNAL', name: '남양주 진접읍 교차로',   intersectionId: 'INT-NJJ-001', coordinate: { lat: 37.7012, lng: 127.2056 }, currentPhase: 'YELLOW', remainingSeconds: 4,  cycleSeconds: 100, lastUpdated: Date.now() },
  { id: 'sig-324', type: 'SIGNAL', name: '남양주 마석 교차로',     intersectionId: 'INT-NJM-001', coordinate: { lat: 37.6361, lng: 127.2167 }, currentPhase: 'RED',    remainingSeconds: 28, cycleSeconds: 110, lastUpdated: Date.now() },
];

export const ALL_MOCK_NODES = [...MOCK_CCTV_NODES, ...MOCK_SIGNAL_NODES];
