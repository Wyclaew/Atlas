// components/games/GameCard.tsx — Oyun Kartı Bileşeni
// Grid'de her bir oyunu gösteren kart: kapak görseli, hover overlay, platform ikonu, süre

import { useState } from 'react';
import { Play, Heart, Monitor, Swords, FolderOpen, Clock, Download, Gamepad2 } from 'lucide-react';
import { useGameStore, formatPlaytime } from '../../stores/useGameStore';
import { GameStatusBadge } from './GameStatusBadge';
import type { Game, PlatformName, GameStatus } from '../../types';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
}

// Platform ikonu eşlemesi
const platformIcons: Record<PlatformName, typeof Monitor> = {
  Steam: Monitor,
  Epic: Swords,
  Custom: FolderOpen,
};

const platformColorClasses: Record<PlatformName, string> = {
  Steam: 'text-sky-400',
  Epic: 'dark:text-white text-slate-800',
  Custom: 'text-purple-500',
};

export function GameCard({ game, onLaunch }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { setSelectedGame, toggleFavorite } = useGameStore();

  const PlatformIcon = platformIcons[game.platform_name] ?? FolderOpen;
  const platformColorClass = platformColorClasses[game.platform_name] ?? 'text-text-muted';
  const isInstalled = typeof game.is_installed === 'boolean' ? game.is_installed : game.is_installed === 1;
  const isFavorite = typeof game.is_favorite === 'boolean' ? game.is_favorite : game.is_favorite === 1;
  const hasCover = !imgError && game.cover_image_url;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group card-hover bg-bg-secondary border border-border-subtle aspect-[2/3]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedGame(game)}
    >
      {/* Kapak görseli veya Placeholder */}
      {!hasCover ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-bg-tertiary via-bg-secondary to-bg-elevated text-accent-indigo p-4 select-none transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-accent-indigo-glow flex items-center justify-center mb-3">
            <Gamepad2 size={24} className="text-accent-indigo animate-pulse" />
          </div>
          <span className="text-xs font-semibold px-2 text-center text-text-secondary line-clamp-2 font-display">
            {game.title}
          </span>
        </div>
      ) : (
        <img
          src={game.cover_image_url || undefined}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-smooth"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* Üst-sol: Platform ikonu */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl glass text-[10px] font-bold"
      >
        <PlatformIcon size={12} className={platformColorClass} />
        <span className="text-text-secondary">{game.platform_name}</span>
      </div>

      {/* Üst-sağ: Favori butonu */}
      <button
        className={`absolute top-3 right-3 p-2 rounded-xl transition-all duration-300 border ${
          isFavorite 
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 opacity-100 scale-100' 
            : 'bg-black/40 border-white/5 text-white/70 hover:text-white hover:bg-black/60 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(game.id);
        }}
        title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      >
        <Heart
          size={13}
          fill={isFavorite ? 'currentColor' : 'none'}
        />
      </button>

      {/* Alt gradyan overlay — her zaman görünür, temaya duyarlı */}
      <div
        className="absolute inset-x-0 bottom-0 p-4 pt-16 bg-gradient-to-t from-bg-secondary via-bg-secondary/80 to-transparent flex flex-col justify-end min-h-[100px]"
      >
        {/* Oyun başlığı */}
        <h3
          className="text-sm font-bold font-display text-text-bright truncate mb-1"
          title={game.title}
        >
          {game.title}
        </h3>

        {/* Alt bilgiler: süre + durum */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-text-secondary">
            {game.total_playtime_minutes > 0 ? (
              <span className="flex items-center gap-1 text-xs">
                <Clock size={11} className="text-text-muted" />
                {formatPlaytime(game.total_playtime_minutes)}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-text-muted">Süre yok</span>
            )}
          </div>
          <GameStatusBadge status={game.status as GameStatus} size="sm" />
        </div>
      </div>

      {/* Hover overlay — oynat / detay butonu */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'bg-black/30 backdrop-blur-[2px] opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
        }`}
      >
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-display text-xs tracking-wider transition-all duration-300 cursor-pointer ${
            isInstalled
              ? 'bg-gradient-to-r from-accent-indigo to-accent-purple text-white shadow-[0_8px_25px_var(--accent-indigo-glow)]'
              : 'bg-gradient-to-r from-accent-emerald to-accent-emerald-glow text-white shadow-[0_8px_25px_var(--accent-emerald-glow)]'
          }`}
          style={{
            transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(12px)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isInstalled) {
              onLaunch(game);
            } else {
              setSelectedGame(game);
            }
          }}
        >
          {isInstalled ? (
            <>
              <Play size={14} fill="white" />
              OYNA
            </>
          ) : (
            <>
              <Download size={14} />
              DETAY
            </>
          )}
        </button>
      </div>
    </div>
  );
}
