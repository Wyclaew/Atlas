import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  Gamepad2,
  Heart,
  LayoutDashboard,
  Library,
  Play,
  RefreshCw,
  Settings,
  Trophy,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeStats, favoriteCount } from '../../lib/select';
import { PLATFORM_META } from '../../lib/meta';
import type { NavId, PlatformKey } from '../../types';

type IconType = typeof Library;
interface Item {
  id: NavId;
  label: string;
  Icon: IconType;
  count?: number;
  color?: string;
}

function NavRow({ item }: { item: Item }) {
  const active = useStore((s) => s.activeNav === item.id);
  const setNav = useStore((s) => s.setNav);
  const { Icon } = item;

  return (
    <button
      onClick={() => setNav(item.id)}
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
        active ? 'text-text' : 'text-dim hover:bg-white/[0.04] hover:text-text'
      }`}
    >
      {active && (
        <motion.span
          layoutId="navActive"
          className="absolute inset-0 -z-0 rounded-lg bg-white/[0.06]"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      {active && (
        <motion.span
          layoutId="navBar"
          className="absolute left-0 top-1/2 z-10 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      <Icon
        size={18}
        strokeWidth={2.1}
        className="relative z-10 shrink-0"
        style={item.color && active ? { color: item.color } : undefined}
      />
      <span className="relative z-10 flex-1 truncate text-[13.5px] font-medium tracking-tight">
        {item.label}
      </span>
      {item.count !== undefined && item.count > 0 && (
        <span
          className={`relative z-10 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
            active ? 'bg-white/10 text-text' : 'text-faint group-hover:text-dim'
          }`}
        >
          {item.count}
        </span>
      )}
    </button>
  );
}

function Section({ title, items }: { title?: string; items: Item[] }) {
  return (
    <div className="px-3">
      {title && (
        <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((it) => (
          <NavRow key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const games = useStore((s) => s.games);
  const accounts = useStore((s) => s.accounts);
  const isSyncing = useStore((s) => s.isSyncing);

  const stats = useMemo(() => computeStats(games), [games]);
  const favs = useMemo(() => favoriteCount(games), [games]);

  const platformItems: Item[] = (Object.keys(PLATFORM_META) as PlatformKey[])
    .filter((k) => (stats.byPlatform[k] ?? 0) > 0 || accounts.some((a) => a.platform_key === k))
    .map((k) => ({
      id: k,
      label: PLATFORM_META[k].name,
      Icon: PLATFORM_META[k].Icon,
      count: stats.byPlatform[k] ?? 0,
      color: PLATFORM_META[k].color,
    }));

  return (
    <aside className="flex h-screen w-[256px] shrink-0 flex-col border-r border-line bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-black shadow-[0_0_24px_-4px_var(--color-accent)]">
          <Library size={18} strokeWidth={2.5} />
        </div>
        <div className="leading-none">
          <p className="font-display text-[17px] font-bold tracking-tight text-text">Atlas</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-faint">
            Game Library
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto py-2 no-scrollbar">
        <Section
          items={[{ id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard }]}
        />
        <Section
          title="Library"
          items={[
            { id: 'all', label: 'All Games', Icon: Boxes, count: stats.total },
            { id: 'favorites', label: 'Favorites', Icon: Heart, count: favs },
          ]}
        />
        <Section
          title="Collections"
          items={[
            { id: 'playing', label: 'Playing', Icon: Play, count: stats.byStatus.Playing },
            { id: 'completed', label: 'Completed', Icon: Trophy, count: stats.byStatus.Completed },
            { id: 'wishlist', label: 'Wishlist', Icon: Heart, count: stats.byStatus.Wishlist },
          ]}
        />
        {platformItems.length > 0 && <Section title="Platforms" items={platformItems} />}
      </nav>

      {/* Footer */}
      <div className="border-t border-line p-3">
        {isSyncing && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <RefreshCw size={15} className="animate-spin text-accent" />
            <span className="text-[12px] font-medium text-dim">Syncing…</span>
          </div>
        )}
        <NavRow item={{ id: 'accounts', label: 'Accounts & Settings', Icon: Settings }} />
        {games.length === 0 && accounts.length === 0 && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1 text-[11px] text-faint">
            <Gamepad2 size={13} /> No platforms connected
          </div>
        )}
      </div>
    </aside>
  );
}
