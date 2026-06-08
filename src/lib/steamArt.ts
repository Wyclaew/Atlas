// Cover-art fallback chain. Steam's portrait `library_600x900` art doesn't
// exist for every (older) app, so we degrade gracefully to the capsule/header.

import type { Game } from '../types';

const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

/** Ordered list of candidate cover URLs to try (first that loads wins). */
export function coverCandidates(game: Pick<Game, 'platform_key' | 'external_id' | 'cover_url'>): string[] {
  if (game.platform_key === 'steam') {
    const id = game.external_id;
    return [
      `${CDN}/${id}/library_600x900_2x.jpg`,
      `${CDN}/${id}/library_600x900.jpg`,
      `${CDN}/${id}/capsule_616x353.jpg`,
      `${CDN}/${id}/header.jpg`,
    ];
  }
  return game.cover_url ? [game.cover_url] : [];
}

/** Ordered list of candidate wide hero/backdrop URLs. */
export function heroCandidates(game: Pick<Game, 'platform_key' | 'external_id' | 'hero_url' | 'cover_url'>): string[] {
  if (game.platform_key === 'steam') {
    const id = game.external_id;
    return [
      `${CDN}/${id}/library_hero.jpg`,
      `${CDN}/${id}/page_bg_generated_v6b.jpg`,
      `${CDN}/${id}/header.jpg`,
    ];
  }
  return [game.hero_url, game.cover_url].filter(Boolean) as string[];
}
