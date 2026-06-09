// Store + price-comparison commands. Steam store data needs no key; ITAD
// cross-store comparison needs the user's free key (empty key → Steam-only).

use crate::connectors::{itad, steamstore};
use crate::error::AppResult;
use crate::models::{FeaturedStore, PriceComparison, StoreApp, StoreListing};

#[tauri::command]
pub async fn store_featured(
    client: tauri::State<'_, reqwest::Client>,
    cc: String,
) -> AppResult<FeaturedStore> {
    steamstore::featured(client.inner(), &cc).await
}

#[tauri::command]
pub async fn store_search(
    client: tauri::State<'_, reqwest::Client>,
    term: String,
    cc: String,
) -> AppResult<Vec<StoreListing>> {
    steamstore::search(client.inner(), &term, &cc).await
}

#[tauri::command]
pub async fn store_app_details(
    client: tauri::State<'_, reqwest::Client>,
    appid: String,
    cc: String,
) -> AppResult<StoreApp> {
    steamstore::app_details(client.inner(), &appid, &cc).await
}

#[tauri::command]
pub async fn itad_prices(
    client: tauri::State<'_, reqwest::Client>,
    key: String,
    appid: String,
    country: String,
) -> AppResult<PriceComparison> {
    if key.trim().is_empty() {
        return Ok(PriceComparison::default());
    }
    itad::game_prices(client.inner(), key.trim(), &appid, &country).await
}
