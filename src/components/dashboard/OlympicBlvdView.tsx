'use client';
import { useState, useEffect } from 'react';
import { CCTVNode, CCTVSource } from '@/types';
import { CCTVPanel } from './CCTVPanel';

const BBOX = { minLat: 37.49, maxLat: 37.57, minLng: 126.80, maxLng: 127.15 };

function isMockCCTV(url: string) {
  return !url || url.includes('example-its.go.kr');
}

function rawToNode(r: Record<string, string>, source: CCTVSource, idx: number): CCTVNode {
  return {
    id:         r.cctvid || `olympic-${idx}`,
    type:       'CCTV',
    name:       r.cctvname || '올림픽대로 CCTV',
    coordinate: { lat: parseFloat(r.coordy), lng: parseFloat(r.coordx) },
    streamUrl:  r.cctvurl || '',
    source,
    roadName:   r.roadsectionid || '올림픽대로',
  };
}

export function OlympicBlvdView() {
  const [cctvs, setCctvs]     = useState<CCTVNode[]>([]);
  const [selected, setSelected] = useState<CCTVNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      minY: String(BBOX.minLat),
      maxY: String(BBOX.maxLat),
      minX: String(BBOX.minLng),
      maxX: String(BBOX.maxLng),
    });
    fetch(`/api/cctv?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const rows: Record<string, string>[] = data?.response?.data ?? [];
        const src: CCTVSource =
          data?.source === 'seoul' ? 'SEOUL' : 'ITS';
        const nodes = rows.map((r, i) => rawToNode(r, src, i));
        setCctvs(nodes);
        setSelected(nodes[0] ?? null);
      })
      .catch(() => setError('CCTV 목록을 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {/* ── 섹션 헤더 ──────────────────────────────────────────────────── */}
      <div
        className="glass-panel flex items-center justify-between px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <span
            className="font-vfd"
            style={{ fontSize: '0.6rem', color: 'var(--cyber-cyan)', letterSpacing: '0.15em' }}
          >
            ▶ OLYMPIC BLVD
          </span>
          <span
            className="font-vfd text-xs"
            style={{ color: 'var(--cyber-cyan-dim)' }}
          >
            올림픽대로 전구간
          </span>
        </div>
        {!loading && (
          <span className="font-vfd" style={{ fontSize: '0.65rem', color: 'var(--cyber-amber)' }}>
            {cctvs.length}개
          </span>
        )}
      </div>

      {/* ── 로딩 / 에러 ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="cyber-panel flex items-center gap-2 px-4 py-3">
          <span
            className="dot-pulse"
            style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: '#00ff88', boxShadow: '0 0 6px #00ff88', flexShrink: 0,
            }}
          />
          <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.08em' }}>
            CCTV 로딩 중...
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="cyber-panel px-4 py-3">
          <span className="font-vfd text-xs" style={{ color: '#ff4444' }}>{error}</span>
        </div>
      )}

      {/* ── CCTV 선택 목록 (가로 스크롤) ────────────────────────────────── */}
      {!loading && cctvs.length > 0 && (
        <div className="cyber-panel px-2 py-2" style={{ overflow: 'hidden' }}>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {cctvs.map((cctv) => {
              const isSelected = cctv.id === selected?.id;
              return (
                <button
                  key={cctv.id}
                  onClick={() => setSelected(cctv)}
                  className="flex flex-col items-start shrink-0 rounded-lg px-2.5 py-2 text-left"
                  style={{
                    minWidth: 110,
                    maxWidth: 140,
                    background: isSelected ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'var(--cyber-cyan)' : 'var(--cyber-border)'}`,
                    boxShadow: isSelected ? '0 0 8px rgba(0,212,255,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isMockCCTV(cctv.streamUrl) && (
                    <span className="font-vfd mb-0.5" style={{ fontSize: '0.45rem', color: 'var(--cyber-amber)', letterSpacing: '0.08em' }}>
                      MOCK
                    </span>
                  )}
                  <span
                    className="font-vfd text-xs leading-tight"
                    style={{
                      color: isSelected ? 'var(--cyber-cyan)' : '#8899aa',
                      textShadow: isSelected ? '0 0 6px #00d4ff44' : 'none',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}
                  >
                    {cctv.name}
                  </span>
                  {cctv.roadName && (
                    <span className="font-vfd mt-1 truncate" style={{ fontSize: '0.5rem', color: 'var(--cyber-border)' }}>
                      {cctv.roadName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 선택된 CCTV 스트리밍 ─────────────────────────────────────────── */}
      {!loading && <CCTVPanel cctv={selected} />}
    </div>
  );
}
