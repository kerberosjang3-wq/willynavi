'use client';
import { useRef, useState } from 'react';
import { CCTVPanel } from './CCTVPanel';
import { searchTMapPOI, getTMapRoute, GeoPoint, TMapRouteOption } from '@/services/tmap';
import { filterCCTVsAlongRoute, RouteCCTV, formatDist } from '@/utils/routeUtils';
import { SEOUL_STATIC_CCTVS } from '@/data/seoulStaticCCTVs';
import type { RouteSummary } from '@/services/tmap';

type Status = 'idle' | 'searching' | 'routing' | 'done' | 'error';

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.ceil((sec % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

// T-Map 경로 옵션 목록
const ROUTE_OPTIONS: { value: TMapRouteOption; label: string }[] = [
  { value: '0', label: '추천'         },
  { value: '1', label: '최단거리'     },
  { value: '2', label: '무료도로'     },
  { value: '3', label: '고속도로 우선' },
  { value: '4', label: '고속도로 회피' },
  { value: '5', label: '유료도로 회피' },
];

function isMockCCTV(url: string) {
  return !url || url.includes('example-its.go.kr');
}

// ── 장소 검색 입력 컴포넌트 ──────────────────────────────────────────────────
function PlaceInput({
  label, value, onChange, onSelect,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (p: GeoPoint) => void;
}) {
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [open, setOpen]               = useState(false);
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
    <div className="relative">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-vfd" style={{ fontSize: '0.55rem', color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em', minWidth: 36 }}>
          {label}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={`${label} 검색...`}
          className="flex-1 font-vfd text-xs px-2 py-1.5 rounded"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid var(--cyber-border)',
            color: 'var(--cyber-cyan)',
            outline: 'none',
            letterSpacing: '0.05em',
          }}
        />
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden"
          style={{
            top: '100%', marginTop: 2,
            background: '#0d1117',
            border: '1px solid var(--cyber-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => pick(s)}
              className="w-full text-left px-3 py-2 flex flex-col gap-0.5"
              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid var(--cyber-border)' : 'none' }}
            >
              <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan)' }}>{s.name}</span>
              {s.addr && (
                <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--cyber-cyan-dim)' }}>{s.addr}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export function RouteCCTVView() {
  const [startText,   setStartText]   = useState('');
  const [endText,     setEndText]     = useState('');
  const [startPt,     setStartPt]     = useState<GeoPoint | null>(null);
  const [endPt,       setEndPt]       = useState<GeoPoint | null>(null);
  const [routeOption, setRouteOption] = useState<TMapRouteOption>('0');
  const [status,      setStatus]      = useState<Status>('idle');
  const [errMsg,      setErrMsg]      = useState('');
  const [cctvs,       setCctvs]       = useState<RouteCCTV[]>([]);
  const [selected,    setSelected]    = useState<RouteCCTV | null>(null);
  const [summary,     setSummary]     = useState<RouteSummary | null>(null);

  const canSearch = !!startPt && !!endPt;

  const handleSearch = async () => {
    if (!startPt || !endPt) return;
    setStatus('routing');
    setErrMsg('');
    setCctvs([]);
    setSelected(null);
    setSummary(null);

    try {
      const { polyline, summary: routeSummary } = await getTMapRoute(startPt, endPt, {
        optionValue: routeOption,
        trafficInfo: 'Y',
      });
      if (polyline.length < 2) throw new Error('경로를 찾을 수 없습니다');

      setSummary(routeSummary);
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
      {/* 헤더 */}
      <div className="glass-panel flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: 'var(--cyber-cyan)', letterSpacing: '0.15em' }}>
            ▶ ROUTE CCTV
          </span>
          <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)' }}>
            경로별 카메라
          </span>
        </div>
        {status === 'done' && cctvs.length > 0 && (
          <span className="font-vfd" style={{ fontSize: '0.65rem', color: 'var(--cyber-amber)' }}>
            {cctvs.length}개
          </span>
        )}
      </div>

      {/* 입력 폼 */}
      <div className="cyber-panel px-3 py-3 flex flex-col gap-2">
        <PlaceInput label="출발지" value={startText} onChange={setStartText} onSelect={setStartPt} />
        <PlaceInput label="목적지" value={endText}   onChange={setEndText}   onSelect={setEndPt} />

        {/* 경로 옵션 */}
        <div className="flex flex-col gap-1">
          <span className="font-vfd" style={{ fontSize: '0.5rem', color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em' }}>
            경로 옵션
          </span>
          <div className="flex flex-wrap gap-1">
            {ROUTE_OPTIONS.map((opt) => {
              const active = routeOption === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setRouteOption(opt.value)}
                  className="font-vfd rounded px-2 py-1"
                  style={{
                    fontSize: '0.5rem',
                    letterSpacing: '0.08em',
                    background: active ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'var(--cyber-cyan)' : 'var(--cyber-border)'}`,
                    color: active ? 'var(--cyber-cyan)' : 'var(--cyber-cyan-dim)',
                    transition: 'all 0.15s',
                  }}
                >
                  {active ? '▶ ' : ''}{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 경로 요약 (소요시간 · 거리 · 통행료) */}
        {summary && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(255,157,0,0.08)', border: '1px solid rgba(255,157,0,0.3)' }}
          >
            <div className="flex flex-col items-center flex-1">
              <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em' }}>소요시간</span>
              <span className="font-display font-black" style={{ fontSize: '1.3rem', color: 'var(--cyber-amber)', textShadow: '0 0 10px #ff9d00', lineHeight: 1.1 }}>
                {formatTime(summary.totalTimeSec)}
              </span>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,157,0,0.25)' }} />
            <div className="flex flex-col items-center flex-1">
              <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em' }}>거리</span>
              <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan)' }}>{formatDist(summary.totalDistanceM)}</span>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255,157,0,0.25)' }} />
            <div className="flex flex-col items-center flex-1">
              <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em' }}>통행료</span>
              <span className="font-vfd text-xs" style={{ color: summary.totalFare > 0 ? '#ff9d00' : 'var(--cyber-cyan-dim)' }}>
                {summary.totalFare > 0 ? `${summary.totalFare.toLocaleString()}원` : '없음'}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={!canSearch || status === 'routing'}
          className="font-vfd text-xs py-2 rounded-lg"
          style={{
            background: canSearch ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${canSearch ? 'var(--cyber-cyan)' : 'var(--cyber-border)'}`,
            color: canSearch ? 'var(--cyber-cyan)' : 'var(--cyber-border)',
            letterSpacing: '0.15em',
            transition: 'all 0.2s',
          }}
        >
          {status === 'routing' ? '경로 계산 중...' : '▶ 경로 탐색'}
        </button>
      </div>

      {/* 에러 */}
      {status === 'error' && (
        <div className="cyber-panel px-4 py-3">
          <span className="font-vfd text-xs" style={{ color: '#ff4444' }}>{errMsg}</span>
        </div>
      )}

      {/* 결과 없음 */}
      {status === 'done' && cctvs.length === 0 && (
        <div className="cyber-panel px-4 py-3 flex items-center gap-2">
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff6644', flexShrink: 0 }} />
          <span className="font-vfd text-xs" style={{ color: '#ff6644' }}>
            경로 위 CCTV 정보 없음
          </span>
        </div>
      )}

      {/* CCTV 목록 (가로 스크롤) */}
      {status === 'done' && cctvs.length > 0 && (
        <div className="cyber-panel px-2 py-2" style={{ overflow: 'hidden' }}>
          <div className="flex items-center gap-1 mb-1.5 px-1">
            <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)' }}>경로 순서</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {cctvs.map((cctv, idx) => {
              const isSelected = cctv.id === selected?.id;
              return (
                <button
                  key={cctv.id}
                  onClick={() => setSelected(cctv)}
                  className="flex flex-col items-start shrink-0 rounded-lg px-2.5 py-2 text-left"
                  style={{
                    minWidth: 110, maxWidth: 140,
                    background: isSelected ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'var(--cyber-cyan)' : 'var(--cyber-border)'}`,
                    boxShadow: isSelected ? '0 0 8px rgba(0,212,255,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* 순서 번호 */}
                  <span className="font-vfd mb-0.5" style={{ fontSize: '0.45rem', color: 'var(--cyber-amber)' }}>
                    #{idx + 1} · {formatDist(cctv.routeDistM)}
                  </span>
                  {isMockCCTV(cctv.streamUrl) && (
                    <span className="font-vfd mb-0.5" style={{ fontSize: '0.4rem', color: '#ff6644' }}>미연결</span>
                  )}
                  <span
                    className="font-vfd text-xs leading-tight"
                    style={{
                      color: isSelected ? 'var(--cyber-cyan)' : '#8899aa',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                    }}
                  >
                    {cctv.name}
                  </span>
                  <span className="font-vfd mt-1 truncate" style={{ fontSize: '0.45rem', color: 'var(--cyber-border)' }}>
                    경로에서 {cctv.perpDistM}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택 CCTV 스트림 */}
      {status === 'done' && <CCTVPanel cctv={selected} />}
    </div>
  );
}
