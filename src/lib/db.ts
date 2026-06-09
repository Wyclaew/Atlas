// Local SQLite cache access (tauri-plugin-sql). All persistence lives here.
// Re-syncing platform data never clobbers user-owned fields (status/favorite).

import Database from '@tauri-apps/plugin-sql';
import type {
  Account,
  Achievement,
  Game,
  GameStatus,
  NormalizedAchievement,
  NormalizedGame,
  Platform,
  PlatformKey,
  WishlistItem,
} from '../types';
import { unixToISO } from './format';
import { isTauri } from './env';

const DB_URL = 'sqlite:atlas.db';
let _db: Database | null = null;

// Outside Tauri (browser design-QA) there's no SQLite — return a no-op stub so
// reads resolve empty and writes are harmless. The store seeds mock data.
const STUB_DB = {
  execute: async () => ({ rowsAffected: 0, lastInsertId: 0 }),
  select: async () => [],
} as unknown as Database;

export async function getDb(): Promise<Database> {
  if (!isTauri()) return STUB_DB;
  if (!_db) _db = await Database.load(DB_URL);
  return _db;
}

// ---- Title normalization (sorting + cross-platform grouping) ----

export function toSortTitle(title: string): string {
  return title.toLowerCase().replace(/^(the|a|an)\s+/i, '').trim();
}

export function toCanonicalKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(goty|game of the year|edition|remastered|definitive|deluxe|complete|standard)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Build "($1,$2,...),($n,...)" placeholder rows for a multi-row insert. */
function placeholderRows(rowCount: number, colCount: number): string {
  return Array.from({ length: rowCount }, (_, r) => {
    const cells = Array.from({ length: colCount }, (_, c) => `$${r * colCount + c + 1}`);
    return `(${cells.join(',')})`;
  }).join(',');
}

// ---- Platforms / accounts ----

export async function loadPlatforms(): Promise<Platform[]> {
  const db = await getDb();
  return db.select<Platform[]>(`SELECT key, name, color FROM platforms`);
}

export async function loadAccounts(): Promise<Account[]> {
  const db = await getDb();
  return db.select<Account[]>(
    `SELECT id, platform_key, label, external_id, last_sync_at FROM accounts ORDER BY created_at ASC`
  );
}

export async function upsertAccount(
  platformKey: PlatformKey,
  label: string,
  externalId: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO accounts (platform_key, label, external_id, data_json, last_sync_at)
     VALUES ($1, $2, $3, $4, NULL)
     ON CONFLICT(platform_key, external_id) DO UPDATE SET
       label = excluded.label,
       data_json = excluded.data_json`,
    [platformKey, label, externalId, JSON.stringify(data)]
  );
}

export async function markAccountSynced(platformKey: PlatformKey): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE accounts SET last_sync_at = datetime('now') WHERE platform_key = $1`,
    [platformKey]
  );
}

export async function getSteamCredentials(): Promise<{ apiKey: string; steamId: string } | null> {
  const db = await getDb();
  const rows = await db.select<{ data_json: string | null; external_id: string | null }[]>(
    `SELECT data_json, external_id FROM accounts WHERE platform_key = 'steam' LIMIT 1`
  );
  if (!rows.length || !rows[0].external_id) return null;
  let apiKey = '';
  try {
    apiKey = (JSON.parse(rows[0].data_json ?? '{}') as { apiKey?: string }).apiKey ?? '';
  } catch {
    apiKey = '';
  }
  if (!apiKey) return null;
  return { apiKey, steamId: rows[0].external_id };
}

export async function disconnectPlatform(platformKey: PlatformKey): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM games WHERE platform_key = $1`, [platformKey]);
  await db.execute(`DELETE FROM accounts WHERE platform_key = $1`, [platformKey]);
}

// ---- Games ----

export async function loadGames(): Promise<Game[]> {
  const db = await getDb();
  // Load everything (incl. hidden); the UI filters hidden out except the Hidden view.
  return db.select<Game[]>(`SELECT * FROM games ORDER BY sort_title COLLATE NOCASE ASC`);
}

/** Mark which Steam games are installed locally (from the appmanifest scan). */
export async function markSteamInstalled(installed: { external_id: string; install_dir: string }[]): Promise<void> {
  const db = await getDb();
  await db.execute(`UPDATE games SET is_installed = 0 WHERE platform_key = 'steam'`);
  for (const g of installed) {
    await db.execute(
      `UPDATE games SET is_installed = 1, install_path = $1 WHERE platform_key = 'steam' AND external_id = $2`,
      [g.install_dir, g.external_id]
    );
  }
}

const GAME_COLS = [
  'platform_key', 'external_id', 'title', 'sort_title', 'canonical_key',
  'cover_url', 'hero_url', 'logo_url', 'icon_url',
  'playtime_minutes', 'playtime_2weeks_minutes', 'last_played_at', 'is_installed',
];

/**
 * Insert/update a synced library, preserving user fields and accent_color.
 * Uses chunked multi-row inserts: each statement is atomic on one pooled
 * connection (no fragile cross-call BEGIN/COMMIT) and fast for large libraries.
 */
export async function upsertGames(games: NormalizedGame[], platformKey: PlatformKey): Promise<void> {
  const db = await getDb();
  const cols = GAME_COLS.length;

  for (const batch of chunk(games, 50)) {
    const params: unknown[] = [];
    for (const g of batch) {
      params.push(
        platformKey, g.external_id, g.title, toSortTitle(g.title), toCanonicalKey(g.title),
        g.cover_url, g.hero_url, g.logo_url, g.icon_url,
        g.playtime_minutes, g.playtime_2weeks_minutes, unixToISO(g.last_played_unix), g.is_installed ? 1 : 0
      );
    }
    await db.execute(
      `INSERT INTO games (${GAME_COLS.join(',')})
       VALUES ${placeholderRows(batch.length, cols)}
       ON CONFLICT(platform_key, external_id) DO UPDATE SET
         title = excluded.title,
         sort_title = excluded.sort_title,
         canonical_key = excluded.canonical_key,
         cover_url = excluded.cover_url,
         hero_url = excluded.hero_url,
         logo_url = excluded.logo_url,
         icon_url = excluded.icon_url,
         playtime_minutes = excluded.playtime_minutes,
         playtime_2weeks_minutes = excluded.playtime_2weeks_minutes,
         last_played_at = excluded.last_played_at,
         updated_at = datetime('now')`,
      params
    );
  }
}

const USER_FIELDS = new Set(['status', 'is_favorite', 'is_hidden']);

export async function setUserField(
  gameId: number,
  field: 'status' | 'is_favorite' | 'is_hidden',
  value: GameStatus | number
): Promise<void> {
  if (!USER_FIELDS.has(field)) throw new Error(`Illegal field: ${field}`);
  const db = await getDb();
  await db.execute(
    `UPDATE games SET ${field} = $1, updated_at = datetime('now') WHERE id = $2`,
    [value, gameId]
  );
}

export async function setAccentColor(gameId: number, color: string): Promise<void> {
  const db = await getDb();
  await db.execute(`UPDATE games SET accent_color = $1 WHERE id = $2`, [color, gameId]);
}

// ---- Achievements ----

export async function loadAchievements(gameId: number): Promise<Achievement[]> {
  const db = await getDb();
  return db.select<Achievement[]>(
    `SELECT * FROM achievements WHERE game_id = $1
     ORDER BY unlocked DESC, unlock_time DESC, global_percent ASC`,
    [gameId]
  );
}

export async function saveAchievements(
  gameId: number,
  unlocked: number,
  total: number,
  items: NormalizedAchievement[]
): Promise<void> {
  const db = await getDb();
  const cols = 9;

  for (const batch of chunk(items, 80)) {
    const params: unknown[] = [];
    for (const a of batch) {
      params.push(
        gameId, a.api_name, a.name, a.description, a.icon_url, a.icon_locked_url,
        a.unlocked ? 1 : 0, unixToISO(a.unlock_time_unix), a.global_percent
      );
    }
    await db.execute(
      `INSERT INTO achievements
         (game_id, api_name, name, description, icon_url, icon_locked_url, unlocked, unlock_time, global_percent)
       VALUES ${placeholderRows(batch.length, cols)}
       ON CONFLICT(game_id, api_name) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         icon_url = excluded.icon_url,
         icon_locked_url = excluded.icon_locked_url,
         unlocked = excluded.unlocked,
         unlock_time = excluded.unlock_time,
         global_percent = excluded.global_percent`,
      params
    );
  }

  await db.execute(`UPDATE games SET achievements_unlocked = $1, achievements_total = $2 WHERE id = $3`, [
    unlocked,
    total,
    gameId,
  ]);
}

// ---- Settings (key/value) ----

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<{ value: string }[]>(`SELECT value FROM settings WHERE key = $1`, [key]);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    [key, value]
  );
}

// ---- Wishlist (un-owned games) ----

export async function loadWishlist(): Promise<WishlistItem[]> {
  const db = await getDb();
  return db.select<WishlistItem[]>(`SELECT * FROM wishlist ORDER BY added_at DESC`);
}

export async function addToWishlist(item: {
  platform_key: PlatformKey;
  external_id: string;
  title: string;
  cover_url: string | null;
  store_url: string | null;
}): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO wishlist (platform_key, external_id, title, cover_url, store_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT(platform_key, external_id) DO NOTHING`,
    [item.platform_key, item.external_id, item.title, item.cover_url, item.store_url]
  );
}

export async function removeFromWishlist(platformKey: PlatformKey, externalId: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM wishlist WHERE platform_key = $1 AND external_id = $2`, [platformKey, externalId]);
}

export async function updateWishlistPrice(
  id: number,
  p: { last: number | null; currency: string | null; discount: number | null; lowest: number | null; best: string | null }
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE wishlist SET
       prev_price_cents = last_price_cents,
       last_price_cents = $1,
       currency = $2,
       discount_pct = $3,
       lowest_cents = $4,
       best_store = $5
     WHERE id = $6`,
    [p.last, p.currency, p.discount, p.lowest, p.best, id]
  );
}
