// Library + achievement sync commands. These return normalized data; the
// frontend upserts it into the local SQLite cache (preserving user fields).

use crate::connectors::steam;
use crate::error::AppResult;
use crate::models::{AchievementSet, NormalizedGame};

/// Pull the full owned-games library (with playtime) for a Steam account.
#[tauri::command]
pub async fn sync_steam_library(
    client: tauri::State<'_, reqwest::Client>,
    api_key: String,
    steam_id: String,
) -> AppResult<Vec<NormalizedGame>> {
    steam::fetch_library(client.inner(), &api_key, &steam_id).await
}

/// Pull achievements for a single Steam game (on demand, when detail opens).
#[tauri::command]
pub async fn fetch_steam_achievements(
    client: tauri::State<'_, reqwest::Client>,
    api_key: String,
    steam_id: String,
    appid: String,
) -> AppResult<AchievementSet> {
    steam::fetch_achievements(client.inner(), &api_key, &steam_id, &appid).await
}
