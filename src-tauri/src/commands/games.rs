// commands/games.rs — Oyun CRUD Tauri Komutları
// Frontend'den invoke() ile çağrılan veritabanı işlemleri

/// Tüm oyunları platform bilgisiyle birlikte getirir.
/// Frontend'deki loadGames() fonksiyonu bu komutu çağırır.
#[tauri::command]
pub async fn get_all_games() -> Result<String, String> {
    // NOT: Gerçek veritabanı sorgusu frontend tarafında @tauri-apps/plugin-sql
    // üzerinden yapılır. Bu komut, Rust tarafında özel iş mantığı gerektiren
    // durumlar için bir yedek endpoint görevi görür.
    // Frontend doğrudan SQLite plugin'i ile sorgulama yapabilir.
    Ok("[]".to_string())
}

/// Oyunun durumunu günceller (Backlog, Playing, Completed vb.)
#[tauri::command]
pub async fn update_game_status(_game_id: i64, _status: String) -> Result<(), String> {
    // Bu komut ileride Rust-side validation eklendiğinde kullanılacak
    // Şu an frontend doğrudan SQL plugin üzerinden güncelleme yapar
    Ok(())
}

/// Oyunun favori durumunu değiştirir
#[tauri::command]
pub async fn toggle_favorite(_game_id: i64) -> Result<(), String> {
    Ok(())
}
