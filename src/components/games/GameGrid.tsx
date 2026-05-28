// components/games/GameGrid.tsx — Sanallaştırılmış Oyun Grid'i
// @tanstack/react-virtual ile binlerce oyun kartını yüksek performansla render eder

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGameStore } from '../../stores/useGameStore';
import { GameCard } from './GameCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Gamepad2, Plus } from 'lucide-react';
import type { Game } from '../../types';

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
    estimateSize: () => (viewMode === 'list' ? 80 : 340),
    overscan: 3,
  });

  // Yükleniyor durumu
  if (isLoading) {
    return <LoadingSpinner message="Oyun kütüphanesi yükleniyor..." size="lg" />;
  }

  // Boş durum
  if (filteredGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '2px dashed var(--color-border-medium)',
          }}
        >
          <Gamepad2 size={36} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Henüz oyun bulunamadı
          </h3>
          <p className="text-sm max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Ayarlar sayfasından Steam API bilgilerinizi girerek kütüphanenizi senkronize edebilirsiniz.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => useGameStore.getState().setActiveNav('settings')}
          >
            <Plus size={16} />
            Platform Bağla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto px-6 py-4"
      style={{ height: '100%' }}
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
                <div className="space-y-2">
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
// Liste Satırı Alt Bileşeni
// =============================================
function ListRow({ game, onLaunch }: { game: Game; onLaunch: (g: Game) => void }) {
  const { setSelectedGame } = useGameStore();
  const isInstalled = typeof game.is_installed === 'boolean' ? game.is_installed : game.is_installed === 1;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
      }}
      onClick={() => setSelectedGame(game)}
    >
      {/* Mini kapak */}
      <img
        src={game.cover_image_url ?? ''}
        alt={game.title}
        className="w-12 h-16 object-cover rounded-lg"
        style={{ background: 'var(--color-bg-tertiary)' }}
      />
      {/* Oyun bilgisi */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-bright)' }}>
          {game.title}
        </h4>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {game.platform_name} • {game.total_playtime_minutes > 0 ? `${Math.round(game.total_playtime_minutes / 60)}sa` : 'Oynanmadı'}
        </p>
      </div>
      {/* Durum */}
      <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
        {game.status}
      </span>
      {/* Oynat butonu */}
      {isInstalled && (
        <button
          className="btn-primary text-xs px-3 py-1.5"
          onClick={(e) => { e.stopPropagation(); onLaunch(game); }}
        >
          Oyna
        </button>
      )}
    </div>
  );
}
