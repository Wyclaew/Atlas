// Connector layer.
//
// Each platform lives in its own module and exposes a consistent set of async
// functions, the "connector contract":
//
//   connect(client, creds...)            -> AccountInfo        (validate + identify)
//   fetch_library(client, creds...)      -> Vec<NormalizedGame>
//   fetch_achievements(client, creds..)  -> AchievementSet
//
// Adding a platform = add a module here that follows the same shape, then wire
// commands in `commands/`. Launch/install/store URIs are dispatched by
// `platform_key` in `launch_uri` below so the frontend stays platform-agnostic.

pub mod itad;
pub mod steam;
pub mod steamstore;

/// Build the shared HTTP client used by every connector.
pub fn http_client() -> reqwest::Client {
    reqwest::Client::builder()
        .user_agent("Atlas/0.2 (+https://github.com/Wyclaew/Game-Manager)")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .unwrap_or_default()
}

/// What kind of external action the frontend is asking for.
pub enum UriKind {
    Launch,
    Install,
    Store,
}

/// Resolve a platform action into a URI the OS can open (native client handoff).
/// Returns None when the platform has no URI scheme for that action.
pub fn launch_uri(platform_key: &str, external_id: &str, kind: UriKind) -> Option<String> {
    match platform_key {
        "steam" => Some(match kind {
            UriKind::Launch => format!("steam://rungameid/{external_id}"),
            UriKind::Install => format!("steam://install/{external_id}"),
            UriKind::Store => format!("https://store.steampowered.com/app/{external_id}"),
        }),
        "epic" => match kind {
            // com.epicgames.launcher://apps/<id>?action=launch|install
            UriKind::Launch => Some(format!(
                "com.epicgames.launcher://apps/{external_id}?action=launch&silent=true"
            )),
            UriKind::Install => Some(format!(
                "com.epicgames.launcher://apps/{external_id}?action=install"
            )),
            UriKind::Store => Some(format!(
                "https://store.epicgames.com/p/{external_id}"
            )),
        },
        "gog" => match kind {
            UriKind::Launch => Some(format!("goggalaxy://openGameView/{external_id}")),
            UriKind::Store => Some(format!("https://www.gog.com/game/{external_id}")),
            UriKind::Install => None,
        },
        _ => None,
    }
}
