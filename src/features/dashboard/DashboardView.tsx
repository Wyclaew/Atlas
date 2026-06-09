import { useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Boxes, Clock, HardDriveDownload, Plug, Trophy } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeStats } from '../../lib/select';
import { formatNumber } from '../../lib/format';
import { coverCandidates } from '../../lib/steamArt';
import { CoverImage } from '../../components/ui/CoverImage';
import { Button } from '../../components/ui/Button';
import { useT } from '../../i18n';
import { Hero } from './Hero';
import type { Game } from '../../types';

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
  delay,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  tint: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-surface rounded-xl p-4"
    >
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `color-mix(in srgb, ${tint} 16%, transparent)`, color: tint }}>
        <Icon size={17} />
      </div>
      <p className="font-display text-2xl font-bold tracking-tight text-text tabular-nums">{value}</p>
      <p className="mt-0.5 text-[12px] font-medium text-faint">{label}</p>
    </motion.div>
  );
}

function Rail({ title, games }: { title: string; games: Game[] }) {
  const openGame = useStore((s) => s.openGame);
  if (games.length === 0) return null;
  return (
    <section>
      <h3 className="mb-3 font-display text-[15px] font-semibold tracking-tight text-text">{title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => openGame(g.id)}
            className="ring-game group w-[124px] shrink-0 overflow-hidden rounded-lg bg-surface-2"
            style={{ '--g': g.accent_color ?? 'var(--color-accent)' } as CSSProperties}
          >
            <CoverImage candidates={coverCandidates(g)} alt={g.title} className="aspect-[2/3] w-full" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function DashboardView() {
  const games = useStore((s) => s.games);
  const setNav = useStore((s) => s.setNav);
  const t = useT();
  const stats = useMemo(() => computeStats(games), [games]);

  const played = useMemo(
    () => games.filter((g) => g.last_played_at).sort((a, b) => Date.parse(b.last_played_at!) - Date.parse(a.last_played_at!)),
    [games]
  );
  const topPlayed = useMemo(
    () => [...games].sort((a, b) => b.playtime_minutes - a.playtime_minutes).slice(0, 12),
    [games]
  );

  if (games.length === 0) {
    return (
      <div className="dot-grid grid h-full place-items-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-md flex-col items-center text-center"
        >
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-black shadow-[0_0_40px_-6px_var(--color-accent)]">
            <Boxes size={28} strokeWidth={2.2} />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-text">{t('dash.welcomeTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-dim">{t('dash.welcomeBody')}</p>
          <Button variant="primary" icon={Plug} className="mt-6" onClick={() => setNav('accounts')}>
            {t('lib.connect')}
          </Button>
        </motion.div>
      </div>
    );
  }

  const hero = played[0] ?? topPlayed[0] ?? games[0];

  return (
    <div className="h-full space-y-8 overflow-y-auto px-8 py-7">
      <Hero game={hero} played={!!played[0]} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Boxes} label={t('dash.statGames')} value={formatNumber(stats.total)} tint="var(--color-accent)" delay={0.05} />
        <StatTile icon={Clock} label={t('dash.statHours')} value={formatNumber(stats.totalHours)} tint="var(--color-st-playing)" delay={0.1} />
        <StatTile icon={Trophy} label={t('dash.statAchievements')} value={formatNumber(stats.achievementsUnlocked)} tint="var(--color-gold)" delay={0.15} />
        <StatTile icon={HardDriveDownload} label={t('dash.statInstalled')} value={formatNumber(stats.installed)} tint="var(--color-st-wishlist)" delay={0.2} />
      </div>

      <Rail title={t('dash.jumpBackIn')} games={played.slice(0, 12)} />
      <Rail title={t('dash.mostPlayed')} games={topPlayed} />
    </div>
  );
}
