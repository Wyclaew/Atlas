import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Boxes,
  EyeOff,
  Heart,
  LayoutDashboard,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RefreshCw,
  Settings,
  Store,
  Trophy,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeStats, favoriteCount, hiddenCount } from '../../lib/select';
import { PLATFORM_META } from '../../lib/meta';
import { playSfx } from '../../lib/sfx';
import { useT } from '../../i18n';
import { Tooltip } from '../ui/Tooltip';
import type { NavId, PlatformKey } from '../../types';

type IconType = typeof Library;
interface Item {
  id: NavId;
  label: string;
  Icon: IconType;
  count?: number;
}

const SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const;

function NavRow({ item, collapsed }: { item: Item; collapsed: boolean }) {
  const active = useStore((s) => s.activeNav === item.id);
  const setNav = useStore((s) => s.setNav);
  const { Icon } = item;

  const row = (
    <button
      onClick={() => setNav(item.id)}
      onMouseEnter={() => playSfx('hover')}
      className={`group relative flex w-full cursor-pointer items-center rounded-xl transition-colors duration-150 ${
        collapsed ? 'h-11 justify-center' : 'gap-3 px-3 py-2.5'
      } ${active ? 'text-text' : 'text-dim hover:bg-white/[0.04] hover:text-text'}`}
    >
      {active && (
        <motion.span layoutId="navActive" className="absolute inset-0 rounded-xl bg-white/[0.06]" transition={SPRING} />
      )}
      {active && !collapsed && (
        <motion.span
          layoutId="navBar"
          className="absolute left-0 top-1/2 z-10 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
          transition={SPRING}
        />
      )}
      <Icon
        size={18}
        strokeWidth={2.1}
        className="relative z-10 shrink-0"
        style={active ? { color: 'var(--color-accent)' } : undefined}
      />
      {!collapsed && (
        <>
          <span className="relative z-10 flex-1 truncate text-left text-[13.5px] font-medium">{item.label}</span>
          {item.count !== undefined && item.count > 0 && (
            <span
              className={`relative z-10 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                active ? 'bg-white/10 text-text' : 'text-faint group-hover:text-dim'
              }`}
            >
              {item.count}
            </span>
          )}
        </>
      )}
    </button>
  );

  return collapsed ? <Tooltip label={`${item.label}${item.count ? ` · ${item.count}` : ''}`}>{row}</Tooltip> : row;
}

function Section({ title, items, collapsed }: { title?: string; items: Item[]; collapsed: boolean }) {
  return (
    <div className="px-3">
      {!collapsed && title && (
        <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">{title}</p>
      )}
      {collapsed && title && <div className="mx-auto mb-2 h-px w-7 bg-line" />}
      <div className="space-y-0.5">
        {items.map((it) => (
          <NavRow key={it.id} item={it} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const games = useStore((s) => s.games);
  const accounts = useStore((s) => s.accounts);
  const wishlist = useStore((s) => s.wishlist);
  const isSyncing = useStore((s) => s.isSyncing);
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const t = useT();

  const stats = useMemo(() => computeStats(games), [games]);
  const favs = useMemo(() => favoriteCount(games), [games]);
  const hidden = useMemo(() => hiddenCount(games), [games]);

  const platformItems: Item[] = (Object.keys(PLATFORM_META) as PlatformKey[])
    .filter((k) => (stats.byPlatform[k] ?? 0) > 0 || accounts.some((a) => a.platform_key === k))
    .map((k) => ({ id: k, label: PLATFORM_META[k].name, Icon: PLATFORM_META[k].Icon, count: stats.byPlatform[k] ?? 0 }));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
      className="relative z-10 flex h-screen shrink-0 flex-col border-r border-line bg-surface"
    >
      {/* Brand + collapse toggle */}
      <div className={`flex items-center py-5 ${collapsed ? 'flex-col gap-3' : 'gap-2.5 px-5'}`}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-black shadow-[0_0_24px_-4px_var(--color-accent)]">
          <Library size={18} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-none">
            <p className="font-display text-[17px] font-bold tracking-tight text-text">Atlas</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-faint">{t('brand.tagline')}</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          onMouseEnter={() => playSfx('hover')}
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-faint transition-colors hover:bg-white/[0.05] hover:text-text"
          aria-label={collapsed ? t('common.expand') : t('common.collapse')}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto py-2 no-scrollbar">
        <Section collapsed={collapsed} items={[{ id: 'dashboard', label: t('nav.dashboard'), Icon: LayoutDashboard }]} />
        <Section
          collapsed={collapsed}
          title={t('section.library')}
          items={[
            { id: 'all', label: t('nav.allGames'), Icon: Boxes, count: stats.total },
            { id: 'favorites', label: t('nav.favorites'), Icon: Heart, count: favs },
          ]}
        />
        <Section
          collapsed={collapsed}
          title={t('section.collections')}
          items={[
            { id: 'playing', label: t('nav.playing'), Icon: Play, count: stats.byStatus.Playing },
            { id: 'completed', label: t('nav.completed'), Icon: Trophy, count: stats.byStatus.Completed },
          ]}
        />
        <Section
          collapsed={collapsed}
          title={t('section.discover')}
          items={[
            { id: 'store', label: t('nav.store'), Icon: Store },
            { id: 'wishlist', label: t('nav.wishlist'), Icon: Bookmark, count: wishlist.length },
          ]}
        />
        {platformItems.length > 0 && <Section collapsed={collapsed} title={t('section.platforms')} items={platformItems} />}
        {hidden > 0 && (
          <Section collapsed={collapsed} items={[{ id: 'hidden', label: t('nav.hidden'), Icon: EyeOff, count: hidden }]} />
        )}
      </nav>

      <div className="border-t border-line p-3">
        {isSyncing && !collapsed && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <RefreshCw size={15} className="animate-spin text-accent" />
            <span className="text-[12px] font-medium text-dim">{t('common.syncing')}…</span>
          </div>
        )}
        <NavRow item={{ id: 'accounts', label: t('nav.settings'), Icon: Settings }} collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
