# AGENTS.md — working notes for AI agents

Keep this current after any structural change.

## What this is

Atlas: a cross-platform (macOS + Windows) game library hub built on **Tauri v2 + React +
TypeScript + Tailwind v4**. It aggregates a user's games/playtime/achievements from
multiple stores into a local SQLite cache and a polished UI. Steam ships first; the
codebase is structured to add more platforms.

## Architecture (read before editing)

- **Backend does I/O, frontend owns persistence.** Rust connectors fetch normalized data
  from platform APIs and return it over IPC; the **frontend** writes it to SQLite via
  `tauri-plugin-sql`. All DB logic lives in `src/lib/db.ts`.
- **Connector pattern:** `src-tauri/src/connectors/` — each platform module exposes
  `connect / fetch_library / fetch_achievements` and maps raw API → `models.rs`
  (`NormalizedGame`, `AchievementSet`, …). Add a platform = new module + new commands in
  `src-tauri/src/commands/` + register in `lib.rs`. Launch/install/store URIs are
  dispatched by `platform_key` in `connectors/mod.rs::launch_uri`.
- **State:** `src/store/useStore.ts` (Zustand) is the single source of truth for the UI;
  it calls `lib/tauri.ts` (commands) and `lib/db.ts` (cache).
- **Data model:** one `games` row per (platform_key, external_id). User fields
  (`status`, `is_favorite`, `is_hidden`) and `accent_color` are **never** overwritten by
  a re-sync. `canonical_key` enables cross-platform grouping later.

## Conventions / gotchas

- **DB connection string is `sqlite:atlas.db`** (must match `lib.rs` migration + `db.ts`).
  A *new* migration version must be appended — never edit `001_init.sql` after release.
- **No cross-call `BEGIN/COMMIT`** — `tauri-plugin-sql` pools connections. Batch with
  multi-row inserts (`placeholderRows` in `db.ts`) so each statement is atomic.
- **Tauri maps camelCase (JS) → snake_case (Rust)** command args automatically.
- **Times** cross the IPC boundary as Unix seconds (`*_unix`); the frontend formats them
  (`lib/format.ts`).
- **Color extraction** (`lib/color.ts`) uses a separate CORS image, so a tainted canvas
  just falls back to the default accent — display `<img>` never sets `crossOrigin`.
- **Steam art** is built from the appid with a fallback chain (`lib/steamArt.ts`);
  `library_600x900` is missing for some older apps.
- **Achievements** are fetched on demand when the detail panel opens (rate-limit friendly)
  and cached; "no achievements" games re-check each open.

## Design language

Warm near-black canvas, **Space Grotesk + Inter**, a restrained lime signature accent,
and per-game color from cover art. Deliberately *not* the stock blue/purple AI dashboard.
Tokens live in `src/index.css` `@theme`. Motion via Framer Motion; respect
`prefers-reduced-motion`.

## Verify

- `npm run build` — type-check + bundle (must be clean).
- `cd src-tauri && cargo check` — Rust must be clean.
- `npm run tauri dev` — boots on macOS; confirm no panic and the webview loads.

## Roadmap / backlog

- [ ] Epic connector (Legendary-style OAuth + library), GOG (gogdl), Xbox.
- [ ] Cross-platform ownership de-dupe surfaced in UI (group by `canonical_key`).
- [ ] Real downloads/installs via bundled sidecars (Legendary/gogdl) — later phase.
- [ ] Own-launch process-watch playtime tracking; periodic background sync.
- [ ] Move credentials from SQLite to OS keychain (stronghold/keyring) for hardening.
- [ ] Metadata/art enrichment (IGDB / SteamGridDB) for missing covers.
