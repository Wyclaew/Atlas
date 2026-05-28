// types/index.ts — Tüm TypeScript Tip Tanımları
// Uygulama genelinde kullanılan arayüzler ve tipler

/// Oyun durumu — kullanıcının oyuna verdiği etiket
export type GameStatus = 'Backlog' | 'Playing' | 'Completed' | 'Wishlist' | 'Dropped';

/// Platform adı — desteklenen oyun platformları
export type PlatformName = 'Steam' | 'Epic' | 'Custom';

/// Sıralama alanı
export type SortField = 'title' | 'playtime' | 'lastPlayed' | 'status';

/// Sıralama yönü
export type SortDirection = 'asc' | 'desc';

/// Görünüm modu — grid veya liste
export type ViewMode = 'grid' | 'list';

/// Sidebar navigasyon sekmeleri
export type NavSection = 'all' | 'steam' | 'epic' | 'custom' | 'favorites' | 'backlog' | 'playing' | 'completed' | 'settings';

/// Platform bilgisi — veritabanındaki platforms tablosu
export interface Platform {
  id: number;
  name: PlatformName;
  icon_name: string;
  is_active: boolean;
}

/// Oyun bilgisi — veritabanındaki games tablosu (platform adı JOIN ile eklenir)
export interface Game {
  id: number;
  platform_id: number;
  platform_name: PlatformName;
  external_game_id: string;
  title: string;
  cover_image_url: string | null;
  banner_image_url: string | null;
  install_path: string | null;
  executable_path: string | null;
  is_installed: number | boolean;
  total_playtime_minutes: number;
  last_played_at: string | null;
  status: GameStatus;
  is_favorite: number | boolean;
  metadata_json: string | null;
}

/// Oyun filtreleri — arama ve filtreleme durumu
export interface GameFilters {
  search: string;
  platform: PlatformName | 'All';
  status: GameStatus | 'All';
  installedOnly: boolean;
  favoritesOnly: boolean;
}

/// Steam API'den gelen oyun verisi
export interface SteamGameData {
  appid: number;
  name: string | null;
  playtime_forever: number | null;
  rtime_last_played: number | null;
  img_icon_url: string | null;
}

/// Yerel kurulu oyun bilgisi
export interface InstalledGameInfo {
  appid: string;
  name: string;
  install_dir: string;
  full_path: string;
}

/// Senkronizasyon sonucu
export interface SyncResult {
  platform: string;
  games_added: number;
  games_updated: number;
  errors: string[];
}

/// Uygulama ayarları
export interface AppSettings {
  steamApiKey: string;
  steamId: string;
  epicAccessToken: string;
  epicAccountId: string;
  steamInstallPath: string;
  autoSyncOnStartup: boolean;
  theme: 'dark' | 'light';
}

/// İstatistik bilgileri — sidebar ve dashboard'da gösterilen
export interface LibraryStats {
  totalGames: number;
  installedGames: number;
  totalPlaytimeHours: number;
  steamGames: number;
  epicGames: number;
  customGames: number;
  statusCounts: Record<GameStatus, number>;
}
