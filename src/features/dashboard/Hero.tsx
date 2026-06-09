import { useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Download, Info, Play, Sparkles } from 'lucide-react';
import { CoverImage } from '../../components/ui/CoverImage';
import { PlatformBadge } from '../../components/ui/Badges';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { heroCandidates } from '../../lib/steamArt';
import { formatPlaytime, relativeTime } from '../../lib/format';
import { useT } from '../../i18n';
import type { Game } from '../../types';

export function Hero({ game, played }: { game: Game; played: boolean }) {
  const launch = useStore((s) => s.launch);
  const install = useStore((s) => s.install);
  const openGame = useStore((s) => s.openGame);
  const t = useT();
  const [accent, setAccent] = useState(game.accent_color ?? 'var(--color-accent)');
  const heroes = useMemo(() => heroCandidates(game), [game.platform_key, game.external_id]);

  const achPct =
    game.achievements_total > 0
      ? Math.round((game.achievements_unlocked / game.achievements_total) * 100)
      : 0;

  return (
    <motion.section
      style={{ '--g': accent } as CSSProperties}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-line"
    >
      <CoverImage candidates={heroes} alt={game.title} className="absolute inset-0 h-full w-full" onAccent={setAccent} />
      {/* tints */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full opacity-40 blur-[90px]"
        style={{ background: 'var(--g)' }}
      />

      <div className="relative flex min-h-[340px] flex-col justify-end gap-5 p-8">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--g)' }}>
          <Sparkles size={14} />
          {played ? t('dash.jumpBackIn') : t('dash.fromLibrary')}
        </div>

        <div>
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white">
            {game.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            <PlatformBadge platform={game.platform_key} />
            {game.playtime_minutes > 0 && <span className="tabular-nums">{formatPlaytime(game.playtime_minutes)}</span>}
            <span>
              {t('detail.lastPlayed')} {relativeTime(game.last_played_at)}
            </span>
          </div>
        </div>

        {game.achievements_total > 0 && (
          <div className="max-w-md">
            <div className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-white/70">
              <span>{t('detail.achievements')}</span>
              <span className="tabular-nums" style={{ color: 'var(--color-gold)' }}>
                {game.achievements_unlocked}/{game.achievements_total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full" style={{ width: `${achPct}%`, background: 'var(--color-gold)' }} />
            </div>
          </div>
        )}

        <div className="mt-1 flex items-center gap-3">
          {game.is_installed ? (
            <Button variant="game" size="lg" icon={Play} onClick={() => void launch(game)}>
              {t('common.play')}
            </Button>
          ) : (
            <Button variant="game" size="lg" icon={Download} onClick={() => void install(game)}>
              {t('common.install')}
            </Button>
          )}
          <Button variant="soft" size="lg" icon={Info} onClick={() => openGame(game.id)}>
            {t('common.details')}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
