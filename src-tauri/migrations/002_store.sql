-- =============================================================
-- Atlas — store wishlist + status cleanup (v2)
-- =============================================================

-- Wishlist of games the user does NOT own yet (separate from the library).
CREATE TABLE IF NOT EXISTS wishlist (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_key     TEXT    NOT NULL DEFAULT 'steam',
    external_id      TEXT    NOT NULL,
    title            TEXT    NOT NULL,
    cover_url        TEXT,
    store_url        TEXT,
    added_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    last_price_cents INTEGER,
    prev_price_cents INTEGER,
    currency         TEXT,
    discount_pct     INTEGER,
    lowest_cents     INTEGER,
    best_store       TEXT,
    UNIQUE(platform_key, external_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_added ON wishlist(added_at DESC);

-- Retire the confusing library "Wishlist" status (real wishlist lives above).
UPDATE games SET status = 'Library' WHERE status = 'Wishlist';
