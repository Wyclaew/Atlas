// Steam connector — official Steam Web API.
//
// Read-only: owned games + playtime, recently played, and per-game achievements.
// Launching/installing is handed off to the Steam client via steam:// URIs
// (see connectors::launch_uri). Cover art is built from the appid against the
// Steam CDN; no API call needed.

use crate::error::{AppError, AppResult};
use crate::models::{AccountInfo, AchievementSet, NormalizedAchievement, NormalizedGame};
use serde_json::Value;

const API: &str = "https://api.steampowered.com";
const CDN: &str = "https://cdn.cloudflare.steamstatic.com/steam/apps";

// ---- Artwork helpers (constructed from appid) --------------------------------

fn cover_url(appid: &str) -> String {
    format!("{CDN}/{appid}/library_600x900_2x.jpg")
}
fn hero_url(appid: &str) -> String {
    format!("{CDN}/{appid}/library_hero.jpg")
}
fn logo_url(appid: &str) -> String {
    format!("{CDN}/{appid}/logo.png")
}
fn icon_url(appid: &str, hash: &str) -> Option<String> {
    if hash.is_empty() {
        None
    } else {
        Some(format!(
            "https://media.steampowered.com/steamcommunity/public/images/apps/{appid}/{hash}.jpg"
        ))
    }
}

// ---- Account ----------------------------------------------------------------

/// True when the string is a 17-digit SteamID64.
fn looks_like_steamid64(s: &str) -> bool {
    s.len() == 17 && s.chars().all(|c| c.is_ascii_digit())
}

/// Resolve a vanity name to a SteamID64, or pass through an existing id.
pub async fn resolve_steam_id(
    client: &reqwest::Client,
    api_key: &str,
    input: &str,
) -> AppResult<String> {
    let input = input.trim();
    if looks_like_steamid64(input) {
        return Ok(input.to_string());
    }
    // Allow pasting a full profile URL.
    let vanity = input
        .trim_end_matches('/')
        .rsplit('/')
        .next()
        .unwrap_or(input);

    let url = format!("{API}/ISteamUser/ResolveVanityURL/v1/?key={api_key}&vanityurl={vanity}");
    let body: Value = client.get(url).send().await?.json().await?;
    let resp = &body["response"];
    match resp["success"].as_i64() {
        Some(1) => resp["steamid"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| AppError::Parse("missing steamid".into())),
        _ => Err(AppError::NotFound(format!(
            "Could not resolve Steam profile \"{input}\". Use your SteamID64 or vanity name."
        ))),
    }
}

/// Validate the key + id and return basic profile info.
pub async fn connect(
    client: &reqwest::Client,
    api_key: &str,
    steam_input: &str,
) -> AppResult<AccountInfo> {
    if api_key.trim().is_empty() {
        return Err(AppError::Input("Steam API key is required.".into()));
    }
    let steam_id = resolve_steam_id(client, api_key, steam_input).await?;

    let url =
        format!("{API}/ISteamUser/GetPlayerSummaries/v2/?key={api_key}&steamids={steam_id}");
    let body: Value = client.get(url).send().await.map_err(|e| {
        AppError::Api(format!("Steam rejected the request (check your API key). {e}"))
    })?
    .json()
    .await?;

    let player = body["response"]["players"]
        .get(0)
        .ok_or_else(|| AppError::NotFound("Steam profile not found.".into()))?;

    Ok(AccountInfo {
        external_id: steam_id,
        label: player["personaname"]
            .as_str()
            .unwrap_or("Steam user")
            .to_string(),
        avatar_url: player["avatarfull"].as_str().map(|s| s.to_string()),
    })
}

// ---- Library ----------------------------------------------------------------

pub async fn fetch_library(
    client: &reqwest::Client,
    api_key: &str,
    steam_id: &str,
) -> AppResult<Vec<NormalizedGame>> {
    let url = format!(
        "{API}/IPlayerService/GetOwnedGames/v1/?key={api_key}&steamid={steam_id}\
         &include_appinfo=1&include_played_free_games=1&format=json"
    );
    let body: Value = client.get(url).send().await?.json().await?;

    let games = body["response"]["games"].as_array().ok_or_else(|| {
        AppError::Api(
            "No games returned. Make sure your Steam profile's game details are set to Public."
                .into(),
        )
    })?;

    // Recently played gives us the 2-week playtime per app.
    let recent = fetch_recent_playtime(client, api_key, steam_id)
        .await
        .unwrap_or_default();

    let mut out = Vec::with_capacity(games.len());
    for g in games {
        let appid = match g["appid"].as_i64() {
            Some(id) => id.to_string(),
            None => continue,
        };
        let icon_hash = g["img_icon_url"].as_str().unwrap_or("");
        let two_weeks = recent
            .iter()
            .find(|(id, _)| *id == appid)
            .map(|(_, m)| *m)
            .unwrap_or(0);

        out.push(NormalizedGame {
            external_id: appid.clone(),
            title: g["name"].as_str().unwrap_or("Unknown title").to_string(),
            cover_url: Some(cover_url(&appid)),
            hero_url: Some(hero_url(&appid)),
            logo_url: Some(logo_url(&appid)),
            icon_url: icon_url(&appid, icon_hash),
            playtime_minutes: g["playtime_forever"].as_i64().unwrap_or(0),
            playtime_2weeks_minutes: two_weeks,
            last_played_unix: g["rtime_last_played"].as_i64().filter(|t| *t > 0),
            is_installed: false,
        });
    }

    Ok(out)
}

/// (appid, 2-week minutes) pairs.
async fn fetch_recent_playtime(
    client: &reqwest::Client,
    api_key: &str,
    steam_id: &str,
) -> AppResult<Vec<(String, i64)>> {
    let url =
        format!("{API}/IPlayerService/GetRecentlyPlayedGames/v1/?key={api_key}&steamid={steam_id}");
    let body: Value = client.get(url).send().await?.json().await?;
    let mut out = Vec::new();
    if let Some(arr) = body["response"]["games"].as_array() {
        for g in arr {
            if let Some(id) = g["appid"].as_i64() {
                out.push((id.to_string(), g["playtime_2weeks"].as_i64().unwrap_or(0)));
            }
        }
    }
    Ok(out)
}

// ---- Achievements -----------------------------------------------------------

pub async fn fetch_achievements(
    client: &reqwest::Client,
    api_key: &str,
    steam_id: &str,
    appid: &str,
) -> AppResult<AchievementSet> {
    // 1) The player's unlock state for this game.
    let url = format!(
        "{API}/ISteamUserStats/GetPlayerAchievements/v1/?key={api_key}&steamid={steam_id}&appid={appid}&l=english"
    );
    let player: Value = client.get(url).send().await?.json().await?;

    // Many games simply have no achievements / no stats -> treat as empty set.
    let player_list = match player["playerstats"]["achievements"].as_array() {
        Some(list) => list,
        None => {
            return Ok(AchievementSet {
                unlocked: 0,
                total: 0,
                items: vec![],
            })
        }
    };

    // 2) Schema for names / icons (best-effort).
    let schema = fetch_schema(client, api_key, appid).await.unwrap_or_default();
    // 3) Global rarity (best-effort).
    let globals = fetch_global_percent(client, appid).await.unwrap_or_default();

    let mut items = Vec::with_capacity(player_list.len());
    let mut unlocked = 0i64;

    for a in player_list {
        let api_name = a["apiname"].as_str().unwrap_or("").to_string();
        if api_name.is_empty() {
            continue;
        }
        let is_unlocked = a["achieved"].as_i64().unwrap_or(0) == 1;
        if is_unlocked {
            unlocked += 1;
        }

        let meta = schema.iter().find(|s| s.api_name == api_name);
        items.push(NormalizedAchievement {
            api_name: api_name.clone(),
            // Prefer player payload's display name, fall back to schema.
            name: a["name"]
                .as_str()
                .map(|s| s.to_string())
                .or_else(|| meta.and_then(|m| m.name.clone())),
            description: a["description"]
                .as_str()
                .map(|s| s.to_string())
                .or_else(|| meta.and_then(|m| m.description.clone())),
            icon_url: meta.and_then(|m| m.icon.clone()),
            icon_locked_url: meta.and_then(|m| m.icon_gray.clone()),
            unlocked: is_unlocked,
            unlock_time_unix: a["unlocktime"].as_i64().filter(|t| *t > 0),
            global_percent: globals.iter().find(|(n, _)| *n == api_name).map(|(_, p)| *p),
        });
    }

    let total = items.len() as i64;
    Ok(AchievementSet {
        unlocked,
        total,
        items,
    })
}

#[derive(Default)]
struct SchemaAch {
    api_name: String,
    name: Option<String>,
    description: Option<String>,
    icon: Option<String>,
    icon_gray: Option<String>,
}

async fn fetch_schema(
    client: &reqwest::Client,
    api_key: &str,
    appid: &str,
) -> AppResult<Vec<SchemaAch>> {
    let url =
        format!("{API}/ISteamUserStats/GetSchemaForGame/v2/?key={api_key}&appid={appid}&l=english");
    let body: Value = client.get(url).send().await?.json().await?;
    let mut out = Vec::new();
    if let Some(arr) =
        body["game"]["availableGameStats"]["achievements"].as_array()
    {
        for a in arr {
            out.push(SchemaAch {
                api_name: a["name"].as_str().unwrap_or("").to_string(),
                name: a["displayName"].as_str().map(|s| s.to_string()),
                description: a["description"].as_str().map(|s| s.to_string()),
                icon: a["icon"].as_str().map(|s| s.to_string()),
                icon_gray: a["icongray"].as_str().map(|s| s.to_string()),
            });
        }
    }
    Ok(out)
}

async fn fetch_global_percent(
    client: &reqwest::Client,
    appid: &str,
) -> AppResult<Vec<(String, f64)>> {
    let url = format!(
        "{API}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid={appid}&format=json"
    );
    let body: Value = client.get(url).send().await?.json().await?;
    let mut out = Vec::new();
    if let Some(arr) = body["achievementpercentages"]["achievements"].as_array() {
        for a in arr {
            if let (Some(n), Some(p)) = (a["name"].as_str(), a["percent"].as_f64()) {
                out.push((n.to_string(), p));
            }
        }
    }
    Ok(out)
}
