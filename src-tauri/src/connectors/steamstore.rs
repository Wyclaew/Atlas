// Steam storefront connector — the unofficial store.steampowered.com/api.
// Used for deals/specials, search and full app details (price, art, blurb).
// No API key required. Prices are in cents.

use crate::error::{AppError, AppResult};
use crate::models::{FeaturedStore, StoreApp, StoreListing};
use serde_json::Value;

const STORE: &str = "https://store.steampowered.com/api";
const CDN: &str = "https://cdn.cloudflare.steamstatic.com/steam/apps";

fn cover(appid: &str) -> String {
    format!("{CDN}/{appid}/library_600x900_2x.jpg")
}

/// Parse a `featuredcategories` item (specials/new_releases/top_sellers).
fn listing_from_featured(item: &Value) -> Option<StoreListing> {
    let id = item["id"].as_i64()?.to_string();
    Some(StoreListing {
        title: item["name"].as_str().unwrap_or("Unknown").to_string(),
        cover_url: Some(cover(&id)),
        header_url: item["header_image"]
            .as_str()
            .or_else(|| item["large_capsule_image"].as_str())
            .map(|s| s.to_string()),
        final_cents: item["final_price"].as_i64(),
        initial_cents: item["original_price"].as_i64().or_else(|| item["final_price"].as_i64()),
        discount_pct: item["discount_percent"].as_i64(),
        currency: item["currency"].as_str().map(|s| s.to_string()),
        is_free: item["final_price"].as_i64() == Some(0) && item["discounted"].as_bool() != Some(true),
        external_id: id,
    })
}

fn collect(body: &Value, key: &str) -> Vec<StoreListing> {
    body[key]["items"]
        .as_array()
        .map(|arr| arr.iter().filter_map(listing_from_featured).collect())
        .unwrap_or_default()
}

pub async fn featured(client: &reqwest::Client, cc: &str) -> AppResult<FeaturedStore> {
    let url = format!("{STORE}/featuredcategories/?cc={cc}&l=english");
    let body: Value = client.get(url).send().await?.json().await?;
    Ok(FeaturedStore {
        specials: collect(&body, "specials"),
        new_releases: collect(&body, "new_releases"),
        top_sellers: collect(&body, "top_sellers"),
    })
}

pub async fn search(client: &reqwest::Client, term: &str, cc: &str) -> AppResult<Vec<StoreListing>> {
    let url = format!("{STORE}/storesearch/?term={}&cc={cc}&l=english", urlencode(term));
    let body: Value = client.get(url).send().await?.json().await?;
    let items = body["items"].as_array().cloned().unwrap_or_default();

    let out = items
        .iter()
        .filter_map(|it| {
            let id = it["id"].as_i64()?.to_string();
            let price = &it["price"];
            Some(StoreListing {
                title: it["name"].as_str().unwrap_or("Unknown").to_string(),
                cover_url: Some(cover(&id)),
                header_url: it["tiny_image"].as_str().map(|s| s.to_string()),
                final_cents: price["final"].as_i64(),
                initial_cents: price["initial"].as_i64().or_else(|| price["final"].as_i64()),
                discount_pct: None,
                currency: price["currency"].as_str().map(|s| s.to_string()),
                is_free: price.is_null(),
                external_id: id,
            })
        })
        .collect();
    Ok(out)
}

pub async fn app_details(client: &reqwest::Client, appid: &str, cc: &str) -> AppResult<StoreApp> {
    let url = format!("{STORE}/appdetails?appids={appid}&cc={cc}&l=english");
    let body: Value = client.get(url).send().await?.json().await?;
    let node = &body[appid];
    if node["success"].as_bool() != Some(true) {
        return Err(AppError::NotFound("Store page not available for this title.".into()));
    }
    let d = &node["data"];
    let price = &d["price_overview"];

    Ok(StoreApp {
        external_id: appid.to_string(),
        title: d["name"].as_str().unwrap_or("Unknown").to_string(),
        description: d["short_description"].as_str().map(|s| s.to_string()),
        header_url: d["header_image"].as_str().map(|s| s.to_string()),
        cover_url: Some(cover(appid)),
        screenshots: d["screenshots"]
            .as_array()
            .map(|a| a.iter().filter_map(|s| s["path_full"].as_str().map(String::from)).take(8).collect())
            .unwrap_or_default(),
        final_cents: price["final"].as_i64(),
        initial_cents: price["initial"].as_i64(),
        discount_pct: price["discount_percent"].as_i64(),
        currency: price["currency"].as_str().map(|s| s.to_string()),
        is_free: d["is_free"].as_bool().unwrap_or(false),
        release_date: d["release_date"]["date"].as_str().map(|s| s.to_string()),
        developers: d["developers"]
            .as_array()
            .map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect())
            .unwrap_or_default(),
        genres: d["genres"]
            .as_array()
            .map(|a| a.iter().filter_map(|x| x["description"].as_str().map(String::from)).collect())
            .unwrap_or_default(),
    })
}

/// Minimal percent-encoding for the search term (spaces and a few specials).
fn urlencode(s: &str) -> String {
    s.bytes()
        .map(|b| match b {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}
