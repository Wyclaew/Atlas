// Dev-only sample data so the UI can be designed/QA'd in a plain browser
// (outside Tauri). Uses real Steam appids so genuine cover art loads.

import type { Account, Game, GameStatus, Platform, WishlistItem } from '../types';

const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

interface Seed {
  id: string;
  title: string;
  hours: number;
  recentDays: number | null;
  ach: [number, number];
  status: GameStatus;
  fav?: boolean;
  installed?: boolean;
}

const SEEDS: Seed[] = [
  { id: '1245620', title: 'ELDEN RING', hours: 187, recentDays: 1, ach: [34, 42], status: 'Playing', fav: true, installed: true },
  { id: '1086940', title: "Baldur's Gate 3", hours: 142, recentDays: 3, ach: [21, 54], status: 'Playing', installed: true },
  { id: '292030', title: 'The Witcher 3: Wild Hunt', hours: 96, recentDays: 20, ach: [52, 78], status: 'Completed', fav: true },
  { id: '1091500', title: 'Cyberpunk 2077', hours: 73, recentDays: 9, ach: [31, 44], status: 'Completed', installed: true },
  { id: '1174180', title: 'Red Dead Redemption 2', hours: 64, recentDays: 40, ach: [12, 51], status: 'Playing' },
  { id: '413150', title: 'Stardew Valley', hours: 58, recentDays: 6, ach: [29, 40], status: 'Completed', installed: true },
  { id: '367520', title: 'Hollow Knight', hours: 41, recentDays: 70, ach: [38, 63], status: 'Completed', fav: true },
  { id: '1716740', title: 'Starfield', hours: 22, recentDays: null, ach: [8, 50], status: 'Library', installed: true },
  { id: '570', title: 'Dota 2', hours: 1240, recentDays: 2, ach: [0, 0], status: 'Playing' },
  { id: '730', title: 'Counter-Strike 2', hours: 980, recentDays: 1, ach: [1, 1], status: 'Playing', installed: true },
  { id: '271590', title: 'Grand Theft Auto V', hours: 210, recentDays: 14, ach: [33, 77], status: 'Library' },
  { id: '252490', title: 'Rust', hours: 134, recentDays: null, ach: [0, 88], status: 'Dropped' },
  { id: '648800', title: 'Raft', hours: 19, recentDays: 55, ach: [11, 26], status: 'Library' },
  { id: '1145360', title: 'Hades', hours: 47, recentDays: 4, ach: [40, 49], status: 'Completed', fav: true, installed: true },
];

function iso(days: number | null): string | null {
  if (days === null) return null;
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function mockPlatforms(): Platform[] {
  return [
    { key: 'steam', name: 'Steam', color: '#66c0f4' },
    { key: 'epic', name: 'Epic Games', color: '#cfcfcf' },
    { key: 'gog', name: 'GOG', color: '#b072e0' },
    { key: 'xbox', name: 'Xbox', color: '#5bd95b' },
  ];
}

export function mockAccounts(): Account[] {
  return [
    {
      id: 1,
      platform_key: 'steam',
      label: 'nova',
      external_id: '76561198000000000',
      last_sync_at: new Date(Date.now() - 3600_000).toISOString(),
    },
  ];
}

export function mockWishlist(): WishlistItem[] {
  return [
    {
      id: 1, platform_key: 'steam', external_id: '2050650', title: 'Resident Evil 4',
      cover_url: `${CDN}/2050650/library_600x900_2x.jpg`, store_url: 'https://store.steampowered.com/app/2050650',
      added_at: new Date().toISOString(), last_price_cents: 1999, prev_price_cents: 3999, currency: 'USD',
      discount_pct: 50, lowest_cents: 1999, best_store: 'Steam',
    },
    {
      id: 2, platform_key: 'steam', external_id: '1888930', title: 'The Last of Us Part I',
      cover_url: `${CDN}/1888930/library_600x900_2x.jpg`, store_url: 'https://store.steampowered.com/app/1888930',
      added_at: new Date().toISOString(), last_price_cents: 4999, prev_price_cents: 4999, currency: 'USD',
      discount_pct: 0, lowest_cents: 2999, best_store: 'GOG',
    },
  ];
}

export function mockGames(): Game[] {
  return SEEDS.map((s, i) => ({
    id: i + 1,
    platform_key: 'steam',
    external_id: s.id,
    title: s.title,
    sort_title: s.title.toLowerCase(),
    canonical_key: s.title.toLowerCase(),
    cover_url: `${CDN}/${s.id}/library_600x900_2x.jpg`,
    hero_url: `${CDN}/${s.id}/library_hero.jpg`,
    logo_url: `${CDN}/${s.id}/logo.png`,
    icon_url: null,
    accent_color: null,
    is_installed: s.installed ? 1 : 0,
    install_path: null,
    playtime_minutes: s.hours * 60,
    playtime_2weeks_minutes: s.recentDays !== null && s.recentDays < 14 ? 320 : 0,
    last_played_at: iso(s.recentDays),
    achievements_unlocked: s.ach[0],
    achievements_total: s.ach[1],
    status: s.status,
    is_favorite: s.fav ? 1 : 0,
    is_hidden: 0,
    released_at: null,
    metadata_json: null,
  }));
}
