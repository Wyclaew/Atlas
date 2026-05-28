// sync/epic.rs — Epic Games Store Entegrasyon Motoru
// OAuth akışı ile kimlik doğrulama ve kütüphane senkronizasyonu
// Legendary CLI projesinden esinlenilen API endpoint'leri kullanılır.

use crate::models::{EpicDeviceCodeResponse, EpicTokenResponse, EpicEntitlement, EpicCatalogItem};

/// Epic Games OAuth için kullanılan sabit değerler
/// Bu client_id değerleri Epic Games'in kendi launcher'ından alınmıştır
const EPIC_CLIENT_ID: &str = "34a02cf8f4414e29b15921876da36f9a";
const EPIC_CLIENT_SECRET: &str = "daafbccc737745039dffe53d94fc76cf";
const EPIC_AUTH_BASE: &str = "https://account-public-service-prod.ol.epicgames.com";
const EPIC_CATALOG_BASE: &str = "https://catalog-public-service-prod06.ol.epicgames.com";
const EPIC_ENTITLEMENT_BASE: &str = "https://entitlement-public-service-prod08.ol.epicgames.com";

/// 1. ADIM: Cihaz kodu akışını başlatır.
/// Kullanıcıya bir doğrulama URL'i ve kod verir.
/// Kullanıcı bu URL'ye gidip kodu girdiğinde kimlik doğrulanır.
pub async fn initiate_device_code_flow() -> Result<EpicDeviceCodeResponse, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .post(&format!("{}/account/api/oauth/deviceAuthorization", EPIC_AUTH_BASE))
        .basic_auth(EPIC_CLIENT_ID, Some(EPIC_CLIENT_SECRET))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .send()
        .await
        .map_err(|e| format!("Epic cihaz kodu isteği başarısız: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Epic cihaz kodu hatası ({}): {}", status, body));
    }

    response
        .json::<EpicDeviceCodeResponse>()
        .await
        .map_err(|e| format!("Epic cihaz kodu JSON hatası: {}", e))
}

/// 2. ADIM: Cihaz kodunu kullanarak access token alır.
/// Kullanıcı doğrulamayı tamamlayana kadar bu endpoint'i poll eder.
pub async fn poll_for_token(device_code: &str) -> Result<EpicTokenResponse, String> {
    let client = reqwest::Client::new();
    
    let params = [
        ("grant_type", "device_code"),
        ("device_code", device_code),
    ];

    let response = client
        .post(&format!("{}/account/api/oauth/token", EPIC_AUTH_BASE))
        .basic_auth(EPIC_CLIENT_ID, Some(EPIC_CLIENT_SECRET))
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Epic token isteği başarısız: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Epic token hatası ({}): {}", status, body));
    }

    response
        .json::<EpicTokenResponse>()
        .await
        .map_err(|e| format!("Epic token JSON hatası: {}", e))
}

/// 3. ADIM: Kullanıcının sahip olduğu oyun yetkilerini (entitlement) çeker.
pub async fn fetch_entitlements(
    access_token: &str,
    account_id: &str,
) -> Result<Vec<EpicEntitlement>, String> {
    let client = reqwest::Client::new();
    
    let url = format!(
        "{}/entitlement/api/account/{}/entitlements?count=5000",
        EPIC_ENTITLEMENT_BASE, account_id
    );

    let response = client
        .get(&url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| format!("Epic entitlement isteği başarısız: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Epic entitlement hatası: {}", response.status()));
    }

    response
        .json::<Vec<EpicEntitlement>>()
        .await
        .map_err(|e| format!("Epic entitlement JSON hatası: {}", e))
}

/// 4. ADIM: Belirli bir oyunun katalog bilgilerini çeker (başlık, görseller vb.)
pub async fn fetch_catalog_item(
    access_token: &str,
    namespace: &str,
    catalog_item_id: &str,
) -> Result<EpicCatalogItem, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "{}/catalog/api/shared/namespace/{}/bulk/items?id={}&country=TR&locale=tr",
        EPIC_CATALOG_BASE, namespace, catalog_item_id
    );

    let response = client
        .get(&url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| format!("Epic katalog isteği başarısız: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Epic katalog hatası: {}", response.status()));
    }

    // Yanıt bir map olarak gelir: { "catalogItemId": { ... } }
    let data: std::collections::HashMap<String, EpicCatalogItem> = response
        .json()
        .await
        .map_err(|e| format!("Epic katalog JSON hatası: {}", e))?;

    data.into_values()
        .next()
        .ok_or_else(|| "Katalog öğesi bulunamadı".to_string())
}

/// Yerel Epic Games manifest dosyalarını tarar (Windows).
/// Konum: C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests\*.item
pub fn scan_local_epic_manifests() -> Result<Vec<serde_json::Value>, String> {
    let manifests_dir = "C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests";
    let mut games = Vec::new();

    if let Ok(entries) = std::fs::read_dir(manifests_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "item") {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    if let Ok(manifest) = serde_json::from_str::<serde_json::Value>(&content) {
                        games.push(manifest);
                    }
                }
            }
        }
    }

    Ok(games)
}
