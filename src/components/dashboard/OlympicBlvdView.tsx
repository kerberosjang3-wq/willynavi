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
      <div className="glass-panel flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-vfd" style={{ fontSize: '0.6rem', color: 'var(--tl-green)', letterSpacing: '0.15em' }}>▶ HAN RIVER</span>
          <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)' }}>한강변 교통 CCTV</span>
        </div>
        <span className="font-vfd" style={{ fontSize: '0.65rem', color: 'var(--tl-yellow)' }}>{cctvs.length}개</span>
      </div>

      {cctvs.length > 0 && (
        <div className="cyber-panel px-2 py-2" style={{ overflow: 'hidden' }}>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {cctvs.map((cctv) => {
              const isSelected = cctv.id === selected?.id;
              return (
                <button
                  key={cctv.id}
                  onClick={() => setSelected(cctv)}
                  className="flex flex-col items-start shrink-0 rounded-lg px-2.5 py-2 text-left"
                  style={{
                    minWidth: 110, maxWidth: 140,
                    background: isSelected ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--tl-green)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {isMockCCTV(cctv.streamUrl) && (
                    <span className="font-vfd mb-0.5" style={{ fontSize: '0.45rem', color: 'var(--tl-yellow)' }}>MOCK</span>
                  )}
                  <span
                    className="font-vfd text-xs leading-tight"
                    style={{
                      color: isSelected ? 'var(--tl-green)' : 'var(--text-secondary)',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                    }}
                  >
                    {cctv.name}
                  </span>
                  {cctv.roadName && (
                    <span className="font-vfd mt-1 truncate" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>
                      {cctv.roadName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <CCTVPanel cctv={selected} />
    </div>
  );
}
