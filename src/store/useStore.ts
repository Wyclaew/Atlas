// Global app state. Talks to the Rust backend (api) and the local cache (db),
// and exposes everything the UI needs. User intent is applied optimistically.

import { create } from 'zustand';
import type {
  Account,
  Achievement,
  AccountInfo,
  Game,
  GameStatus,
  NavId,
  Platform,
  SortField,
  Toast,
  ViewMode,
} from '../types';
import * as db from '../lib/db';
import { api, errorMessage } from '../lib/tauri';

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

  init: async () => {
    set({ isLoading: true });
    try {
      const [platforms, accounts, games] = await Promise.all([
        db.loadPlatforms(),
        db.loadAccounts(),
        db.loadGames(),
      ]);
      set({ platforms, accounts, games, isLoading: false });
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

  setNav: (nav) => set({ activeNav: nav, detailOpen: false }),
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
      get().toast(`Launching ${game.title}…`, 'success');
    } catch (e) {
      get().toast(errorMessage(e), 'error');
    }
  },

  install: async (game) => {
    try {
      await api.installGame(game.platform_key, game.external_id);
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
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), 4200);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
