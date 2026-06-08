// components/games/GameCard.tsx — Premium Game Card Component

import { useState } from 'react';
import { Play, Heart, Monitor, Swords, FolderOpen, Clock, Info, Gamepad2 } from 'lucide-react';
import { useGameStore, formatPlaytime } from '../../stores/useGameStore';
import { GameStatusBadge } from './GameStatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import type { Game, PlatformName, GameStatus } from '../../types';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
}

const platformIcons: Record<PlatformName, typeof Monitor> = {
  Steam: Monitor,
  Epic: Swords,
  Custom: FolderOpen,
};

const platformColors: Record<PlatformName, string> = {
  Steam: '#66c0f4',
  Epic: '#ffffff',
  Custom: '#f97316',
};

export function GameCard({ game, onLaunch }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { setSelectedGame, toggleFavorite } = useGameStore();

  const PlatformIcon = platformIcons[game.platform_name] ?? FolderOpen;
  const platformColor = platformColors[game.platform_name] ?? '#a0a0a0';
  const isInstalled = typeof game.is_installed === 'boolean' ? game.is_installed : game.is_installed === 1;
  const isFavorite = typeof game.is_favorite === 'boolean' ? game.is_favorite : game.is_favorite === 1;
  const hasCover = !imgError && game.cover_image_url;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      className="relative rounded-lg overflow-hidden cursor-pointer bg-white/[0.03] border border-white/[0.08] aspect-[2/3] select-none group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedGame(game)}
    >
      {/* Cover Image or Placeholder */}
      {!hasCover ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/5 to-violet-600/5 p-4">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="w-14 h-14 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4"
          >
            <Gamepad2 size={24} className="text-indigo-400" />
          </motion.div>
          <span className="text-xs font-semibold text-center text-slate-400 line-clamp-2">
            {game.title}
          </span>
        </div>
      ) : (
        <>
          <img
            src={game.cover_image_url || undefined}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            }}
            onError={() => setImgError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </>
      )}

      {/* Platform Badge - Top Left */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }}
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.1]"
      >
        <PlatformIcon size={12} style={{ color: platformColor }} />
        <span className="text-[10px] font-semibold text-white">
          {game.platform_name}
        </span>
      </motion.div>

      {/* Favorite Button - Top Right */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isFavorite ? 1 : isHovered ? 1 : 0,
          scale: isFavorite ? 1 : isHovered ? 1 : 0.8,
        }}
        className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-sm border transition-all ${
          isFavorite
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-white/[0.08] border-white/[0.1] text-white hover:bg-white/[0.12]'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(game.id);
        }}
      >
        <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
      </motion.button>

      {/* Bottom Info */}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h3 className="text-sm font-semibold text-white truncate mb-2" title={game.title}>
          {game.title}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            {game.total_playtime_minutes > 0 ? (
              <>
                <Clock size={12} />
                <span>{formatPlaytime(game.total_playtime_minutes)}</span>
              </>
            ) : (
              <span>No playtime</span>
            )}
          </div>
          <GameStatusBadge status={game.status as GameStatus} size="sm" />
        </div>
      </div>

      {/* Hover Action Layer */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <motion.button
              initial={{ scale: 0.8, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 12 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all border outline-none ${
                isInstalled
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-400/30 shadow-lg hover:shadow-xl'
                  : 'bg-white/[0.1] hover:bg-white/[0.15] text-white border-white/[0.2]'
              }`}
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
                  Play
                </>
              ) : (
                <>
                  <Info size={14} />
                  Details
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
