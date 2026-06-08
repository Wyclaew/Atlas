// Atlas — Tauri application entry point.
// Registers plugins, runs the local-cache migrations, and exposes commands.

use tauri_plugin_sql::{Migration, MigrationKind};

mod commands;
mod connectors;
pub mod error;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "init",
        sql: include_str!("../migrations/001_init.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        // Local SQLite cache (with migrations). Fresh db name avoids clashing
        // with any stale schema from previous builds.
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:atlas.db", migrations)
                .build(),
        )
        // Opener — hand off steam:// / store URLs to the OS.
        .plugin(tauri_plugin_opener::init())
        // Shell — reserved for future native-launcher invocations.
        .plugin(tauri_plugin_shell::init())
        // Shared HTTP client for every connector.
        .manage(connectors::http_client())
        .invoke_handler(tauri::generate_handler![
            commands::accounts::connect_steam,
            commands::sync::sync_steam_library,
            commands::sync::fetch_steam_achievements,
            commands::launch::launch_game,
            commands::launch::install_game,
            commands::launch::open_store_page,
            commands::system::detect_platform_paths,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Atlas");
}
