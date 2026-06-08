// Account connection commands. Validation/identity only — credentials are
// persisted locally by the frontend (SQLite) after a successful connect.

use crate::connectors::steam;
use crate::error::AppResult;
use crate::models::AccountInfo;

/// Validate a Steam API key + SteamID64/vanity and return profile info.
#[tauri::command]
pub async fn connect_steam(
    client: tauri::State<'_, reqwest::Client>,
    api_key: String,
    steam_input: String,
) -> AppResult<AccountInfo> {
    steam::connect(client.inner(), &api_key, &steam_input).await
}
