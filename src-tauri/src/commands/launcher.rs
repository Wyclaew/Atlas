// commands/launcher.rs — Oyun Başlatma Tauri Komutları
// Steam URI scheme ve doğrudan executable çalıştırma desteği

use tauri_plugin_opener::OpenerExt;

/// Oyunu platformuna göre başlatır.
/// - Steam: steam://run/<appid> URI scheme kullanır
/// - Epic/Custom: Doğrudan executable dosyasını çalıştırır
#[tauri::command]
pub async fn launch_game(
    app: tauri::AppHandle,
    platform: String,
    external_id: String,
    executable_path: Option<String>,
) -> Result<String, String> {
    match platform.as_str() {
        "Steam" => {
            // Steam URI scheme ile oyunu başlat
            let uri = format!("steam://run/{}", external_id);
            app.opener()
                .open_url(&uri, None::<&str>)
                .map_err(|e| format!("Steam URI açılamadı: {}", e))?;
            Ok(format!("Steam oyunu başlatıldı: AppID {}", external_id))
        }
        "Epic" | "Custom" => {
            // Doğrudan executable çalıştır
            if let Some(exe) = executable_path {
                std::process::Command::new(&exe)
                    .spawn()
                    .map_err(|e| format!("Oyun başlatılamadı ({}): {}", exe, e))?;
                Ok(format!("Oyun başlatıldı: {}", exe))
            } else {
                Err("Çalıştırılabilir dosya yolu belirtilmedi".into())
            }
        }
        _ => Err(format!("Bilinmeyen platform: {}", platform)),
    }
}

/// Oyun oturum süresini kaydeder.
/// Oyun kapandığında frontend bu komutu çağırarak süreyi veritabanına yazar.
#[tauri::command]
pub async fn track_play_session(
    _game_id: i64,
    _duration_minutes: i64,
) -> Result<(), String> {
    // Playtime tracking — frontend tarafında SQL plugin ile yönetilir
    // Bu komut ileride Rust-side process monitoring eklendiğinde kullanılacak
    Ok(())
}
