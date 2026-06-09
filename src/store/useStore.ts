// Global app state. Talks to the Rust backend (api) and the local cache (db),
// and exposes everything the UI needs. User intent is applied optimistically.

import { create } from 'zustand';
import type {
  Account,
  Achievement,
  AccountInfo,
  Game,
  GameStatus,
  Locale,
  NavId,
  Platform,
  PlatformKey,
  SortField,
  Toast,
  ViewMode,
  WishlistItem,
} from '../types';
import * as db from '../lib/db';
import { api, errorMessage } from '../lib/tauri';
import { getSoundPrefs, playSfx, setSoundEnabled as sfxEnabled, setSoundVolume as sfxVolume } from '../lib/sfx';
import { isTauri } from '../lib/env';
import { dicts } from '../i18n/locales';

const LOCALE_KEY = 'atlas.locale';
const REGION_KEY = 'atlas.region';

function readLocale(): Locale {
  try {
    const s = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (s && s in dicts) return s;
  } catch {
    /* ignore */
  }
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').slice(0, 2).toLowerCase();
  return (lang in dicts ? lang : 'en') as Locale;
}

function readRegion(): string {
  try {
    const s = localStorage.getItem(REGION_KEY);
    if (s) return s;
  } catch {
    /* ignore */
  }
  const region = (typeof navigator !== 'undefined' ? navigator.language : 'en-US').split('-')[1];
  return (region ?? 'us').toLowerCase();
}

const SIDEBAR_KEY = 'atlas.sidebar.collapsed';
const readSidebar = (): boolean => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
};

interface StoreState {
  platforms: Platform[];
  accounts: Account[];
  games: Game[];

  isLoading: boolean;
  isSyncing: boolean;
  syncMessage: string;

  activeNav: NavId;
  search: string;
  sort: SortField;
  viewMode: ViewMode;

  selectedGameId: number | null;
  detailOpen: boolean;

  achievements: Record<number, Achievement[]>;
  achievementsLoading: boolean;

  toasts: Toast[];

  // preferences
  sidebarCollapsed: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  locale: Locale;
  region: string;
  itadKey: string;
  toggleSidebar: () => void;
  setSoundEnabled: (v: boolean) => void;
  setSoundVolume: (v: number) => void;
  setLocale: (l: Locale) => void;
  setRegion: (cc: string) => void;
  setItadKey: (k: string) => Promise<void>;

  // installs + hidden
  scanInstalls: () => Promise<void>;
  unhideGame: (id: number) => Promise<void>;

  // wishlist (un-owned games)
  wishlist: WishlistItem[];
  refreshWishlist: () => Promise<void>;
  addWishlist: (item: { platform_key: PlatformKey; external_id: string; title: string; cover_url: string | null; store_url: string | null }) => Promise<void>;
  removeWishlist: (platformKey: PlatformKey, externalId: string) => Promise<void>;
  isWishlisted: (platformKey: PlatformKey, externalId: string) => boolean;

  // lifecycle
  init: () => Promise<void>;
  refreshGames: () => Promise<void>;
  refreshAccounts: () => Promise<void>;

  // platform
  connectSteam: (apiKey: string, steamInput: string) => Promise<AccountInfo>;
  syncSteam: () => Promise<void>;
  syncAll: () => Promise<void>;
  disconnect: (platformKey: Platform['key']) => Promise<void>;

  // navigation / filtering
  setNav: (nav: NavId) => void;
  setSearch: (s: string) => void;
  setSort: (field: SortField) => void;
  setViewMode: (m: ViewMode) => void;

  // detail
  openGame: (id: number) => void;
  closeDetail: () => void;
  selectedGame: () => Game | null;
  ensureAchievements: (game: Game) => Promise<void>;

  // mutations
  setStatus: (id: number, status: GameStatus) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  hideGame: (id: number) => Promise<void>;
  setAccent: (id: number, color: string) => void;

  // launch
  launch: (game: Game) => Promise<void>;
  install: (game: Game) => Promise<void>;
  openStore: (game: Game) => Promise<void>;

  // toasts
  toast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  platforms: [],
  accounts: [],
  games: [],
  isLoading: false,
  isSyncing: false,
  syncMessage: '',
  activeNav: 'dashboard',
  search: '',
  sort: 'recent',
  viewMode: 'grid',
  selectedGameId: null,
  detailOpen: false,
  achievements: {},
  achievementsLoading: false,
  toasts: [],

  sidebarCollapsed: readSidebar(),
  soundEnabled: getSoundPrefs().enabled,
  soundVolume: getSoundPrefs().volume,
  locale: readLocale(),
  region: readRegion(),
  itadKey: '',
  wishlist: [],

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
    playSfx('toggle');
    set({ sidebarCollapsed: next });
  },

  setSoundEnabled: (v) => {
    sfxEnabled(v);
    set({ soundEnabled: v });
  },

  setSoundVolume: (v) => {
    sfxVolume(v);
    set({ soundVolume: v });
  },

  setLocale: (l) => {
    try {
      localStorage.setItem(LOCALE_KEY, l);
    } catch {
      /* ignore */
    }
    set({ locale: l });
  },

  setRegion: (cc) => {
    const region = cc.toLowerCase();
    try {
      localStorage.setItem(REGION_KEY, region);
    } catch {
      /* ignore */
    }
    set({ region });
  },

  setItadKey: async (k) => {
    const key = k.trim();
    await db.setSetting('itad_key', key);
    set({ itadKey: key });
  },

  scanInstalls: async () => {
    if (!isTauri()) return;
    try {
      const paths = await api.detectPlatformPaths();
      const steamPath = paths.steam_path ?? (await db.getSetting('steam_path'));
      if (!steamPath) return;
      const installed = await api.scanSteamInstalls(steamPath);
      await db.markSteamInstalled(installed);
      await get().refreshGames();
    } catch {
      /* install scan is best-effort */
    }
  },

  unhideGame: async (id) => {
    await db.setUserField(id, 'is_hidden', 0);
    set((s) => ({ games: s.games.map((g) => (g.id === id ? { ...g, is_hidden: 0 } : g)) }));
  },

  refreshWishlist: async () => set({ wishlist: await db.loadWishlist() }),

  addWishlist: async (item) => {
    if (get().isWishlisted(item.platform_key, item.external_id)) return;
    await db.addToWishlist(item);
    await get().refreshWishlist();
    playSfx('success');
    get().toast(`Added “${item.title}” to wishlist`, 'success');
  },

  removeWishlist: async (platformKey, externalId) => {
    await db.removeFromWishlist(platformKey, externalId);
    await get().refreshWishlist();
  },

  isWishlisted: (platformKey, externalId) =>
    get().wishlist.some((w) => w.platform_key === platformKey && w.external_id === externalId),

  init: async () => {
    // Dev-only: seed sample data when running in a plain browser (design QA).
    if (import.meta.env.DEV && !isTauri()) {
      const m = await import('../lib/devMock');
      set({
        platforms: m.mockPlatforms(),
        accounts: m.mockAccounts(),
        games: m.mockGames(),
        wishlist: m.mockWishlist?.() ?? [],
        isLoading: false,
      });
      return;
    }
    set({ isLoading: true });
    try {
      const [platforms, accounts, games, wishlist, itadKey] = await Promise.all([
        db.loadPlatforms(),
        db.loadAccounts(),
        db.loadGames(),
        db.loadWishlist(),
        db.getSetting('itad_key'),
      ]);
      set({ platforms, accounts, games, wishlist, itadKey: itadKey ?? '', isLoading: false });
      void get().scanInstalls();
    } catch (e) {
      set({ isLoading: false });
      get().toast(errorMessage(e), 'error');
    }
  },

  refreshGames: async () => set({ games: await db.loadGames() }),
  refreshAccounts: async () => set({ accounts: await db.loadAccounts() }),

  connectSteam: async (apiKey, steamInput) => {
    const info = await api.connectSteam(apiKey.trim(), steamInput.trim());
    await db.upsertAccount('steam', info.label, info.external_id, { apiKey: apiKey.trim() });
    await get().refreshAccounts();
    get().toast(`Connected as ${info.label}`, 'success');
    return info;
  },

  syncSteam: async () => {
    const creds = await db.getSteamCredentials();
    if (!creds) {
      get().toast('Connect a Steam account first.', 'error');
      return;
    }
    set({ isSyncing: true, syncMessage: 'Fetching your Steam library…' });
    try {
      const games = await api.syncSteamLibrary(creds.apiKey, creds.steamId);
      set({ syncMessage: `Saving ${games.length} games…` });
      await db.upsertGames(games, 'steam');
      await db.markAccountSynced('steam');
      await get().refreshGames();
      await get().refreshAccounts();
      await get().scanInstalls();
      get().toast(`Synced ${games.length} games from Steam.`, 'success');
    } catch (e) {
      get().toast(errorMessage(e), 'error');
    } finally {
      set({ isSyncing: false, syncMessage: '' });
    }
  },

  syncAll: async () => {
    const hasSteam = get().accounts.some((a) => a.platform_key === 'steam');
    if (hasSteam) await get().syncSteam();
  },

  disconnect: async (platformKey) => {
    await db.disconnectPlatform(platformKey);
    await Promise.all([get().refreshAccounts(), get().refreshGames()]);
    get().toast('Disconnected and removed cached games.', 'info');
  },

  setNav: (nav) => {
    if (get().activeNav !== nav) playSfx('nav');
    set({ activeNav: nav, detailOpen: false });
  },
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  setViewMode: (viewMode) => set({ viewMode }),

  openGame: (id) => set({ selectedGameId: id, detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  selectedGame: () => {
    const { games, selectedGameId } = get();
    return games.find((g) => g.id === selectedGameId) ?? null;
  },

  ensureAchievements: async (game) => {
    const cached = await db.loadAchievements(game.id);
    if (cached.length) {
      set((s) => ({ achievements: { ...s.achievements, [game.id]: cached } }));
    }
    if (game.platform_key !== 'steam') return;
    const creds = await db.getSteamCredentials();
    if (!creds) return;

    set({ achievementsLoading: !cached.length });
    try {
      const res = await api.fetchSteamAchievements(creds.apiKey, creds.steamId, game.external_id);
      if (res.total > 0) {
        await db.saveAchievements(game.id, res.unlocked, res.total, res.items);
        const fresh = await db.loadAchievements(game.id);
        set((s) => ({
          achievements: { ...s.achievements, [game.id]: fresh },
          games: s.games.map((g) =>
            g.id === game.id
              ? { ...g, achievements_unlocked: res.unlocked, achievements_total: res.total }
              : g
          ),
        }));
      } else if (!cached.length) {
        set((s) => ({ achievements: { ...s.achievements, [game.id]: [] } }));
      }
    } catch {
      // Achievements are best-effort; ignore failures silently.
    } finally {
      set({ achievementsLoading: false });
    }
  },

  setStatus: async (id, status) => {
    await db.setUserField(id, 'status', status);
    set((s) => ({ games: s.games.map((g) => (g.id === id ? { ...g, status } : g)) }));
  },

  toggleFavorite: async (id) => {
    const game = get().games.find((g) => g.id === id);
    if (!game) return;
    const next = game.is_favorite ? 0 : 1;
    await db.setUserField(id, 'is_favorite', next);
    set((s) => ({ games: s.games.map((g) => (g.id === id ? { ...g, is_favorite: next } : g)) }));
  },

  hideGame: async (id) => {
    await db.setUserField(id, 'is_hidden', 1);
    set((s) => ({
      games: s.games.filter((g) => g.id !== id),
      detailOpen: s.selectedGameId === id ? false : s.detailOpen,
    }));
    get().toast('Game hidden from your library.', 'info');
  },

  setAccent: (id, color) => {
    const game = get().games.find((g) => g.id === id);
    if (!game || game.accent_color === color) return;
    void db.setAccentColor(id, color);
    set((s) => ({ games: s.games.map((g) => (g.id === id ? { ...g, accent_color: color } : g)) }));
  },

  launch: async (game) => {
    try {
      await api.launchGame(game.platform_key, game.external_id);
      playSfx('launch');
      get().toast(`Launching ${game.title}…`, 'success');
    } catch (e) {
      get().toast(errorMessage(e), 'error');
    }
  },

  install: async (game) => {
    try {
      await api.installGame(game.platform_key, game.external_id);
      get().toast(`Opening Steam to install ${game.title}…`, 'info');
    } catch (e) {
      get().toast(errorMessage(e), 'error');
    }
  },

  openStore: async (game) => {
    try {
      await api.openStorePage(game.platform_key, game.external_id);
    } catch (e) {
      get().toast(errorMessage(e), 'error');
    }
  },

  toast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    if (type === 'success') playSfx('success');
    else if (type === 'error') playSfx('error');
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), 4200);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
