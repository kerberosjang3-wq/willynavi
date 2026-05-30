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
        {!noData && (
          <span
            className={isWatching && !noData ? 'dot-pulse' : ''}
            style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: isWatching ? '#00ff88' : 'var(--cyber-border)',
              boxShadow: isWatching ? '0 0 6px #00ff88' : 'none',
              flexShrink: 0,
            }}
          />
        )}
        {noData && (
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#ff6644', flexShrink: 0 }} />
        )}
        <span className="font-vfd text-xs" style={{
          color: noData ? '#ff6644' : 'var(--cyber-cyan-dim)',
          letterSpacing: '0.08em',
        }}>
          {!isWatching
            ? 'GPS 신호 대기 중'
            : isLoading
              ? 'CCTV 탐색 중...'
              : 'CCTV 정보 없음'}
        </span>
      </div>
    );
  }

  return (
    <div
      className="cyber-panel px-2 py-2"
      style={{ overflow: 'hidden' }}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan-dim)', letterSpacing: '0.1em' }}>
          주변 CCTV
        </span>
        <span className="font-vfd text-xs" style={{ color: 'var(--cyber-cyan)' }}>
          {cctvs.length}개
        </span>
      </div>

      {/* 가로 스크롤 목록 */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {cctvs.map((cctv) => {
          const isSelected = cctv.id === selectedId;
          const isRecommended = cctv.id === recommendedId;
          const dist = cctv.distance;

          return (
            <button
              key={cctv.id}
              onClick={() => onSelect(cctv)}
              className="flex flex-col items-start shrink-0 rounded-lg px-2.5 py-2 text-left"
              style={{
                minWidth: 110,
                maxWidth: 140,
                background: isSelected
                  ? 'rgba(0, 212, 255, 0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'var(--cyber-cyan)' : 'var(--cyber-border)'}`,
                boxShadow: isSelected ? '0 0 8px rgba(0,212,255,0.2)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {/* 배지 */}
              <div className="flex gap-1 mb-0.5">
                {isRecommended && (
                  <span className="font-vfd" style={{ fontSize: '0.45rem', color: '#00ff88', letterSpacing: '0.1em' }}>
                    ▶ 추천
                  </span>
                )}
                {isMockCCTV(cctv.streamUrl) && (
                  <span className="font-vfd" style={{ fontSize: '0.45rem', color: 'var(--cyber-amber)', letterSpacing: '0.08em' }}>
                    MOCK
                  </span>
                )}
              </div>

              {/* 카메라명 */}
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

              {/* 거리 + 도로명 */}
              <div className="flex items-center gap-1 mt-1">
                {dist !== undefined && (
                  <span className="font-vfd" style={{ fontSize: '0.55rem', color: 'var(--cyber-amber)' }}>
                    {dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`}
                  </span>
                )}
                {cctv.roadName && (
                  <span className="font-vfd truncate" style={{ fontSize: '0.5rem', color: 'var(--cyber-border)' }}>
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
