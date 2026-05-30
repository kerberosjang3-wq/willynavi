'use client';
import { useState } from 'react';
import { CCTVNode } from '@/types';
import { CCTVPanel } from './CCTVPanel';
import { OLYMPIC_BLVD_CCTVS } from '@/data/olympicBlvdCCTVs';

function isMockCCTV(url: string) {
  return !url || url.includes('example-its.go.kr');
}

export function OlympicBlvdView() {
  const cctvs = OLYMPIC_BLVD_CCTVS;
  const [selected, setSelected] = useState<CCTVNode>(cctvs[0]);

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
            ▶ HAN RIVER
          </span>
          <span
            className="font-vfd text-xs"
            style={{ color: 'var(--cyber-cyan-dim)' }}
          >
            한강변 교통 CCTV
          </span>
        </div>
        <span className="font-vfd" style={{ fontSize: '0.65rem', color: 'var(--cyber-amber)' }}>
          {cctvs.length}개
        </span>
      </div>

      {/* ── CCTV 선택 목록 (가로 스크롤) ────────────────────────────────── */}
      {cctvs.length > 0 && (
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
      <CCTVPanel cctv={selected} />
    </div>
  );
}
