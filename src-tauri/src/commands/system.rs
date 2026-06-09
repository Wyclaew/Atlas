// OS-aware detection of default native-launcher install locations. Used to
// pre-fill paths and (later) scan for locally installed games.

use crate::models::{InstalledGame, PlatformPaths};
use std::fs;
use std::path::{Path, PathBuf};

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

// ---- Steam local install scan -----------------------------------------------

/// First quoted value following the first occurrence of `"key"` (VDF/ACF).
fn vdf_value(text: &str, key: &str) -> Option<String> {
    let needle = format!("\"{key}\"");
    let after_key = &text[text.find(&needle)? + needle.len()..];
    let q1 = after_key.find('"')? + 1;
    let val = &after_key[q1..];
    let q2 = val.find('"')?;
    Some(val[..q2].replace("\\\\", "\\"))
}

/// All quoted values following each `"key"` occurrence (VDF library paths).
fn vdf_all_values(text: &str, key: &str) -> Vec<String> {
    let needle = format!("\"{key}\"");
    let mut out = Vec::new();
    let mut start = 0;
    while let Some(i) = text[start..].find(&needle) {
        let abs = start + i + needle.len();
        let after = &text[abs..];
        if let Some(q1) = after.find('"') {
            let val = &after[q1 + 1..];
            if let Some(q2) = val.find('"') {
                out.push(val[..q2].replace("\\\\", "\\"));
            }
        }
        start = abs;
    }
    out
}

/// Scan all Steam library folders for installed games (appmanifest_*.acf).
#[tauri::command]
pub fn scan_steam_installs(steam_path: String) -> Vec<InstalledGame> {
    let root = PathBuf::from(&steam_path);
    let mut libraries: Vec<PathBuf> = vec![root.clone()];

    for rel in ["steamapps/libraryfolders.vdf", "config/libraryfolders.vdf"] {
        if let Ok(text) = fs::read_to_string(root.join(rel)) {
            for p in vdf_all_values(&text, "path") {
                libraries.push(PathBuf::from(p));
            }
        }
    }
    libraries.sort();
    libraries.dedup();

    let mut out = Vec::new();
    for lib in libraries {
        let apps = lib.join("steamapps");
        let Ok(entries) = fs::read_dir(&apps) else { continue };
        for entry in entries.flatten() {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            if name.starts_with("appmanifest_") && name.ends_with(".acf") {
                if let Ok(text) = fs::read_to_string(entry.path()) {
                    if let Some(appid) = vdf_value(&text, "appid") {
                        out.push(InstalledGame {
                            external_id: appid,
                            install_dir: vdf_value(&text, "installdir").unwrap_or_default(),
                        });
                    }
                }
            }
        }
    }
    out
}
