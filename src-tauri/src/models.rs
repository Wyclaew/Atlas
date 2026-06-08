// Normalized, platform-agnostic data shapes returned to the frontend.
// Every connector maps its raw API into these so the UI/storage layer is
// identical regardless of the source platform.

use serde::{Deserialize, Serialize};

/// A single owned game, normalized across platforms.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizedGame {
    pub external_id: String,
    pub title: String,
    pub cover_url: Option<String>,
    pub hero_url: Option<String>,
    pub logo_url: Option<String>,
    pub icon_url: Option<String>,
    pub playtime_minutes: i64,
    pub playtime_2weeks_minutes: i64,
    pub last_played_unix: Option<i64>, // unix seconds; frontend formats
    pub is_installed: bool,
}

/// Result of connecting / validating a platform account.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub external_id: String,
    pub label: String,
    pub avatar_url: Option<String>,
}

/// A single achievement, normalized.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizedAchievement {
    pub api_name: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon_url: Option<String>,
    pub icon_locked_url: Option<String>,
    pub unlocked: bool,
    pub unlock_time_unix: Option<i64>, // unix seconds; frontend formats
    pub global_percent: Option<f64>,
}

/// Achievement summary + detail for one game.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AchievementSet {
    pub unlocked: i64,
    pub total: i64,
    pub items: Vec<NormalizedAchievement>,
}

/// Detected default install locations for native launchers, per OS.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PlatformPaths {
    pub os: String,
    pub steam_path: Option<String>,
    pub epic_path: Option<String>,
    pub gog_path: Option<String>,
}
