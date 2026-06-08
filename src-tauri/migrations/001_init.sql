-- =============================================================
-- Atlas — Local cache schema (v1)
-- Everything here is a LOCAL cache of data pulled from the
-- platforms the user connects. Nothing leaves the device.
-- Designed multi-platform from day one (Steam ships first).
-- =============================================================

-- Known storefronts/platforms. Seeded below; more can be added.
CREATE TABLE IF NOT EXISTS platforms (
    key         TEXT PRIMARY KEY,          -- 'steam' | 'epic' | 'gog' | 'xbox' | ...
    name        TEXT NOT NULL,             -- display name
    color       TEXT,                      -- brand color (hex) for chips
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A connected account on a platform (credentials/tokens live here, local only).
CREATE TABLE IF NOT EXISTS accounts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_key  TEXT NOT NULL,
    label         TEXT,                    -- e.g. persona name / display name
    external_id   TEXT,                    -- e.g. SteamID64
    data_json     TEXT,                    -- platform-specific creds/tokens (api key, oauth, ...)
    last_sync_at  TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (platform_key) REFERENCES platforms(key) ON DELETE CASCADE,
    UNIQUE(platform_key, external_id)
);

-- One row per (platform, external game). The unified library is the union
-- of these rows; cross-platform duplicates are grouped by canonical_key.
CREATE TABLE IF NOT EXISTS games (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_key            TEXT    NOT NULL,
    external_id             TEXT    NOT NULL,         -- appid / catalog id / ...
    title                   TEXT    NOT NULL,
    sort_title              TEXT,                      -- title without leading articles, lowercased
    canonical_key           TEXT,                      -- normalized title -> cross-platform grouping

    -- Artwork (URLs to platform CDNs; rendered directly, cached by webview)
    cover_url               TEXT,                      -- portrait library art (2:3)
    hero_url                TEXT,                      -- wide hero / header art
    logo_url                TEXT,                      -- transparent logo
    icon_url                TEXT,
    accent_color            TEXT,                      -- cached dominant color extracted from cover

    -- Install / launch state
    is_installed            INTEGER NOT NULL DEFAULT 0,
    install_path            TEXT,

    -- Tracking (store-reported in v1)
    playtime_minutes        INTEGER NOT NULL DEFAULT 0,
    playtime_2weeks_minutes INTEGER NOT NULL DEFAULT 0,
    last_played_at          TEXT,

    -- Achievement progress (counts; per-achievement rows in `achievements`)
    achievements_unlocked   INTEGER NOT NULL DEFAULT 0,
    achievements_total      INTEGER NOT NULL DEFAULT 0,

    -- User-owned fields (NEVER overwritten by a re-sync)
    status                  TEXT    NOT NULL DEFAULT 'Library',  -- Library|Playing|Completed|Wishlist|Dropped
    is_favorite             INTEGER NOT NULL DEFAULT 0,
    is_hidden               INTEGER NOT NULL DEFAULT 0,

    released_at             TEXT,
    metadata_json           TEXT,
    created_at              TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT    NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (platform_key) REFERENCES platforms(key) ON DELETE CASCADE,
    UNIQUE(platform_key, external_id)
);

CREATE INDEX IF NOT EXISTS idx_games_sort_title     ON games(sort_title);
CREATE INDEX IF NOT EXISTS idx_games_platform       ON games(platform_key, sort_title);
CREATE INDEX IF NOT EXISTS idx_games_status         ON games(status, sort_title);
CREATE INDEX IF NOT EXISTS idx_games_favorite       ON games(is_favorite, sort_title);
CREATE INDEX IF NOT EXISTS idx_games_installed      ON games(is_installed, sort_title);
CREATE INDEX IF NOT EXISTS idx_games_playtime       ON games(playtime_minutes DESC);
CREATE INDEX IF NOT EXISTS idx_games_last_played    ON games(last_played_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_canonical      ON games(canonical_key);

-- Per-game achievement detail.
CREATE TABLE IF NOT EXISTS achievements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id         INTEGER NOT NULL,
    api_name        TEXT    NOT NULL,
    name            TEXT,
    description     TEXT,
    icon_url        TEXT,
    icon_locked_url TEXT,
    unlocked        INTEGER NOT NULL DEFAULT 0,
    unlock_time     TEXT,
    global_percent  REAL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE(game_id, api_name)
);

CREATE INDEX IF NOT EXISTS idx_ach_game     ON achievements(game_id);
CREATE INDEX IF NOT EXISTS idx_ach_unlocked ON achievements(game_id, unlocked);

-- Generic key/value app settings.
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the platforms we know about.
INSERT OR IGNORE INTO platforms (key, name, color) VALUES
    ('steam', 'Steam',          '#66c0f4'),
    ('epic',  'Epic Games',     '#f5f5f5'),
    ('gog',   'GOG',            '#a05fce'),
    ('xbox',  'Xbox / PC Pass', '#107c10');
