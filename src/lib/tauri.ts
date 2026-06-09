// Thin, typed wrappers over the Rust commands. Tauri maps camelCase JS keys to
// the snake_case Rust parameters automatically.

import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import type {
  AccountInfo,
  AchievementSet,
  FeaturedStore,
  InstalledGame,
  NormalizedGame,
  PlatformPaths,
  PriceComparison,
  StoreApp,
  StoreListing,
} from '../types';

/** Open a URL in the user's default browser (not the webview). */
export function openExternal(url: string): Promise<void> {
  return openUrl(url);
}

export const api = {
  connectSteam: (apiKey: string, steamInput: string) =>
    invoke<AccountInfo>('connect_steam', { apiKey, steamInput }),

  syncSteamLibrary: (apiKey: string, steamId: string) =>
    invoke<NormalizedGame[]>('sync_steam_library', { apiKey, steamId }),

  fetchSteamAchievements: (apiKey: string, steamId: string, appid: string) =>
    invoke<AchievementSet>('fetch_steam_achievements', { apiKey, steamId, appid }),

  launchGame: (platformKey: string, externalId: string) =>
    invoke<void>('launch_game', { platformKey, externalId }),

  installGame: (platformKey: string, externalId: string) =>
    invoke<void>('install_game', { platformKey, externalId }),

  openStorePage: (platformKey: string, externalId: string) =>
    invoke<void>('open_store_page', { platformKey, externalId }),

  detectPlatformPaths: () => invoke<PlatformPaths>('detect_platform_paths'),

  scanSteamInstalls: (steamPath: string) =>
    invoke<InstalledGame[]>('scan_steam_installs', { steamPath }),

  storeFeatured: (cc: string) => invoke<FeaturedStore>('store_featured', { cc }),

  storeSearch: (term: string, cc: string) =>
    invoke<StoreListing[]>('store_search', { term, cc }),

  storeAppDetails: (appid: string, cc: string) =>
    invoke<StoreApp>('store_app_details', { appid, cc }),

  itadPrices: (key: string, appid: string, country: string) =>
    invoke<PriceComparison>('itad_prices', { key, appid, country }),
};

export function errorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  return String(e);
}
