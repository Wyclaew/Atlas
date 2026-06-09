import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Boxes,
  Bookmark,
  CornerDownLeft,
  Gamepad2,
  Heart,
  LayoutDashboard,
  PanelLeft,
  Play,
  RefreshCw,
  Search,
  Settings,
  Store,
  Trophy,
  Volume2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { playSfx } from '../lib/sfx';
import { useT } from '../i18n';
import { coverCandidates } from '../lib/steamArt';
import { CoverImage } from './ui/CoverImage';
import type { NavId } from '../types';

interface Cmd {
  id: string;
  group: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  run: () => void;
  cover?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const games = useStore((s) => s.games);
  const setNav = useStore((s) => s.setNav);
  const openGame = useStore((s) => s.openGame);
  const syncAll = useStore((s) => s.syncAll);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setSoundEnabled = useStore((s) => s.setSoundEnabled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const t = useT();

  // Global hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSel(0);
      playSfx('tap');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const close = () => setOpen(false);
  const go = (nav: NavId) => {
    setNav(nav);
    close();
  };

  const commands = useMemo<Cmd[]>(() => {
    const nav = (id: NavId, label: string, icon: ComponentType<{ size?: number }>): Cmd => ({
      id: `nav-${id}`,
      group: t('palette.navigate'),
      label,
      icon,
      run: () => go(id),
    });
    return [
      nav('dashboard', t('nav.dashboard'), LayoutDashboard),
      nav('all', t('nav.allGames'), Boxes),
      nav('favorites', t('nav.favorites'), Heart),
      nav('playing', t('nav.playing'), Play),
      nav('completed', t('nav.completed'), Trophy),
      nav('store', t('nav.store'), Store),
      nav('wishlist', t('nav.wishlist'), Bookmark),
      nav('accounts', t('nav.settings'), Settings),
      { id: 'act-sync', group: t('palette.actions'), label: t('common.sync'), icon: RefreshCw, run: () => { void syncAll(); close(); } },
      { id: 'act-sidebar', group: t('palette.actions'), label: t('palette.toggleSidebar'), icon: PanelLeft, run: () => { toggleSidebar(); close(); } },
      { id: 'act-sound', group: t('palette.actions'), label: t('palette.toggleSound'), icon: Volume2, run: () => { setSoundEnabled(!soundEnabled); close(); } },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, soundEnabled]);

  const q = query.trim().toLowerCase();
  const gameCmds = useMemo<Cmd[]>(() => {
    if (!q) return [];
    return games
      .filter((g) => !g.is_hidden && g.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((g) => ({
        id: `game-${g.id}`,
        group: t('palette.games'),
        label: g.title,
        icon: Gamepad2,
        cover: coverCandidates(g),
        run: () => {
          openGame(g.id);
          close();
        },
      }));
  }, [q, games, t]);

  const filtered = useMemo(() => {
    const base = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
    return [...base, ...gameCmds];
  }, [q, commands, gameCmds]);

  useEffect(() => setSel(0), [q]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[sel]?.run();
    }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[3px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="glass fixed left-1/2 top-[14vh] z-[101] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onListKey}
                placeholder={t('palette.placeholder')}
                className="h-14 flex-1 bg-transparent text-[15px] text-text placeholder:text-faint focus:outline-none"
              />
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[11px] text-faint sm:block">ESC</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-faint">{t('lib.noMatchTitle')}</p>}
              {filtered.map((c, i) => {
                const showGroup = c.group !== lastGroup;
                lastGroup = c.group;
                const Icon = c.icon;
                return (
                  <div key={c.id}>
                    {showGroup && (
                      <p className="px-3 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                        {c.group}
                      </p>
                    )}
                    <button
                      onMouseEnter={() => setSel(i)}
                      onClick={c.run}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        i === sel ? 'bg-white/[0.07] text-text' : 'text-dim'
                      }`}
                    >
                      {c.cover ? (
                        <CoverImage candidates={c.cover} alt="" className="h-8 w-6 shrink-0" rounded="rounded" />
                      ) : (
                        <Icon size={16} />
                      )}
                      <span className="flex-1 truncate text-[13.5px] font-medium">{c.label}</span>
                      {i === sel && <CornerDownLeft size={14} className="text-faint" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
