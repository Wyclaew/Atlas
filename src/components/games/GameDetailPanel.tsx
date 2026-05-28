// components/games/GameDetailPanel.tsx — Oyun Detay Paneli
// Sağdan kayan slide-over panel: banner, istatistikler, PLAY butonu, durum değiştirici

import { useState } from 'react';
import {
  X, Play, Heart, Clock, Calendar, HardDrive,
  Download, Monitor, Swords, FolderOpen,
  ChevronDown, ExternalLink,
} from 'lucide-react';
import { useGameStore, formatPlaytime } from '../../stores/useGameStore';
import { GameStatusBadge } from './GameStatusBadge';
import type { Game, GameStatus, PlatformName } from '../../types';

interface GameDetailPanelProps {
  onLaunch: (game: Game) => void;
}

const allStatuses: GameStatus[] = ['Backlog', 'Playing', 'Completed', 'Wishlist', 'Dropped'];

const statusLabels: Record<GameStatus, string> = {
  Backlog: 'Beklemede',
  Playing: 'Oynuyor',
  Completed: 'Tamamlandı',
  Wishlist: 'İstek Listesi',
  Dropped: 'Bırakıldı',
};

const platformIcons: Record<PlatformName, typeof Monitor> = {
  Steam: Monitor,
  Epic: Swords,
  Custom: FolderOpen,
};

export function GameDetailPanel({ onLaunch }: GameDetailPanelProps) {
  const { selectedGame, isDetailOpen, toggleDetail, updateGameStatus, toggleFavorite } = useGameStore();
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (!selectedGame || !isDetailOpen) return null;

  const game = selectedGame;
  const isInstalled = typeof game.is_installed === 'boolean' ? game.is_installed : game.is_installed === 1;
  const isFavorite = typeof game.is_favorite === 'boolean' ? game.is_favorite : game.is_favorite === 1;
  const PlatformIcon = platformIcons[game.platform_name] ?? FolderOpen;

  // Son oynama tarihini formatla
  const formatLastPlayed = (dateStr: string | null): string => {
    if (!dateStr) return 'Hiç oynanmadı';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Bugün';
      if (diffDays === 1) return 'Dün';
      if (diffDays < 7) return `${diffDays} gün önce`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
      return `${Math.floor(diffDays / 365)} yıl önce`;
    } catch {
      return 'Bilinmiyor';
    }
  };

  return (
    <>
      {/* Backdrop — tıklayınca kapat */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => toggleDetail(false)}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col animate-slide-right"
        style={{
          width: '480px',
          maxWidth: '100vw',
          background: 'var(--color-bg-primary)',
          borderLeft: '1px solid var(--color-border-subtle)',
          boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Banner görseli */}
        <div className="relative h-56 flex-shrink-0 overflow-hidden">
          <img
            src={game.banner_image_url ?? game.cover_image_url ?? ''}
            alt={game.title}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.7)' }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, var(--color-bg-primary) 0%, transparent 60%)',
            }}
          />

          {/* Kapat butonu */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full glass transition-all duration-200 hover:scale-110"
            onClick={() => toggleDetail(false)}
          >
            <X size={18} style={{ color: 'var(--color-text-primary)' }} />
          </button>

          {/* Favori butonu */}
          <button
            className="absolute top-4 left-4 p-2 rounded-full glass transition-all duration-200 hover:scale-110"
            onClick={() => toggleFavorite(game.id)}
          >
            <Heart
              size={18}
              fill={isFavorite ? '#f43f5e' : 'none'}
              color={isFavorite ? '#f43f5e' : 'white'}
            />
          </button>

          {/* Başlık overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-2">
              <PlatformIcon size={14} style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {game.platform_name}
              </span>
            </div>
            <h2
              className="text-2xl font-bold leading-tight"
              style={{ color: 'var(--color-text-bright)' }}
            >
              {game.title}
            </h2>
          </div>
        </div>

        {/* İçerik — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* OYNA / KAPAT butonu */}
          <button
            className="w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: isInstalled
                ? 'linear-gradient(135deg, var(--color-accent-indigo), #4f46e5)'
                : 'linear-gradient(135deg, var(--color-accent-emerald), #059669)',
              color: 'white',
              boxShadow: isInstalled
                ? '0 4px 20px var(--color-accent-indigo-glow)'
                : '0 4px 20px var(--color-accent-emerald-glow)',
            }}
            onClick={() => {
              if (isInstalled) onLaunch(game);
            }}
          >
            {isInstalled ? (
              <>
                <Play size={20} fill="white" />
                OYNA
              </>
            ) : (
              <>
                <Download size={20} />
                YÜKLENMEMIŞ
              </>
            )}
          </button>

          {/* İstatistik kartları */}
          <div className="grid grid-cols-2 gap-3">
            {/* Toplam süre */}
            <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} style={{ color: 'var(--color-accent-indigo)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Toplam Süre</span>
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-bright)' }}>
                {formatPlaytime(game.total_playtime_minutes)}
              </p>
            </div>

            {/* Son oynama */}
            <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} style={{ color: 'var(--color-accent-emerald)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Son Oynama</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-bright)' }}>
                {formatLastPlayed(game.last_played_at)}
              </p>
            </div>
          </div>

          {/* Durum değiştirici */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
              DURUM
            </label>
            <div className="relative">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                <GameStatusBadge status={game.status as GameStatus} size="md" />
                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--color-text-muted)',
                    transform: statusDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* Dropdown menü */}
              {statusDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 animate-scale-in"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-medium)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {allStatuses.map((status) => (
                    <button
                      key={status}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150"
                      style={{
                        background: game.status === status ? 'var(--color-bg-hover)' : 'transparent',
                        color: 'var(--color-text-primary)',
                      }}
                      onClick={() => {
                        updateGameStatus(game.id, status);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      <GameStatusBadge status={status} size="sm" />
                      <span className="text-sm">{statusLabels[status]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kurulum bilgileri */}
          {game.install_path && (
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                KURULUM YOLU
              </label>
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <HardDrive size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs truncate flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {game.install_path}
                </span>
              </div>
            </div>
          )}

          {/* Oyun ID bilgisi */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
              OYUN KIMLIĞI
            </label>
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <ExternalLink size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {game.platform_name === 'Steam' ? `AppID: ${game.external_game_id}` : game.external_game_id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
