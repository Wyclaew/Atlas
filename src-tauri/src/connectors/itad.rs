// IsThereAnyDeal (ITAD) connector — cross-store price comparison + all-time low.
// Requires a free API key (user pastes it in Settings). v2 API.

use crate::error::AppResult;
use crate::models::{PriceComparison, PriceQuote};
use serde_json::{json, Value};

const API: &str = "https://api.isthereanydeal.com";

/// Resolve a Steam appid to an ITAD game id.
async fn lookup(client: &reqwest::Client, key: &str, appid: &str) -> AppResult<Option<String>> {
    let url = format!("{API}/games/lookup/v1?key={key}&appid={appid}");
    let body: Value = client.get(url).send().await?.json().await?;
    if body["found"].as_bool() == Some(true) {
        Ok(body["game"]["id"].as_str().map(|s| s.to_string()))
    } else {
        Ok(None)
    }
}

/// Current deals across shops + all-time low for one Steam game.
pub async fn game_prices(
    client: &reqwest::Client,
    key: &str,
    appid: &str,
    country: &str,
) -> AppResult<PriceComparison> {
    let Some(id) = lookup(client, key, appid).await? else {
        return Ok(PriceComparison::default());
    };

    let mut out = PriceComparison {
        itad_id: Some(id.clone()),
        ..Default::default()
    };

    // Current prices/deals per shop.
    let prices_url = format!("{API}/games/prices/v2?key={key}&country={country}&deals=true");
    if let Ok(resp) = client.post(&prices_url).json(&json!([id])).send().await {
        if let Ok(body) = resp.json::<Value>().await {
            if let Some(entry) = body.as_array().and_then(|a| a.first()) {
                if let Some(deals) = entry["deals"].as_array() {
                    for d in deals {
                        let price_cents = d["price"]["amountInt"].as_i64();
                        let url = d["url"].as_str();
                        let shop = d["shop"]["name"].as_str();
                        if let (Some(price_cents), Some(url), Some(shop)) = (price_cents, url, shop) {
                            out.deals.push(PriceQuote {
                                shop: shop.to_string(),
                                price_cents,
                                regular_cents: d["regular"]["amountInt"].as_i64().unwrap_or(price_cents),
                                cut: d["cut"].as_i64().unwrap_or(0),
                                currency: d["price"]["currency"].as_str().unwrap_or("USD").to_string(),
                                url: url.to_string(),
                            });
                        }
                    }
                }
            }
        }
    }
    out.deals.sort_by_key(|q| q.price_cents);

    // All-time historical low.
    let low_url = format!("{API}/games/historylow/v2?key={key}&country={country}");
    if let Ok(resp) = client.post(&low_url).json(&json!([id])).send().await {
        if let Ok(body) = resp.json::<Value>().await {
            if let Some(entry) = body.as_array().and_then(|a| a.first()) {
                out.lowest_cents = entry["low"]["amountInt"].as_i64();
                out.lowest_currency = entry["low"]["currency"].as_str().map(|s| s.to_string());
            }
        }
    }

    Ok(out)
}
