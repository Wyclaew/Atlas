-- =============================================
-- Game Manager — Veritabanı Şeması v1
-- Açıklama: Temel tablolar, indeksler ve varsayılan veriler
-- =============================================

-- Platform tanımları (Steam, Epic, Custom)
CREATE TABLE IF NOT EXISTS platforms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    icon_name   TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Oyun kütüphanesi (ana tablo)
CREATE TABLE IF NOT EXISTS games (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id             INTEGER NOT NULL,
    external_game_id        TEXT    NOT NULL,
    title                   TEXT    NOT NULL,
    cover_image_url         TEXT,
    banner_image_url        TEXT,
    install_path            TEXT,
    executable_path         TEXT,
    is_installed            INTEGER NOT NULL DEFAULT 0,
    total_playtime_minutes  INTEGER NOT NULL DEFAULT 0,
    last_played_at          TEXT,
    status                  TEXT    NOT NULL DEFAULT 'Backlog',
    is_favorite             INTEGER NOT NULL DEFAULT 0,
    metadata_json           TEXT,
    created_at              TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT    NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
    UNIQUE(platform_id, external_game_id)
);

-- Performans indeksleri
CREATE INDEX IF NOT EXISTS idx_games_platform    ON games(platform_id);
CREATE INDEX IF NOT EXISTS idx_games_title       ON games(title COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_games_status      ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_installed   ON games(is_installed);
CREATE INDEX IF NOT EXISTS idx_games_playtime    ON games(total_playtime_minutes DESC);
CREATE INDEX IF NOT EXISTS idx_games_last_played ON games(last_played_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_favorite    ON games(is_favorite);

-- Oyun oturumu geçmişi (playtime tracking)
CREATE TABLE IF NOT EXISTS play_sessions (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id          INTEGER NOT NULL,
    started_at       TEXT    NOT NULL,
    ended_at         TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_game ON play_sessions(game_id);

-- Uygulama ayarları (key-value store)
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Varsayılan platform verileri
INSERT OR IGNORE INTO platforms (name, icon_name) VALUES ('Steam', 'steam');
INSERT OR IGNORE INTO platforms (name, icon_name) VALUES ('Epic', 'gamepad-2');
INSERT OR IGNORE INTO platforms (name, icon_name) VALUES ('Custom', 'folder-open');
