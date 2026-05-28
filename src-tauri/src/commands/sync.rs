// commands/sync.rs — Platform Senkronizasyon Tauri Komutları
// Steam ve Epic kütüphanelerini senkronize eder

use crate::sync;

/// Steam kütüphanesini Web API üzerinden senkronize eder.
/// Kullanıcının Steam API Key ve SteamID64 bilgilerini gerektirir.
/// Arka planda çalışır ve UI thread'i engellemez.
#[tauri::command]
pub async fn sync_steam_library(
    api_key: String,
    steam_id: String,
) -> Result<String, String> {
    // Steam Web API'den oyun listesini çek
    let games = sync::steam::fetch_steam_library(&api_key, &steam_id).await?;

    // Oyunları JSON olarak döndür — frontend bunları DB'ye yazacak
    let json = serde_json::to_string(&games)
        .map_err(|e| format!("JSON serileştirme hatası: {}", e))?;

    Ok(json)
}

/// Yerel Steam kurulumlarını tarar.
/// libraryfolders.vdf dosyasını okuyarak kurulu oyunları tespit eder.
#[tauri::command]
pub async fn sync_local_installations(
    steam_path: Option<String>,
) -> Result<String, String> {
    // Windows için varsayılan Steam yolu
    let default_path = "C:\\Program Files (x86)\\Steam".to_string();
    let base_path = steam_path.unwrap_or(default_path);

    // libraryfolders.vdf dosyasını oku
    let vdf_path = format!("{}\\steamapps\\libraryfolders.vdf", base_path);
    let vdf_content = std::fs::read_to_string(&vdf_path)
        .map_err(|e| format!("VDF dosyası okunamadı ({}): {}", vdf_path, e))?;

    // Kütüphane klasörlerini ayrıştır
    let library_paths = sync::steam::parse_library_folders(&vdf_content);

    // Her kütüphane klasöründeki appmanifest dosyalarını tara
    let mut installed_games = Vec::new();
    for lib_path in &library_paths {
        let steamapps_dir = format!("{}\\steamapps", lib_path);
        if let Ok(entries) = std::fs::read_dir(&steamapps_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name().to_string_lossy().to_string();
                if file_name.starts_with("appmanifest_") && file_name.ends_with(".acf") {
                    if let Ok(content) = std::fs::read_to_string(entry.path()) {
                        if let Some(info) = sync::steam::parse_app_manifest(&content, lib_path) {
                            installed_games.push(info);
                        }
                    }
                }
            }
        }
    }

    let json = serde_json::to_string(&installed_games)
        .map_err(|e| format!("JSON serileştirme hatası: {}", e))?;

    Ok(json)
}
