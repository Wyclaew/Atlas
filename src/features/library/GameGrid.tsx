import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore } from '../../store/useStore';
import { GameCard } from './GameCard';
import { GameListRow } from './GameListRow';
import type { Game } from '../../types';

const GAP = 18;
const MIN_CARD = 168;
const LIST_ROW = 84;

export function GameGrid({ games }: { games: Game[] }) {
  const viewMode = useStore((s) => s.viewMode);
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // contentRect width already excludes padding → it's our usable inner width.
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols =
    viewMode === 'list'
      ? 1
      : Math.max(2, Math.min(8, Math.floor((width + GAP) / (MIN_CARD + GAP)) || 2));
  const colWidth = cols > 0 ? (width - GAP * (cols - 1)) / cols : 0;
  const cardHeight = colWidth * 1.5; // covers are 2:3
  const rowHeight = viewMode === 'list' ? LIST_ROW : cardHeight + GAP;

  const rows = useMemo(() => {
    const r: Game[][] = [];
    for (let i = 0; i < games.length; i += cols) r.push(games.slice(i, i + cols));
    return r;
  }, [games, cols]);

  const virt = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 4,
  });

  useEffect(() => {
    virt.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeight, cols, viewMode]);

  return (
    <div ref={parentRef} className="h-full overflow-y-auto px-8 py-6">
      {width > 0 && (
        <div className="relative w-full" style={{ height: virt.getTotalSize() }}>
          {virt.getVirtualItems().map((vr) => {
            const row = rows[vr.index];
            if (!row) return null;
            return (
              <div
                key={vr.key}
                className="absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${vr.start}px)`, height: vr.size }}
              >
                {viewMode === 'list' ? (
                  <div className="space-y-2">
                    {row.map((g) => (
                      <GameListRow key={g.id} game={g} />
                    ))}
                  </div>
                ) : (
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      gap: GAP,
                      height: cardHeight,
                    }}
                  >
                    {row.map((g) => (
                      <GameCard key={g.id} game={g} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
