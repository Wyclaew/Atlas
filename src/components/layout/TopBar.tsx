import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Check, LayoutGrid, List, RefreshCw, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { filterAndSort } from '../../lib/select';
import { navTitleKey, navToView } from '../../lib/nav';
import { PLATFORM_META } from '../../lib/meta';
import { playSfx } from '../../lib/sfx';
import { useT } from '../../i18n';
import type { TKey } from '../../i18n/locales';
import type { NavId, PlatformKey, SortField } from '../../types';

const SORTS: { id: SortField; key: TKey }[] = [
  { id: 'recent', key: 'sort.recent' },
  { id: 'title', key: 'sort.title' },
  { id: 'playtime', key: 'sort.playtime' },
  { id: 'achievements', key: 'sort.achievements' },
];

const PLATFORM_NAVS = new Set<NavId>(['steam', 'epic', 'gog', 'xbox']);

export function TopBar() {
  const activeNav = useStore((s) => s.activeNav);
  const games = useStore((s) => s.games);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const sort = useStore((s) => s.sort);
  const setSort = useStore((s) => s.setSort);
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const syncAll = useStore((s) => s.syncAll);
  const isSyncing = useStore((s) => s.isSyncing);
  const accounts = useStore((s) => s.accounts);
  const t = useT();

  const [sortOpen, setSortOpen] = useState(false);
  const isLibrary = navToView(activeNav) === 'library';

  const title = PLATFORM_NAVS.has(activeNav)
    ? PLATFORM_META[activeNav as PlatformKey].name
    : t(navTitleKey(activeNav));

  const count = useMemo(
    () => (isLibrary ? filterAndSort(games, activeNav, search, sort).length : 0),
    [games, activeNav, search, sort, isLibrary]
  );

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-4 border-b border-line bg-bg/85 px-6 backdrop-blur-md md:px-8">
      <div className="flex min-w-0 shrink items-baseline gap-3">
        <h1 className="truncate font-display text-[22px] font-bold tracking-tight text-text">{title}</h1>
        {isLibrary && (
          <span className="shrink-0 text-[13px] font-medium tabular-nums text-faint">
            {count} {t('common.games')}
          </span>
        )}
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        {isLibrary && (
          <>
            <div className="relative min-w-0 flex-1 sm:max-w-[260px]">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="h-10 w-full min-w-0 rounded-xl border border-line bg-surface-2 pl-10 pr-3.5 text-sm text-text placeholder:text-faint transition-colors duration-200 focus:border-line-strong focus:outline-none"
              />
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => {
                  playSfx('tap');
                  setSortOpen((o) => !o);
                }}
                onBlur={() => setTimeout(() => setSortOpen(false), 150)}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 text-[13px] font-medium text-dim transition-colors hover:text-text"
              >
                <ArrowUpDown size={15} />
                <span className="hidden lg:inline">{t(SORTS.find((s) => s.id === sort)!.key)}</span>
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="glass absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-xl p-1.5 shadow-2xl shadow-black/60"
                  >
                    {SORTS.map((s) => (
                      <button
                        key={s.id}
                        onMouseDown={() => {
                          playSfx('tap');
                          setSort(s.id);
                          setSortOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                          sort === s.id ? 'bg-white/[0.06] text-text' : 'text-dim hover:bg-white/[0.04] hover:text-text'
                        }`}
                      >
                        {t(s.key)}
                        {sort === s.id && <Check size={14} className="text-accent" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-line bg-surface-2 p-1">
              {([
                ['grid', LayoutGrid],
                ['list', List],
              ] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => {
                    playSfx('tap');
                    setViewMode(mode);
                  }}
                  className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg transition-colors ${
                    viewMode === mode ? 'bg-white/[0.08] text-text' : 'text-faint hover:text-dim'
                  }`}
                  aria-label={`${mode} view`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </>
        )}

        {accounts.length > 0 && (
          <button
            onClick={() => void syncAll()}
            disabled={isSyncing}
            className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 text-[13px] font-medium text-text transition-colors hover:border-line-strong disabled:opacity-50"
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin text-accent' : ''} />
            <span className="hidden sm:inline">{isSyncing ? t('common.syncing') : t('common.sync')}</span>
          </button>
        )}
      </div>
    </header>
  );
}
