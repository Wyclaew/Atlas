// models.rs — Tüm veri yapıları (Serde ile serileştirme)
// Bu yapılar hem Rust backend'de hem de IPC üzerinden frontend'e gönderilirken kullanılır.

use serde::{Deserialize, Serialize};

/// Platform bilgisi (Steam, Epic, Custom)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Platform {
    pub id: i64,
    pub name: String,
    pub icon_name: Option<String>,
    pub is_active: bool,
}

/// Oyun bilgisi — SQLite'dan okunan ve frontend'e gönderilen ana yapı
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: i64,
    pub platform_id: i64,
    pub platform_name: Option<String>,
    pub external_game_id: String,
    pub title: String,
    pub cover_image_url: Option<String>,
    pub banner_image_url: Option<String>,
    pub install_path: Option<String>,
    pub executable_path: Option<String>,
    pub is_installed: bool,
    pub total_playtime_minutes: i64,
    pub last_played_at: Option<String>,
    pub status: String,
    pub is_favorite: bool,
    pub metadata_json: Option<String>,
}

/// Oyun oturumu — playtime tracking için
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaySession {
    pub id: i64,
    pub game_id: i64,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_minutes: i64,
}

/// Uygulama ayarı — key-value çifti
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

// =============================================
// Steam API Yanıt Yapıları
// =============================================

/// Steam Web API — GetOwnedGames yanıtının dış sarmalayıcısı
#[derive(Debug, Deserialize)]
pub struct SteamOwnedGamesResponse {
    pub response: SteamGamesInner,
}

/// GetOwnedGames yanıtının iç kısmı
#[derive(Debug, Deserialize)]
pub struct SteamGamesInner {
    pub game_count: Option<u32>,
    pub games: Option<Vec<SteamGame>>,
}

/// Tek bir Steam oyunu bilgisi
#[derive(Debug, Deserialize, Serialize)]
pub struct SteamGame {
    pub appid: u64,
    pub name: Option<String>,
    pub playtime_forever: Option<u64>,
    pub rtime_last_played: Option<u64>,
    pub img_icon_url: Option<String>,
}

// =============================================
// Epic Games API Yapıları
// =============================================

/// Epic OAuth token yanıtı
#[derive(Debug, Deserialize, Serialize)]
pub struct EpicTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub refresh_token: Option<String>,
    pub account_id: Option<String>,
}

/// Epic cihaz kodu yanıtı (Device Code Flow)
#[derive(Debug, Deserialize, Serialize)]
pub struct EpicDeviceCodeResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: i64,
    pub interval: i64,
}

/// Epic oyun yetkisi (entitlement)
#[derive(Debug, Deserialize, Serialize)]
pub struct EpicEntitlement {
    pub id: String,
    #[serde(rename = "entitlementName")]
    pub entitlement_name: String,
    pub namespace: String,
    #[serde(rename = "catalogItemId")]
    pub catalog_item_id: String,
    #[serde(rename = "entitlementType")]
    pub entitlement_type: Option<String>,
}

/// Epic katalog öğesi (oyun detayları)
#[derive(Debug, Deserialize, Serialize)]
pub struct EpicCatalogItem {
    pub id: String,
    pub title: Option<String>,
    pub namespace: String,
    #[serde(rename = "keyImages")]
    pub key_images: Option<Vec<EpicKeyImage>>,
}

/// Epic görsel bilgisi
#[derive(Debug, Deserialize, Serialize)]
pub struct EpicKeyImage {
    #[serde(rename = "type")]
    pub image_type: String,
    pub url: String,
}

// =============================================
// Komut Yanıt Yapıları
// =============================================

/// Senkronizasyon sonucu — frontend'e bilgi vermek için
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult {
    pub platform: String,
    pub games_added: u32,
    pub games_updated: u32,
    pub errors: Vec<String>,
}
