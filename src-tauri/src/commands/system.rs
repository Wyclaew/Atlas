// OS-aware detection of default native-launcher install locations. Used to
// pre-fill paths and (later) scan for locally installed games.

use crate::models::PlatformPaths;
use std::path::Path;

#[tauri::command]
pub fn detect_platform_paths() -> PlatformPaths {
    let os = std::env::consts::OS.to_string();
    let mut paths = PlatformPaths {
        os: os.clone(),
        ..Default::default()
    };
    let exists = |p: &str| Path::new(p).exists();

    match os.as_str() {
        "windows" => {
            for c in [
                "C:\\Program Files (x86)\\Steam",
                "C:\\Program Files\\Steam",
                "D:\\Steam",
                "D:\\SteamLibrary",
            ] {
                if exists(c) {
                    paths.steam_path = Some(c.into());
                    break;
                }
            }
            for c in [
                "C:\\Program Files\\Epic Games",
                "C:\\Program Files (x86)\\Epic Games",
            ] {
                if exists(c) {
                    paths.epic_path = Some(c.into());
                    break;
                }
            }
            for c in ["C:\\Program Files (x86)\\GOG Galaxy", "C:\\Program Files\\GOG Galaxy"] {
                if exists(c) {
                    paths.gog_path = Some(c.into());
                    break;
                }
            }
        }
        "macos" => {
            if let Ok(home) = std::env::var("HOME") {
                let steam = format!("{home}/Library/Application Support/Steam");
                if exists(&steam) {
                    paths.steam_path = Some(steam);
                }
                let epic = format!("{home}/Library/Application Support/Epic");
                if exists(&epic) {
                    paths.epic_path = Some(epic);
                }
            }
        }
        "linux" => {
            if let Ok(home) = std::env::var("HOME") {
                for c in [
                    format!("{home}/.steam/steam"),
                    format!("{home}/.local/share/Steam"),
                ] {
                    if exists(&c) {
                        paths.steam_path = Some(c);
                        break;
                    }
                }
            }
        }
        _ => {}
    }

    paths
}
