// components/games/GameDetailPanel.tsx — Oyun Detay Paneli (Premium Slide-Over)
// Sağdan kayan cam paneli: banner, istatistikler, asimetrik PLAY butonu, kiremit turuncu vurgular

import { useState } from 'react';
import {
  X, Play, Heart, Clock, Calendar, HardDrive,
  Download, Monitor, Swords, FolderOpen,
  ChevronDown, ExternalLink,
} from 'lucide-react';
import { useGameStore, formatPlaytime } from '../../stores/useGameStore';
import { GameStatusBadge } from './GameStatusBadge';
import { ActionButton } from '../ui/ActionButton';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { selectedGame, isDetailOpen, toggleDetail, updateGameStatus, toggleFavorite, addToast } = useGameStore();
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (!selectedGame) return null;

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
    <AnimatePresence>
      {isDetailOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[6px]"
            onClick={() => toggleDetail(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col glass-strong border-l border-[rgba(255,255,255,0.06)] shadow-premium w-[450px] max-w-full overflow-hidden"
          >
            {/* Banner Görseli */}
            <div className="relative h-56 flex-shrink-0 overflow-hidden select-none">
              <img
                src={game.banner_image_url ?? game.cover_image_url ?? ''}
                alt={game.title}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.5)' }}
              />
              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#090a0f] to-transparent"
              />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/[0.1] text-white hover:bg-black/70 transition-all cursor-pointer outline-none"
                onClick={() => toggleDetail(false)}
              >
                <X size={16} />
              </motion.button>

              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute top-4 left-4 p-2 rounded-lg backdrop-blur-sm border transition-all cursor-pointer outline-none ${
                  isFavorite
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-white/[0.08] border-white/[0.1] text-white hover:bg-white/[0.12]'
                }`}
                onClick={async () => {
                  await toggleFavorite(game.id);
                  addToast(isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
                }}
              >
                <Heart
                  size={14}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </motion.button>

              {/* Başlık Overlay */}
              <div className="absolute bottom-5 left-6 right-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <PlatformIcon size={12} className="text-text-secondary" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                    {game.platform_name}
                  </span>
                </div>
                <h2
                  className="text-lg font-black font-display text-text-bright leading-tight tracking-wide"
                >
                  {game.title}
                </h2>
              </div>
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Play / Install Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ActionButton
                  variant={isInstalled ? 'accent' : 'secondary'}
                  className="w-full py-3.5 text-sm font-semibold"
                  onClick={() => {
                    if (isInstalled) {
                      onLaunch(game);
                    } else {
                      addToast('Game not installed. Please set installation path first.', 'info');
                    }
                  }}
                >
                  {isInstalled ? (
                    <>
                      <Play size={16} fill="white" />
                      Play Now
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Not Installed
                    </>
                  )}
                </ActionButton>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Playtime */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-lg p-4 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-indigo-400" />
                    <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Total Hours</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatPlaytime(game.total_playtime_minutes)}
                  </p>
                </motion.div>

                {/* Last Played */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-lg p-4 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-violet-400" />
                    <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Last Played</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatLastPlayed(game.last_played_at)}
                  </p>
                </motion.div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                  Game Status
                </label>
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all cursor-pointer outline-none"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  >
                    <GameStatusBadge status={game.status as GameStatus} size="md" />
                    <motion.div
                      animate={{ rotate: statusDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-slate-400" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {statusDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden z-50 glass border border-white/[0.10] shadow-lg"
                      >
                        {allStatuses.map((status, idx) => {
                          const isSelected = game.status === status;
                          return (
                            <motion.button
                              key={status}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer outline-none ${
                                isSelected ? 'bg-indigo-500/15 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-white/[0.05]'
                              }`}
                              onClick={async () => {
                                await updateGameStatus(game.id, status);
                                setStatusDropdownOpen(false);
                                addToast(`Status updated to "${statusLabels[status]}"`, 'success');
                              }}
                            >
                              <GameStatusBadge status={status} size="sm" />
                              <span className="text-sm font-medium">{statusLabels[status]}</span>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Install Path */}
              {game.install_path && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2.5"
                >
                  <label className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                    Install Path
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <HardDrive size={14} className="text-indigo-400 flex-shrink-0" />
                    <span className="text-xs truncate flex-1 font-mono text-slate-300 select-all" title={game.install_path}>
                      {game.install_path}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Game ID */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2.5"
              >
                <label className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                  Game ID
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <ExternalLink size={14} className="text-violet-400 flex-shrink-0" />
                  <span className="text-xs font-mono font-semibold text-slate-300 select-all">
                    {game.platform_name === 'Steam' ? `AppID: ${game.external_game_id}` : game.external_game_id}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
