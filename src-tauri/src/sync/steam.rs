// sync/steam.rs — Steam Entegrasyon Motoru
// Steam Web API çağrıları ve yerel VDF/ACF dosya ayrıştırıcısı

use crate::models::{SteamOwnedGamesResponse, SteamGame};
use serde::{Deserialize, Serialize};

/// Yerel kurulu oyun bilgisi — appmanifest_*.acf dosyalarından çıkarılır
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledGameInfo {
    pub appid: String,
    pub name: String,
    pub install_dir: String,
    pub full_path: String,
}

/// Steam Web API'den sahip olunan oyunları çeker.
/// API Endpoint: IPlayerService/GetOwnedGames/v0001
/// Parametreler: key, steamid, include_appinfo, include_played_free_games
pub async fn fetch_steam_library(
    api_key: &str,
    steam_id: &str,
) -> Result<Vec<SteamGame>, String> {
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/\
         ?key={}&steamid={}&include_appinfo=true&include_played_free_games=true&format=json",
        api_key, steam_id
    );

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Steam API isteği başarısız: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Steam API hata kodu: {} — API anahtarınızı ve SteamID'nizi kontrol edin",
            response.status()
        ));
    }

    let data: SteamOwnedGamesResponse = response
        .json()
        .await
        .map_err(|e| format!("Steam JSON ayrıştırma hatası: {}", e))?;

    Ok(data.response.games.unwrap_or_default())
}

/// libraryfolders.vdf dosyasını ayrıştırarak kütüphane yollarını döndürür.
/// VDF formatı: key-value çiftleri çift tırnak içinde, hiyerarşi süslü parantezle.
/// 
/// Örnek VDF yapısı:
/// "libraryfolders"
/// {
///     "0"
///     {
///         "path"   "C:\\Program Files (x86)\\Steam"
///         ...
///     }
///     "1"
///     {
///         "path"   "D:\\SteamLibrary"
///         ...
///     }
/// }
pub fn parse_library_folders(vdf_content: &str) -> Vec<String> {
    let mut paths = Vec::new();

    for line in vdf_content.lines() {
        let trimmed = line.trim();
        // "path" anahtarını arıyoruz
        if trimmed.starts_with("\"path\"") {
            // Çift tırnak arasındaki değeri çıkar: "path"   "C:\\..."
            let parts: Vec<&str> = trimmed.split('"').collect();
            if parts.len() >= 4 {
                let path = parts[3].replace("\\\\", "\\");
                paths.push(path);
            }
        }
    }

    paths
}

/// Tek bir appmanifest_*.acf dosyasını ayrıştırır.
/// Kurulu oyunun AppID, adı ve kurulum dizinini çıkarır.
/// 
/// Örnek ACF yapısı:
/// "AppState"
/// {
///     "appid"       "440"
///     "name"        "Team Fortress 2"
///     "installdir"  "Team Fortress 2"
///     "StateFlags"  "4"
/// }
pub fn parse_app_manifest(acf_content: &str, library_path: &str) -> Option<InstalledGameInfo> {
    let mut appid = None;
    let mut name = None;
    let mut install_dir = None;

    for line in acf_content.lines() {
        let trimmed = line.trim();
        let parts: Vec<&str> = trimmed.split('"').collect();

        if parts.len() >= 4 {
            match parts[1] {
                "appid" => appid = Some(parts[3].to_string()),
                "name" => name = Some(parts[3].to_string()),
                "installdir" => install_dir = Some(parts[3].to_string()),
                _ => {}
            }
        }
    }

    // Üç alan da bulunmalı
    match (appid, name, install_dir) {
        (Some(id), Some(n), Some(dir)) => {
            let full_path = format!("{}\\steamapps\\common\\{}", library_path, dir);
            Some(InstalledGameInfo {
                appid: id,
                name: n,
                install_dir: dir,
                full_path,
            })
        }
        _ => None,
    }
}
