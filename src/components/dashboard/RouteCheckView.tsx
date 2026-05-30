'use client';
import { useRef, useState } from 'react';
import { searchTMapPOI, getTMapRoute, GeoPoint, TMapRouteOption } from '@/services/tmap';
import { filterCCTVsAlongRoute, RouteCCTV, formatDist } from '@/utils/routeUtils';
import { SEOUL_STATIC_CCTVS } from '@/data/seoulStaticCCTVs';
import type { RouteSummary } from '@/services/tmap';

type Status = 'idle' | 'routing' | 'done' | 'error';

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.ceil((sec % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function isMockUrl(url: string) {
  return !url || url.includes('example-its.go.kr');
}

// ── 장소 검색 입력 ────────────────────────────────────────────────────────────
function PlaceInput({
  placeholder, value, onChange, onSelect,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (p: GeoPoint) => void;
}) {
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const r = await searchTMapPOI(v);
        setSuggestions(r);
        setOpen(r.length > 0);
      } catch { /* ignore */ }
    }, 400);
  };

  const pick = (p: GeoPoint) => {
    onChange(p.name);
    onSelect(p);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="relative flex-1">
      <input
        type="text" value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        className="w-full font-vfd text-xs px-3 py-2 rounded-lg"
        style={{
          background: 'rgba(91,159,255,0.05)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          outline: 'none',
          letterSpacing: '0.04em',
        }}
      />
      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden"
          style={{
            top: '100%', marginTop: 2,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i} onMouseDown={() => pick(s)}
              className="w-full text-left px-3 py-2 flex flex-col gap-0.5"
              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <span className="font-vfd text-xs" style={{ color: 'var(--accent)' }}>{s.name}</span>
              {s.addr && (
                <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>{s.addr}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 경로 타임라인 (지하철 노선도 스타일) ──────────────────────────────────────
function RouteTimeline({
  cctvs,
  selectedId,
  onSelect,
}: {
  cctvs: RouteCCTV[];
  selectedId: string | null;
  onSelect: (c: RouteCCTV) => void;
}) {
  if (cctvs.length === 0) return null;

  const totalDist = cctvs[cctvs.length - 1].routeDistM;

  return (
    <div className="px-2 py-3" style={{ overflowX: 'auto' }}>
      <div className="relative" style={{ minWidth: Math.max(320, cctvs.length * 64), height: 72 }}>
        {/* 배경 라인 */}
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 16, right: 16,
            height: 3,
            background: 'var(--tl-green)',
            borderRadius: 2,
            opacity: 0.5,
          }}
        />

        {/* 출발 점 */}
        <div style={{
          position: 'absolute', top: 14, left: 10,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--bg-surface)',
          border: '2px solid var(--tl-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tl-green)' }} />
        </div>

        {/* 도착 점 */}
        <div style={{
          position: 'absolute', top: 14, right: 10,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--bg-surface)',
          border: '2px solid var(--tl-red)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tl-red)' }} />
        </div>

        {/* CCTV 도트 */}
        {cctvs.map((cctv, idx) => {
          const ratio = totalDist > 0 ? cctv.routeDistM / totalDist : idx / cctvs.length;
          const leftPct = 4 + ratio * 92; // 4% ~ 96%
          const isSelected = cctv.id === selectedId;
          const isMock = isMockUrl(cctv.streamUrl);

          return (
            <button
              key={cctv.id}
              onClick={() => onSelect(cctv)}
              style={{
                position: 'absolute',
                top: 9,
                left: `calc(${leftPct}% - 14px)`,
                width: 28, height: 28,
                borderRadius: '50%',
                background: isSelected ? 'var(--tl-green)' : 'var(--bg-card)',
                border: `2px solid ${isMock ? 'var(--tl-yellow)' : isSelected ? 'var(--tl-green)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 2,
              }}
            >
              <span style={{ fontSize: 10, color: isSelected ? '#000' : 'var(--text-dim)' }}>
                {idx + 1}
              </span>
            </button>
          );
        })}

        {/* 라벨 */}
        {cctvs.map((cctv, idx) => {
          const ratio = totalDist > 0 ? cctv.routeDistM / totalDist : idx / cctvs.length;
          const leftPct = 4 + ratio * 92;
          return (
            <div
              key={cctv.id + '-label'}
              style={{
                position: 'absolute',
                top: 42, left: `calc(${leftPct}% - 28px)`,
                width: 56, textAlign: 'center',
              }}
            >
              <span className="font-vfd" style={{ fontSize: '0.4rem', color: 'var(--text-dim)', lineHeight: 1 }}>
                {formatDist(cctv.routeDistM)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CCTV 오버레이 카드 ────────────────────────────────────────────────────────
function CCTVOverlayCard({ cctv }: { cctv: RouteCCTV }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPIP = typeof window !== 'undefined' && 'pictureInPictureEnabled' in document;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: '3/2',
        borderRadius: 12,
        background: '#0E1018',
        border: '1px solid var(--border)',
      }}
    >
      {isMockUrl(cctv.streamUrl) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/90">
          <span className="font-vfd text-xs" style={{ color: 'var(--tl-yellow)' }}>미연결</span>
          <span className="font-vfd text-center px-4" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>
            {cctv.name}
          </span>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay muted playsInline
        />
      )}

      {/* 위치 이름 오버레이 (좌상단) */}
      <div
        className="absolute flex items-center gap-1"
        style={{ top: 8, left: 8 }}
      >
        <span
          className="font-vfd text-xs px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.5rem', backdropFilter: 'blur(4px)' }}
        >
          {cctv.name}
        </span>
      </div>

      {/* 경로 거리 오버레이 (우상단) */}
      <div
        className="absolute"
        style={{ top: 8, right: 8 }}
      >
        <span
          className="font-vfd text-xs px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(0,0,0,0.65)', color: 'var(--tl-yellow)', fontSize: '0.5rem', backdropFilter: 'blur(4px)' }}
        >
          {formatDist(cctv.routeDistM)}
        </span>
      </div>

      {/* PIP 버튼 */}
      {hasPIP && !isMockUrl(cctv.streamUrl) && (
        <button
          className="absolute"
          style={{ bottom: 8, right: 8 }}
          onClick={() => videoRef.current?.requestPictureInPicture().catch(() => {})}
        >
          <span
            className="font-vfd px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'var(--text-dim)', fontSize: '0.45rem' }}
          >
            PIP
          </span>
        </button>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export function RouteCheckView() {
  const [startText, setStartText] = useState('');
  const [endText,   setEndText]   = useState('');
  const [startPt,   setStartPt]   = useState<GeoPoint | null>(null);
  const [endPt,     setEndPt]     = useState<GeoPoint | null>(null);
  const [routeOpt,  setRouteOpt]  = useState<TMapRouteOption>('0');
  const [status,    setStatus]    = useState<Status>('idle');
  const [errMsg,    setErrMsg]    = useState('');
  const [cctvs,     setCctvs]     = useState<RouteCCTV[]>([]);
  const [selected,  setSelected]  = useState<RouteCCTV | null>(null);
  const [summary,   setSummary]   = useState<RouteSummary | null>(null);

  const canSearch = !!startPt && !!endPt;

  const handleSearch = async () => {
    if (!startPt || !endPt) return;
    setStatus('routing'); setErrMsg(''); setCctvs([]); setSelected(null); setSummary(null);
    try {
      const { polyline, summary: s } = await getTMapRoute(startPt, endPt, { optionValue: routeOpt, trafficInfo: 'Y' });
      if (polyline.length < 2) throw new Error('경로를 찾을 수 없습니다');
      setSummary(s);
      const results = filterCCTVsAlongRoute(SEOUL_STATIC_CCTVS, polyline, 300);
      setCctvs(results);
      setSelected(results[0] ?? null);
      setStatus('done');
    } catch (e) {
      setErrMsg((e as Error).message);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>

      {/* 검색 바 (고정) */}
      <div className="cyber-panel px-3 py-3 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--tl-green)', flexShrink: 0 }} />
              <PlaceInput placeholder="출발지 검색..." value={startText} onChange={setStartText} onSelect={setStartPt} />
            </div>
            <div style={{ width: 1, height: 12, background: 'var(--border)', marginLeft: 4 }} />
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--tl-red)', flexShrink: 0 }} />
              <PlaceInput placeholder="목적지 검색..." value={endText} onChange={setEndText} onSelect={setEndPt} />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={!canSearch || status === 'routing'}
            className="font-vfd text-xs rounded-xl px-3"
            style={{
              alignSelf: 'stretch',
              background: canSearch ? 'rgba(0,230,118,0.10)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${canSearch ? 'var(--tl-green)' : 'var(--border)'}`,
              color: canSearch ? 'var(--tl-green)' : 'var(--text-dim)',
              letterSpacing: '0.1em',
              minWidth: 56,
              transition: 'all 0.2s',
            }}
          >
            {status === 'routing' ? '...' : '탐색'}
          </button>
        </div>

        {/* 요약 한 줄 */}
        {summary && (
          <div
            className="flex items-center justify-between px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,214,0,0.06)', border: '1px solid rgba(255,214,0,0.18)' }}
          >
            <span className="font-display font-black" style={{ fontSize: '1.1rem', color: 'var(--tl-yellow)' }}>
              {formatTime(summary.totalTimeSec)}
            </span>
            <span className="font-vfd text-xs" style={{ color: 'var(--text-secondary)' }}>
              {formatDist(summary.totalDistanceM)}
            </span>
            <span className="font-vfd text-xs" style={{ color: cctvs.length > 0 ? 'var(--tl-green)' : 'var(--text-dim)' }}>
              {cctvs.length > 0 ? `📷 ${cctvs.length}개 구간` : 'CCTV 없음'}
            </span>
          </div>
        )}
      </div>

      {/* 에러 */}
      {status === 'error' && (
        <div className="cyber-panel px-4 py-3">
          <span className="font-vfd text-xs" style={{ color: 'var(--tl-red)' }}>{errMsg}</span>
        </div>
      )}

      {/* 타임라인 */}
      {status === 'done' && cctvs.length > 0 && (
        <div className="cyber-panel overflow-hidden">
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)' }}>경로 타임라인</span>
            <span className="font-vfd" style={{ fontSize: '0.55rem', color: 'var(--tl-green)' }}>● 원활</span>
          </div>
          <RouteTimeline cctvs={cctvs} selectedId={selected?.id ?? null} onSelect={setSelected} />
        </div>
      )}

      {/* CCTV 없음 */}
      {status === 'done' && cctvs.length === 0 && (
        <div className="cyber-panel px-4 py-3 flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tl-red)', display: 'inline-block', flexShrink: 0 }} />
          <span className="font-vfd text-xs" style={{ color: 'var(--tl-red)' }}>경로 위 CCTV 정보 없음</span>
        </div>
      )}

      {/* CCTV 캐러셀 */}
      {status === 'done' && cctvs.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* 가로 선택 목록 */}
          <div className="cyber-panel px-2 py-2 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {cctvs.map((cctv, idx) => {
                const isSel = cctv.id === selected?.id;
                return (
                  <button
                    key={cctv.id}
                    onClick={() => setSelected(cctv)}
                    className="flex flex-col items-start shrink-0 rounded-lg px-2.5 py-2 text-left"
                    style={{
                      minWidth: 100, maxWidth: 130,
                      background: isSel ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSel ? 'var(--tl-green)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span className="font-vfd mb-0.5" style={{ fontSize: '0.45rem', color: 'var(--tl-yellow)' }}>
                      #{idx + 1} · {formatDist(cctv.routeDistM)}
                    </span>
                    <span
                      className="font-vfd text-xs leading-tight"
                      style={{
                        color: isSel ? 'var(--tl-green)' : 'var(--text-secondary)',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                      }}
                    >
                      {cctv.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택 CCTV 미리보기 (3:2 오버레이) */}
          {selected && <CCTVOverlayCard cctv={selected} />}
        </div>
      )}
    </div>
  );
}
