import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { CoverImage } from '../../components/ui/CoverImage';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badges';
import { useStore } from '../../store/useStore';
import { coverCandidates } from '../../lib/steamArt';
import { formatPlaytime, relativeTime } from '../../lib/format';
import type { Game } from '../../types';

export function GameListRow({ game }: { game: Game }) {
  const openGame = useStore((s) => s.openGame);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const covers = useMemo(() => coverCandidates(game), [game.platform_key, game.external_id, game.cover_url]);

  return (
    <button
      onClick={() => openGame(game.id)}
      className="group flex w-full items-center gap-4 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface-2"
    >
      <CoverImage candidates={covers} alt={game.title} className="h-14 w-10 shrink-0" rounded="rounded-md" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{game.title}</p>
        <div className="mt-1 flex items-center gap-3">
          <PlatformBadge platform={game.platform_key} />
          <span className="text-[11px] text-faint">{relativeTime(game.last_played_at)}</span>
        </div>
      </div>

      {game.achievements_total > 0 && (
        <span className="hidden text-[12px] font-medium tabular-nums sm:block" style={{ color: 'var(--color-gold)' }}>
          {game.achievements_unlocked}/{game.achievements_total}
        </span>
      )}

      <span className="w-16 text-right text-[13px] font-medium tabular-nums text-dim">
        {formatPlaytime(game.playtime_minutes)}
      </span>

      <div className="w-24 text-right">
        <StatusBadge status={game.status} />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          void toggleFavorite(game.id);
        }}
        className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
          game.is_favorite ? 'text-rose-400' : 'text-faint opacity-0 hover:text-text group-hover:opacity-100'
        }`}
        aria-label="Toggle favorite"
      >
        <Heart size={15} fill={game.is_favorite ? 'currentColor' : 'none'} />
      </button>
    </button>
  );
}
