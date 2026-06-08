// Shared types. `*_*` integer flags mirror the SQLite cache (0/1).

export type PlatformKey = 'steam' | 'epic' | 'gog' | 'xbox';
export type GameStatus = 'Library' | 'Playing' | 'Completed' | 'Wishlist' | 'Dropped';
export type SortField = 'recent' | 'title' | 'playtime' | 'lastPlayed' | 'achievements';
export type SortDir = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
export type AppView = 'dashboard' | 'library' | 'accounts';

export type NavId =
  | 'dashboard'
  | 'all'
  | 'favorites'
  | 'playing'
  | 'completed'
  | 'wishlist'
  | PlatformKey
  | 'accounts';

/** A cached library row (one per platform + external game). */
export interface Game {
  id: number;
  platform_key: PlatformKey;
  external_id: string;
  title: string;
  sort_title: string | null;
  canonical_key: string | null;
  cover_url: string | null;
  hero_url: string | null;
  logo_url: string | null;
  icon_url: string | null;
  accent_color: string | null;
  is_installed: number;
  install_path: string | null;
  playtime_minutes: number;
  playtime_2weeks_minutes: number;
  last_played_at: string | null;
  achievements_unlocked: number;
  achievements_total: number;
  status: GameStatus;
  is_favorite: number;
  is_hidden: number;
  released_at: string | null;
  metadata_json: string | null;
}

export interface Platform {
  key: PlatformKey;
  name: string;
  color: string | null;
}

export interface Account {
  id: number;
  platform_key: PlatformKey;
  label: string | null;
  external_id: string | null;
  last_sync_at: string | null;
}

export interface Achievement {
  id: number;
  game_id: number;
  api_name: string;
  name: string | null;
  description: string | null;
  icon_url: string | null;
  icon_locked_url: string | null;
  unlocked: number;
  unlock_time: string | null;
  global_percent: number | null;
}

export interface LibraryStats {
  total: number;
  installed: number;
  totalHours: number;
  achievementsUnlocked: number;
  byPlatform: Record<string, number>;
  byStatus: Record<GameStatus, number>;
}

// ---- Shapes returned from the Rust backend ----

export interface NormalizedGame {
  external_id: string;
  title: string;
  cover_url: string | null;
  hero_url: string | null;
  logo_url: string | null;
  icon_url: string | null;
  playtime_minutes: number;
  playtime_2weeks_minutes: number;
  last_played_unix: number | null;
  is_installed: boolean;
}

export interface AccountInfo {
  external_id: string;
  label: string;
  avatar_url: string | null;
}

export interface NormalizedAchievement {
  api_name: string;
  name: string | null;
  description: string | null;
  icon_url: string | null;
  icon_locked_url: string | null;
  unlocked: boolean;
  unlock_time_unix: number | null;
  global_percent: number | null;
}

export interface AchievementSet {
  unlocked: number;
  total: number;
  items: NormalizedAchievement[];
}

export interface PlatformPaths {
  os: string;
  steam_path: string | null;
  epic_path: string | null;
  gog_path: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
