// Pure derivations over the library: filtering/sorting for the current nav,
// and aggregate stats for the sidebar/dashboard.

import type { Game, GameStatus, LibraryStats, NavId, SortField } from '../types';

const PLATFORM_NAVS = new Set<NavId>(['steam', 'epic', 'gog', 'xbox']);

export function matchesNav(game: Game, nav: NavId): boolean {
  switch (nav) {
    case 'all':
    case 'dashboard':
      return true;
    case 'favorites':
      return !!game.is_favorite;
    case 'playing':
      return game.status === 'Playing';
    case 'completed':
      return game.status === 'Completed';
    case 'wishlist':
      return game.status === 'Wishlist';
    default:
      if (PLATFORM_NAVS.has(nav)) return game.platform_key === nav;
      return true;
  }
}

function compare(a: Game, b: Game, sort: SortField): number {
  switch (sort) {
    case 'title':
      return (a.sort_title ?? a.title).localeCompare(b.sort_title ?? b.title);
    case 'playtime':
      return b.playtime_minutes - a.playtime_minutes;
    case 'achievements':
      return b.achievements_unlocked - a.achievements_unlocked;
    case 'lastPlayed':
    case 'recent':
    default: {
      const ta = a.last_played_at ? Date.parse(a.last_played_at) : 0;
      const tb = b.last_played_at ? Date.parse(b.last_played_at) : 0;
      if (tb !== ta) return tb - ta;
      return b.playtime_minutes - a.playtime_minutes;
    }
  }
}

export function filterAndSort(
  games: Game[],
  nav: NavId,
  search: string,
  sort: SortField
): Game[] {
  const q = search.trim().toLowerCase();
  const out = games.filter((g) => matchesNav(g, nav) && (!q || g.title.toLowerCase().includes(q)));
  out.sort((a, b) => compare(a, b, sort));
  return out;
}

const EMPTY_STATUS: Record<GameStatus, number> = {
  Library: 0,
  Playing: 0,
  Completed: 0,
  Wishlist: 0,
  Dropped: 0,
};

export function computeStats(games: Game[]): LibraryStats {
  const byStatus: Record<GameStatus, number> = { ...EMPTY_STATUS };
  const byPlatform: Record<string, number> = {};
  let installed = 0;
  let totalMinutes = 0;
  let achievementsUnlocked = 0;

  for (const g of games) {
    byStatus[g.status] = (byStatus[g.status] ?? 0) + 1;
    byPlatform[g.platform_key] = (byPlatform[g.platform_key] ?? 0) + 1;
    if (g.is_installed) installed += 1;
    totalMinutes += g.playtime_minutes;
    achievementsUnlocked += g.achievements_unlocked;
  }

  return {
    total: games.length,
    installed,
    totalHours: Math.round(totalMinutes / 60),
    achievementsUnlocked,
    byPlatform,
    byStatus,
  };
}

export function favoriteCount(games: Game[]): number {
  return games.reduce((n, g) => n + (g.is_favorite ? 1 : 0), 0);
}
