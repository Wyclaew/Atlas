// components/games/GameGrid.tsx — Sanallaştırılmış Oyun Grid'i
// @tanstack/react-virtual ile binlerce oyun kartını yüksek performansla render eder

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGameStore } from '../../stores/useGameStore';
import { GameCard } from './GameCard';
import { GameStatusBadge } from './GameStatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ActionButton } from '../ui/ActionButton';
import { Gamepad2, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Game, GameStatus } from '../../types';

interface GameGridProps {
  onLaunchGame: (game: Game) => void;
}

// Grid'deki sütun sayısı — pencere genişliğine göre hesaplanır
const GAP = 16;             // kartlar arası boşluk (px)

export function GameGrid({ onLaunchGame }: GameGridProps) {
  const { filteredGames, isLoading, viewMode } = useGameStore();
  const parentRef = useRef<HTMLDivElement>(null);

  // Sütun sayısını hesapla (parent genişliğine göre)
  const columnCount = useMemo(() => {
    if (viewMode === 'list') return 1;
    // Varsayılan: 5 sütun (1440px genişlik için)
    // Bu değer gerçekte resize observer ile dinamik olmalı,
    // ancak başlangıç için sabit değer kullanıyoruz
    return 5;
  }, [viewMode]);

  // Satırları oluştur (her satırda columnCount kadar kart)
  const rows = useMemo(() => {
    const result: Game[][] = [];
    for (let i = 0; i < filteredGames.length; i += columnCount) {
      result.push(filteredGames.slice(i, i + columnCount));
    }
    return result;
  }, [filteredGames, columnCount]);

  // Sanallaştırılmış satırlar
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === 'list' ? 84 : 340),
    overscan: 3,
  });

  // Yükleniyor durumu
  if (isLoading) {
    return <LoadingSpinner message="Kütüphane taranıyor..." size="lg" />;
  }

  // Empty State
  if (filteredGames.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center max-w-sm text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 mb-6"
          >
            <Gamepad2 size={40} className="text-indigo-400" />
          </motion.div>

          <h3 className="text-xl font-bold text-white mb-2">
            No Games Yet
          </h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
            Connect your Steam or Epic Games account to start building your library.
          </p>

          <ActionButton
            variant="accent"
            icon={Plus}
            onClick={() => useGameStore.getState().setActiveNav('settings')}
          >
            Connect Platform
          </ActionButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto px-8 py-6 h-full"
    >
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const gamesInRow = rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {viewMode === 'grid' ? (
                /* Grid Görünümü */
                <div
                  className="grid gap-4 h-full"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                    paddingBottom: `${GAP}px`,
                  }}
                >
                  {gamesInRow.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onLaunch={onLaunchGame}
                    />
                  ))}
                </div>
              ) : (
                /* Liste Görünümü */
                <div className="space-y-3 pb-3">
                  {gamesInRow.map((game) => (
                    <ListRow key={game.id} game={game} onLaunch={onLaunchGame} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================
// List Row Sub-Component
// =============================================
function ListRow({ game, onLaunch }: { game: Game; onLaunch: (g: Game) => void }) {
  const { setSelectedGame } = useGameStore();
  const isInstalled = typeof game.is_installed === 'boolean' ? game.is_installed : game.is_installed === 1;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all duration-200"
      onClick={() => setSelectedGame(game)}
    >
      {/* Mini Cover */}
      <img
        src={game.cover_image_url ?? ''}
        alt={game.title}
        className="w-10 h-14 object-cover rounded-md bg-white/[0.04]"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="56"><rect width="40" height="56" fill="%23222222"/></svg>';
        }}
      />
      {/* Game Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">
          {game.title}
        </h4>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <span>{game.platform_name}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          {game.total_playtime_minutes > 0 ? (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {Math.round(game.total_playtime_minutes / 60)}h
            </span>
          ) : (
            <span>No playtime</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <GameStatusBadge status={game.status as GameStatus} size="sm" />

        {isInstalled && (
          <ActionButton
            variant="secondary"
            className="text-xs py-1.5 px-3"
            onClick={(e) => { e.stopPropagation(); onLaunch(game); }}
          >
            Play
          </ActionButton>
        )}
      </div>
    </motion.div>
  );
}

