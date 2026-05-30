'use client';
import { CCTVNode } from '@/types';

function isMockCCTV(url: string): boolean {
  return !url || url.includes('example-its.go.kr');
}

interface CCTVListProps {
  cctvs: CCTVNode[];
  selectedId: string | null;
  recommendedId: string | null;
  onSelect: (cctv: CCTVNode) => void;
  isWatching?: boolean;
  cctvSource?: string;
}

export function CCTVList({ cctvs, selectedId, recommendedId, onSelect, isWatching, cctvSource }: CCTVListProps) {
  if (cctvs.length === 0) {
    const isLoading = cctvSource === 'loading' || !isWatching;
    const noData    = isWatching && cctvSource === 'mock';

    return (
      <div className="cyber-panel px-3 py-2.5 flex items-center gap-2">
        <span
          className={isWatching && !noData ? 'dot-pulse' : ''}
          style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: noData ? 'var(--tl-red)' : isWatching ? 'var(--tl-green)' : 'var(--border)',
          }}
        />
        <span className="font-vfd text-xs" style={{ color: noData ? 'var(--tl-red)' : 'var(--text-dim)', letterSpacing: '0.08em' }}>
          {!isWatching ? 'GPS 신호 대기 중' : isLoading ? 'CCTV 탐색 중...' : 'CCTV 정보 없음'}
        </span>
      </div>
    );
  }

  return (
    <div className="cyber-panel px-2 py-2" style={{ overflow: 'hidden' }}>
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="font-vfd text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>주변 CCTV</span>
        <span className="font-vfd text-xs" style={{ color: 'var(--accent)' }}>{cctvs.length}개</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {cctvs.map((cctv) => {
          const isSelected    = cctv.id === selectedId;
          const isRecommended = cctv.id === recommendedId;
          const dist          = cctv.distance;
          return (
            <button
              key={cctv.id}
              onClick={() => onSelect(cctv)}
              className="flex flex-col items-start shrink-0 rounded-lg px-2.5 py-2 text-left"
              style={{
                minWidth: 110, maxWidth: 140,
                background: isSelected ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? 'var(--tl-green)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex gap-1 mb-0.5">
                {isRecommended && (
                  <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--tl-green)' }}>▶ 추천</span>
                )}
                {isMockCCTV(cctv.streamUrl) && (
                  <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--tl-yellow)' }}>MOCK</span>
                )}
              </div>
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
              <div className="flex items-center gap-1 mt-1">
                {dist !== undefined && (
                  <span className="font-vfd" style={{ fontSize: '0.55rem', color: 'var(--tl-yellow)' }}>
                    {dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`}
                  </span>
                )}
                {cctv.roadName && (
                  <span className="font-vfd truncate" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>
                    {cctv.roadName}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
