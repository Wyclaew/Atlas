// components/games/GameCard.tsx — Oyun Kartı Bileşeni
// Grid'de her bir oyunu gösteren kart: kapak görseli, hover overlay, platform ikonu, süre

import { useState } from 'react';
import { Play, Heart, Monitor, Swords, FolderOpen, Clock, Download } from 'lucide-react';
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

const platformColors: Record<PlatformName, string> = {
  Steam: '#66c0f4',
  Epic: '#ffffff',
  Custom: '#a855f7',
};

// Varsayılan kapak görseli (gradient placeholder)
const DEFAULT_COVER = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e"/>
        <stop offset="100%" style="stop-color:#22223a"/>
      </linearGradient>
    </defs>
    <rect width="300" height="450" fill="url(#g)"/>
    <text x="150" y="225" text-anchor="middle" fill="#4a4a66" font-family="sans-serif" font-size="48">🎮</text>
  </svg>
`);

export function GameCard({ game, onLaunch }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { setSelectedGame, toggleFavorite } = useGameStore();

  const PlatformIcon = platformIcons[game.platform_name] ?? FolderOpen;
  const platformColor = platformColors[game.platform_name] ?? '#888';
  const isInstalled = typeof game.is_installed === 'boolean' ? game.is_installed : game.is_installed === 1;
  const isFavorite = typeof game.is_favorite === 'boolean' ? game.is_favorite : game.is_favorite === 1;
  const coverSrc = imgError || !game.cover_image_url ? DEFAULT_COVER : game.cover_image_url;

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group card-hover"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        aspectRatio: '2 / 3',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedGame(game)}
    >
      {/* Kapak görseli */}
      <img
        src={coverSrc}
        alt={game.title}
        className="w-full h-full object-cover transition-transform duration-500"
        style={{
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        }}
        onError={() => setImgError(true)}
        loading="lazy"
      />

      {/* Üst-sol: Platform ikonu */}
      <div
        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md glass"
        style={{ fontSize: '0.65rem' }}
      >
        <PlatformIcon size={12} style={{ color: platformColor }} />
        <span style={{ color: 'var(--color-text-secondary)' }}>{game.platform_name}</span>
      </div>

      {/* Üst-sağ: Favori butonu */}
      <button
        className="absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200"
        style={{
          background: isFavorite ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0,0,0,0.4)',
          opacity: isHovered || isFavorite ? 1 : 0,
          transform: isHovered ? 'scale(1)' : 'scale(0.8)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(game.id);
        }}
        title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      >
        <Heart
          size={14}
          fill={isFavorite ? '#f43f5e' : 'none'}
          color={isFavorite ? '#f43f5e' : 'white'}
        />
      </button>

      {/* Alt gradient overlay — her zaman görünür */}
      <div
        className="absolute inset-x-0 bottom-0 p-3"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
          paddingTop: '48px',
        }}
      >
        {/* Oyun başlığı */}
        <h3
          className="text-sm font-semibold truncate mb-1"
          style={{ color: 'var(--color-text-bright)' }}
          title={game.title}
        >
          {game.title}
        </h3>

        {/* Alt bilgiler: süre + durum */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {game.total_playtime_minutes > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <Clock size={10} />
                {formatPlaytime(game.total_playtime_minutes)}
              </span>
            )}
          </div>
          <GameStatusBadge status={game.status as GameStatus} size="sm" />
        </div>
      </div>

      {/* Hover overlay — oynat butonu */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          background: isHovered ? 'rgba(0,0,0,0.45)' : 'transparent',
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
          style={{
            background: isInstalled
              ? 'linear-gradient(135deg, var(--color-accent-indigo), #4f46e5)'
              : 'linear-gradient(135deg, var(--color-accent-emerald), #059669)',
            color: 'white',
            transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(8px)',
            boxShadow: isHovered ? '0 8px 32px rgba(99, 102, 241, 0.4)' : 'none',
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
              <Play size={16} fill="white" />
              OYNA
            </>
          ) : (
            <>
              <Download size={16} />
              DETAY
            </>
          )}
        </button>
      </div>
    </div>
  );
}
