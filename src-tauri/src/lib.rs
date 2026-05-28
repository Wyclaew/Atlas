// lib.rs — Tauri Uygulama Giriş Noktası
// Tüm plugin'lerin kaydı, veritabanı migrasyonları ve komut handler'ları burada yapılır.
// Bu dosya uygulamanın Rust tarafının kalbidir.

use tauri_plugin_sql::{Migration, MigrationKind};

mod commands;
mod models;
mod sync;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Veritabanı migrasyonları — uygulama ilk açıldığında otomatik çalışır
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/001_init.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        // ==========================================
        // Plugin Kayıtları
        // ==========================================
        // SQLite veritabanı — migrasyon desteği ile
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:gamemanager.db", migrations)
                .build(),
        )
        // Shell — harici süreç çalıştırma (oyun başlatma)
        .plugin(tauri_plugin_shell::init())
        // Opener — URL/URI scheme açma (steam:// protokolü)
        .plugin(tauri_plugin_opener::init())
        // Filesystem — yerel dosya okuma (VDF/ACF dosyaları)
        .plugin(tauri_plugin_fs::init())
        // ==========================================
        // Tauri Komut Handler'ları
        // Frontend'den invoke() ile çağrılabilir komutlar
        // ==========================================
        .invoke_handler(tauri::generate_handler![
            // Oyun CRUD işlemleri
            commands::games::get_all_games,
            commands::games::update_game_status,
            commands::games::toggle_favorite,
            // Platform senkronizasyonu
            commands::sync::sync_steam_library,
            commands::sync::sync_local_installations,
            // Oyun başlatma ve oturum takibi
            commands::launcher::launch_game,
            commands::launcher::track_play_session,
        ])
        .run(tauri::generate_context!())
        .expect("Tauri uygulaması başlatılırken hata oluştu");
}
