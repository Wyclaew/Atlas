import { useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { CoverImage } from '../../components/ui/CoverImage';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badges';
import { useStore } from '../../store/useStore';
import { coverCandidates } from '../../lib/steamArt';
import { formatPlaytime } from '../../lib/format';
import type { Game } from '../../types';

export function GameCard({ game }: { game: Game }) {
  const openGame = useStore((s) => s.openGame);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const setAccent = useStore((s) => s.setAccent);

  const [accent, setLocalAccent] = useState(game.accent_color ?? 'var(--color-accent)');
  const covers = useMemo(() => coverCandidates(game), [game.platform_key, game.external_id, game.cover_url]);
  const fav = !!game.is_favorite;
  const hasAch = game.achievements_total > 0;

  return (
    <motion.div
      style={{ '--g': accent } as CSSProperties}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="group relative h-full w-full"
    >
      <button
        onClick={() => openGame(game.id)}
        className="ring-game relative block h-full w-full overflow-hidden rounded-xl bg-surface-2 text-left"
      >
        <CoverImage
          candidates={covers}
          alt={game.title}
          className="h-full w-full"
          onAccent={(hex) => {
            setLocalAccent(hex);
            setAccent(game.id, hex);
          }}
        />

        {/* readability scrim, strengthens on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95" />

        {/* platform glyph */}
        <div className="absolute left-2.5 top-2.5 rounded-md bg-black/45 px-1.5 py-1 backdrop-blur-sm">
          <PlatformBadge platform={game.platform_key} showName={false} />
        </div>

        {/* favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            void toggleFavorite(game.id);
          }}
          className={`absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-md backdrop-blur-sm transition-all ${
            fav
              ? 'bg-black/45 text-rose-400 opacity-100'
              : 'bg-black/45 text-white/80 opacity-0 hover:text-white group-hover:opacity-100'
          }`}
          aria-label={fav ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
        </button>

        {/* bottom info */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-white">{game.title}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-white/70">
            {game.playtime_minutes > 0 && <span className="tabular-nums">{formatPlaytime(game.playtime_minutes)}</span>}
            {hasAch && (
              <span className="tabular-nums" style={{ color: 'var(--color-gold)' }}>
                {game.achievements_unlocked}/{game.achievements_total} 🏆
              </span>
            )}
          </div>
        </div>
      </button>

      {/* status flag (only when meaningful) */}
      {game.status !== 'Library' && (
        <div className="pointer-events-none absolute left-2.5 bottom-2.5 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
          <StatusBadge status={game.status} />
        </div>
      )}
    </motion.div>
  );
}
