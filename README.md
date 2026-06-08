# Atlas — Cross-Platform Game Library Hub

One home for every store. Atlas pulls your games, **playtime** and **achievements**
from multiple platforms into a single, fast, good-looking desktop app — and lets you
launch (and, later, install) them. It's lightweight (Tauri + Rust), runs on **macOS and
Windows**, and keeps everything **local** — nothing is sent to any server of ours.

> Think *Playnite + Heroic*, but cross-platform and light on resources.

---

## Status

- ✅ **Steam** — fully integrated end-to-end: library, playtime, achievements, cover
  art, launch (`steam://`).
- 🧩 **Architecture is multi-platform from day one** — a pluggable connector pattern.
  Epic, GOG and Xbox are scaffolded and shown in the UI as *coming soon*.
- 🗺️ **Roadmap:** Epic (Legendary), GOG (gogdl), Xbox, then real downloads/installs and
  own-launch playtime tracking.

## Highlights

- **Unified library** across stores, de-duped by canonical title.
- **Per-game dynamic color** — the UI borrows each cover's dominant color for the hero,
  card focus and detail accents (a console-dashboard feel, not a generic template).
- **Playtime & achievements** with progress, rarity %, and a cinematic detail view.
- **Virtualized, responsive grid** that stays smooth with thousands of games.
- **Local & private** — credentials and cache live in a local SQLite database.

## Tech stack

| Layer | Choice |
|------|--------|
| Shell | **Tauri v2** (Rust) — small footprint, native, cross-platform |
| Backend | Rust connectors (`reqwest`), `tauri-plugin-sql` (SQLite), `tauri-plugin-opener` |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 (design tokens) |
| State | Zustand |
| Motion | Framer Motion |
| Virtualization | `@tanstack/react-virtual` |

## Project layout

```
src/                         React frontend
  app/App.tsx                shell + view routing
  features/                  dashboard · library · detail · accounts
  components/{ui,layout}/     Button, Badges, CoverImage, Toasts, Sidebar, TopBar
  store/useStore.ts          global state (talks to backend + local cache)
  lib/                       db (SQLite), tauri (commands), color, format, select, meta
  index.css                  design system (tokens, utilities, motion)
src-tauri/                   Rust backend
  src/connectors/            PlatformConnector pattern (steam.rs; epic/gog/xbox next)
  src/commands/              accounts · sync · launch · system
  migrations/001_init.sql    local cache schema
```

## Getting started

Requirements: **Node 18+**, **Rust + Cargo** ([rustup](https://rustup.rs/)), and the
platform build tools Tauri needs (Xcode CLT on macOS; MSVC build tools on Windows).

```bash
npm install
npm run tauri dev      # run the desktop app
npm run tauri build    # produce a packaged build
npm run build          # type-check + bundle the frontend only
```

### Connecting Steam

1. Open **Accounts & Settings**.
2. Paste a **Steam Web API key** (`steamcommunity.com/dev/apikey`) and your
   **SteamID64** (or profile/vanity name).
3. Your Steam profile's **Game details** must be set to **Public** for playtime and
   achievements to load.

Atlas validates the credentials, syncs your library, and caches it locally so the app
is instant and works offline.

## Privacy

Atlas talks to each platform directly. API keys, tokens, games, playtime and
achievements are stored only in a local SQLite database on your machine.

## License

MIT.
