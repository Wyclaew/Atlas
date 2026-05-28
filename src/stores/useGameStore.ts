// stores/useGameStore.ts — Zustand State Yönetimi
// Uygulamanın tüm global durumunu yönetir: oyun listesi, filtreler, sıralama, UI durumu
// SQLite veritabanı ile doğrudan etkileşim kurar

import { create } from 'zustand';
import type { Game, GameFilters, SortField, SortDirection, ViewMode, NavSection, LibraryStats, GameStatus } from '../types';
import Database from '@tauri-apps/plugin-sql';

// =============================================
// Store Arayüzü — Tüm durum ve aksiyonlar
// =============================================
interface GameStore {
  // === Durum (State) ===
  games: Game[];                    // Tüm oyunlar (ham veri)
  filteredGames: Game[];            // Filtrelenmiş ve sıralanmış oyunlar
  selectedGame: Game | null;        // Seçili oyun (detay paneli için)
  isLoading: boolean;               // Veri yükleniyor mu?
  isSyncing: boolean;               // Senkronizasyon aktif mi?
  syncMessage: string;              // Senkronizasyon durumu mesajı
  filters: GameFilters;             // Aktif filtreler
  sortField: SortField;             // Sıralama alanı
  sortDirection: SortDirection;     // Sıralama yönü
  viewMode: ViewMode;               // Grid/Liste görünümü
  activeNav: NavSection;            // Aktif sidebar sekmesi
  isDetailOpen: boolean;            // Detay paneli açık mı?
  stats: LibraryStats;              // Kütüphane istatistikleri
  theme: 'dark' | 'light';          // Tema (dark/light)

  // === Aksiyonlar (Actions) ===
  loadGames: () => Promise<void>;
  setSelectedGame: (game: Game | null) => void;
  setFilter: <K extends keyof GameFilters>(key: K, value: GameFilters[K]) => void;
  setSorting: (field: SortField, direction?: SortDirection) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveNav: (nav: NavSection) => void;
  toggleDetail: (open?: boolean) => void;
  updateGameStatus: (gameId: number, status: GameStatus) => Promise<void>;
  toggleFavorite: (gameId: number) => Promise<void>;
  setSyncing: (syncing: boolean, message?: string) => void;
  calculateStats: () => void;
  applyFiltersAndSort: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

// =============================================
// Yardımcı Fonksiyonlar
// =============================================

/** SQLite integer değerini boolean'a çevirir */
const toBool = (val: number | boolean): boolean => {
  if (typeof val === 'boolean') return val;
  return val === 1;
};

/** Dakikayı okunabilir süre formatına çevirir */
export const formatPlaytime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 100) return mins > 0 ? `${hours}sa ${mins}dk` : `${hours}sa`;
  return `${hours}sa`;
};

// =============================================
// Zustand Store Oluşturma
// =============================================
export const useGameStore = create<GameStore>((set, get) => ({
  // === Başlangıç Durumu ===
  games: [],
  filteredGames: [],
  selectedGame: null,
  isLoading: false,
  isSyncing: false,
  syncMessage: '',
  filters: {
    search: '',
    platform: 'All',
    status: 'All',
    installedOnly: false,
    favoritesOnly: false,
  },
  sortField: 'title',
  sortDirection: 'asc',
  viewMode: 'grid',
  activeNav: 'all',
  isDetailOpen: false,
  stats: {
    totalGames: 0,
    installedGames: 0,
    totalPlaytimeHours: 0,
    steamGames: 0,
    epicGames: 0,
    customGames: 0,
    statusCounts: { Backlog: 0, Playing: 0, Completed: 0, Wishlist: 0, Dropped: 0 },
  },
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',

  // =============================================
  // Veritabanı İşlemleri
  // =============================================

  /** Tüm oyunları veritabanından yükler */
  loadGames: async () => {
    set({ isLoading: true });
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      const rows = await db.select<Game[]>(
        `SELECT g.*, p.name as platform_name
         FROM games g
         JOIN platforms p ON g.platform_id = p.id
         ORDER BY g.title COLLATE NOCASE ASC`
      );

      // SQLite integer → boolean dönüşümü
      const games = rows.map((g) => ({
        ...g,
        is_installed: toBool(g.is_installed),
        is_favorite: toBool(g.is_favorite),
      }));

      set({ games, isLoading: false });
      get().calculateStats();
      get().applyFiltersAndSort();
    } catch (err) {
      console.error('Oyunlar yüklenirken hata:', err);
      set({ isLoading: false });
    }
  },

  /** Oyunun durumunu günceller */
  updateGameStatus: async (gameId, status) => {
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      await db.execute(
        `UPDATE games SET status = $1, updated_at = datetime('now') WHERE id = $2`,
        [status, gameId]
      );
      // Güncellemeden sonra oyun listesini yeniden yükle
      await get().loadGames();
    } catch (err) {
      console.error('Durum güncellenirken hata:', err);
    }
  },

  /** Oyunun favori durumunu değiştirir */
  toggleFavorite: async (gameId) => {
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      await db.execute(
        `UPDATE games SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END,
         updated_at = datetime('now')
         WHERE id = $1`,
        [gameId]
      );
      await get().loadGames();
    } catch (err) {
      console.error('Favori değiştirilirken hata:', err);
    }
  },

  // =============================================
  // UI Durum Yönetimi
  // =============================================

  setSelectedGame: (game) => set({ selectedGame: game, isDetailOpen: !!game }),

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().applyFiltersAndSort();
  },

  setSorting: (field, direction) => {
    const currentState = get();
    // Aynı alana tıklanırsa yönü değiştir
    const newDirection = direction ?? (
      currentState.sortField === field && currentState.sortDirection === 'asc' ? 'desc' : 'asc'
    );
    set({ sortField: field, sortDirection: newDirection });
    get().applyFiltersAndSort();
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setActiveNav: (nav) => {
    // Navigasyon değişikliğinde filtreleri güncelle
    const filters: GameFilters = {
      search: get().filters.search, // Aramayı koru
      platform: 'All',
      status: 'All',
      installedOnly: false,
      favoritesOnly: false,
    };

    switch (nav) {
      case 'steam': filters.platform = 'Steam'; break;
      case 'epic': filters.platform = 'Epic'; break;
      case 'custom': filters.platform = 'Custom'; break;
      case 'favorites': filters.favoritesOnly = true; break;
      case 'backlog': filters.status = 'Backlog'; break;
      case 'playing': filters.status = 'Playing'; break;
      case 'completed': filters.status = 'Completed'; break;
      default: break;
    }

    set({ activeNav: nav, filters });
    get().applyFiltersAndSort();
  },

  toggleDetail: (open) => set((s) => ({ isDetailOpen: open ?? !s.isDetailOpen })),

  setSyncing: (syncing, message) => set({
    isSyncing: syncing,
    syncMessage: message ?? (syncing ? 'Senkronize ediliyor...' : ''),
  }),

  // =============================================
  // İstatistik Hesaplama
  // =============================================

  calculateStats: () => {
    const { games } = get();

    const statusCounts: Record<GameStatus, number> = {
      Backlog: 0, Playing: 0, Completed: 0, Wishlist: 0, Dropped: 0,
    };

    let installedGames = 0;
    let totalPlaytime = 0;
    let steamGames = 0;
    let epicGames = 0;
    let customGames = 0;

    for (const game of games) {
      // Durum sayıları
      if (statusCounts[game.status as GameStatus] !== undefined) {
        statusCounts[game.status as GameStatus]++;
      }

      // Kurulu oyun sayısı
      if (toBool(game.is_installed)) installedGames++;

      // Toplam oynama süresi
      totalPlaytime += game.total_playtime_minutes;

      // Platform sayıları
      switch (game.platform_name) {
        case 'Steam': steamGames++; break;
        case 'Epic': epicGames++; break;
        case 'Custom': customGames++; break;
      }
    }

    set({
      stats: {
        totalGames: games.length,
        installedGames,
        totalPlaytimeHours: Math.round(totalPlaytime / 60),
        steamGames,
        epicGames,
        customGames,
        statusCounts,
      },
    });
  },

  // =============================================
  // Filtreleme ve Sıralama Motoru
  // =============================================

  applyFiltersAndSort: () => {
    const { games, filters, sortField, sortDirection } = get();
    let result = [...games];

    // 1. Metin araması (başlıkta arama)
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter((g) =>
        g.title.toLowerCase().includes(query)
      );
    }

    // 2. Platform filtresi
    if (filters.platform !== 'All') {
      result = result.filter((g) => g.platform_name === filters.platform);
    }

    // 3. Durum filtresi
    if (filters.status !== 'All') {
      result = result.filter((g) => g.status === filters.status);
    }

    // 4. Yalnızca kurulular
    if (filters.installedOnly) {
      result = result.filter((g) => toBool(g.is_installed));
    }

    // 5. Yalnızca favoriler
    if (filters.favoritesOnly) {
      result = result.filter((g) => toBool(g.is_favorite));
    }

    // 6. Sıralama
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'tr');
          break;
        case 'playtime':
          comparison = a.total_playtime_minutes - b.total_playtime_minutes;
          break;
        case 'lastPlayed': {
          const dateA = a.last_played_at ?? '';
          const dateB = b.last_played_at ?? '';
          comparison = dateA.localeCompare(dateB);
          break;
        }
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    set({ filteredGames: result });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));
