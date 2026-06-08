// Launch / install / store commands. We never run game binaries ourselves;
// we hand off to the platform's native client via its URI scheme.

use crate::connectors::{launch_uri, UriKind};
use crate::error::{AppError, AppResult};
use tauri_plugin_opener::OpenerExt;

fn open(app: &tauri::AppHandle, platform_key: &str, external_id: &str, kind: UriKind) -> AppResult<()> {
    let uri = launch_uri(platform_key, external_id, kind).ok_or_else(|| {
        AppError::Input(format!("This action isn't supported for {platform_key} yet."))
    })?;
    app.opener()
        .open_url(uri, None::<&str>)
        .map_err(|e| AppError::Api(e.to_string()))
}

#[tauri::command]
pub fn launch_game(app: tauri::AppHandle, platform_key: String, external_id: String) -> AppResult<()> {
    open(&app, &platform_key, &external_id, UriKind::Launch)
}

#[tauri::command]
pub fn install_game(app: tauri::AppHandle, platform_key: String, external_id: String) -> AppResult<()> {
    open(&app, &platform_key, &external_id, UriKind::Install)
}

#[tauri::command]
pub fn open_store_page(app: tauri::AppHandle, platform_key: String, external_id: String) -> AppResult<()> {
    open(&app, &platform_key, &external_id, UriKind::Store)
}
