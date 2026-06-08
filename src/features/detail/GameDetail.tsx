import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  EyeOff,
  Heart,
  Play,
  Trophy,
  X,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CoverImage } from '../../components/ui/CoverImage';
import { PlatformBadge } from '../../components/ui/Badges';
import { Button } from '../../components/ui/Button';
import { AchievementList } from './AchievementList';
import { heroCandidates } from '../../lib/steamArt';
import { formatPlaytime, relativeTime } from '../../lib/format';
import { STATUS_META, STATUS_ORDER } from '../../lib/meta';
import type { Game } from '../../types';

function StatBox({ icon: Icon, label, value, tint }: { icon: typeof Clock; label: string; value: string; tint?: string }) {
  return (
    <div className="card-surface rounded-xl p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">
        <Icon size={12} style={tint ? { color: tint } : undefined} />
        {label}
      </div>
      <p className="text-[15px] font-bold tabular-nums text-text">{value}</p>
    </div>
  );
}

function StatusSelect({ game }: { game: Game }) {
  const setStatus = useStore((s) => s.setStatus);
  const toast = useStore((s) => s.toast);
  const [open, setOpen] = useState(false);
  const m = STATUS_META[game.status];
  const Icon = m.Icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2 px-4 py-3 transition-colors hover:border-line-strong"
      >
        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: m.color }}>
          <Icon size={15} />
          {m.label}
        </span>
        <ChevronDown size={15} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="glass absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-xl p-1.5 shadow-2xl shadow-black/60"
          >
            {STATUS_ORDER.map((st) => {
              const sm = STATUS_META[st];
              const SI = sm.Icon;
              return (
                <button
                  key={st}
                  onMouseDown={() => {
                    void setStatus(game.id, st);
                    toast(`Marked as ${sm.label}`, 'success');
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.05]"
                >
                  <span className="flex items-center gap-2" style={{ color: sm.color }}>
                    <SI size={14} />
                    {sm.label}
                  </span>
                  {game.status === st && <Check size={14} className="text-accent" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GameDetail() {
  const detailOpen = useStore((s) => s.detailOpen);
  const game = useStore((s) => s.games.find((g) => g.id === s.selectedGameId) ?? null);
  const closeDetail = useStore((s) => s.closeDetail);
  const ensureAchievements = useStore((s) => s.ensureAchievements);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const hideGame = useStore((s) => s.hideGame);
  const launch = useStore((s) => s.launch);
  const install = useStore((s) => s.install);
  const openStore = useStore((s) => s.openStore);

  const [accent, setAccent] = useState('var(--color-accent)');
  const heroes = useMemo(() => (game ? heroCandidates(game) : []), [game?.platform_key, game?.external_id]);
  const gameId = game?.id;

  useEffect(() => {
    setAccent(game?.accent_color ?? 'var(--color-accent)');
    if (detailOpen && game) void ensureAchievements(game);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailOpen, gameId]);

  // Close on Escape
  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDetail();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailOpen, closeDetail]);

  const isSteam = game?.platform_key === 'steam';

  return (
    <AnimatePresence>
      {detailOpen && game && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px]"
          />
          <motion.aside
            style={{ '--g': accent } as CSSProperties}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-[560px] max-w-full flex-col border-l border-line bg-surface"
          >
            {/* Header art */}
            <div className="relative h-60 shrink-0">
              <CoverImage candidates={heroes} alt={game.title} className="absolute inset-0 h-full w-full" onAccent={setAccent} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-black/30" />
              <button
                onClick={closeDetail}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg bg-black/50 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Close"
              >
                <X size={17} />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <PlatformBadge platform={game.platform_key} />
                <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-tight text-white">
                  {game.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="game" icon={Play} onClick={() => void launch(game)}>
                  Play
                </Button>
                {isSteam && (
                  <Button variant="soft" icon={Download} onClick={() => void install(game)}>
                    Install
                  </Button>
                )}
                <Button variant="ghost" icon={ExternalLink} onClick={() => void openStore(game)}>
                  Store
                </Button>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => void toggleFavorite(game.id)}
                    className={`grid h-11 w-11 place-items-center rounded-xl border border-line transition-colors ${
                      game.is_favorite ? 'text-rose-400' : 'text-faint hover:text-text'
                    }`}
                    aria-label="Favorite"
                  >
                    <Heart size={17} fill={game.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => void hideGame(game.id)}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-line text-faint transition-colors hover:text-text"
                    aria-label="Hide"
                  >
                    <EyeOff size={17} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatBox icon={Clock} label="Playtime" value={formatPlaytime(game.playtime_minutes)} tint="var(--color-st-playing)" />
                <StatBox icon={CalendarDays} label="Last played" value={relativeTime(game.last_played_at)} />
                <StatBox
                  icon={Trophy}
                  label="Achievements"
                  value={game.achievements_total > 0 ? `${game.achievements_unlocked}/${game.achievements_total}` : '—'}
                  tint="var(--color-gold)"
                />
                <StatBox icon={Clock} label="Last 2 weeks" value={formatPlaytime(game.playtime_2weeks_minutes)} />
              </div>

              <div>
                <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Status</p>
                <StatusSelect game={game} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Achievements</p>
                  {game.achievements_total > 0 && (
                    <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--color-gold)' }}>
                      {Math.round((game.achievements_unlocked / game.achievements_total) * 100)}% complete
                    </span>
                  )}
                </div>
                <AchievementList gameId={game.id} />
              </div>

              <div className="border-t border-line pt-4 text-[11px] text-faint">
                <span className="font-medium text-dim">
                  {game.platform_key === 'steam' ? 'App ID' : 'ID'}: {game.external_id}
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
