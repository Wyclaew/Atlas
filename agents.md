# 🤖 AI Agent El Kitabı (AGENTS.md)

Bu dosya, projede çalışacak olan yapay zeka geliştirme ajanlarının (AI Agents) proje yapısını, mimari kararlarını, veri modellerini ve teknik borçları/yapılacakları hızlıca anlamaları ve kendilerini güncel tutabilmeleri amacıyla oluşturulmuştur.

> [!IMPORTANT]
> **Ajanlar İçin Kural:** Bu projede yapılan her büyük yapısal veya mimari değişiklikten sonra bu dosyayı güncelleyin!

---

## 📌 Proje Durumu ve Özet

* **Proje Adı:** Game Manager
* **Hedef İşlev:** Steam & Epic Games Store kütüphanelerini birleştiren, playtime takibi ve oyun başlatma yeteneklerine sahip yerel oyun kütüphanesi yöneticisi.
* **Hedef Platform:** Windows (Öncelikli) & macOS (İkincil).
* **Aktif Durum:** 
  * **Tasarım Yenilemesi (Concept A):** Matte Charcoal & Burnt Orange renk paleti uygulandı. 64px dikey çapa stili Sidebar (minimap) ile hover tooltipleri ve dikey istatistikler entegre edildi. Hover'da radial tel kafes animasyonu ve kiremit turuncu parıltı efektleri sunan premium oyun kartları hazırlandı.
  * **Hata Yönetimi ve Veritabanı:** Rust tarafında `thiserror` ve `anyhow` tabanlı merkezi hata yönetimi (`AppError`) kuruldu. SQLite üzerinde arama, platform ve favori filtrelemeleri için kompozit indeks optimizasyonları tamamlandı.
  * **Frontend:** React + TypeScript + Zustand tabanlı sanallaştırılmış modern frontend, global dynamic Toast bildirim portalı ve tema sistemiyle zenginleştirildi.
  * Proje en son tasarım ve mimari revizyonla birlikte GitHub reposuna commitlendi.


---

## 🛠️ Mimari ve Teknik Tercihler

### 1. Tauri v2 (Rust Backend & IPC)
* Neden? Düşük kaynak kullanımı, güvenli bellek yönetimi ve işletim sistemi API'lerine güvenli erişim.
* **Hata Yönetimi (`AppError`):** Rust core tarafında `thiserror` ve `anyhow` tabanlı merkezi bir hata yönetimi yapısı (`src-tauri/src/error.rs`) kullanılır. Tauri IPC üzerinden frontend'e string olarak aktarılabilmesi için `serde::Serialize` implemente edilmiştir.
* **IPC (Inter-Process Communication):** İletişim Tauri komutları (Commands) ve Tauri SQL plugin'i üzerinden sağlanır. Komut imzaları `Result<T, AppError>` tipindedir.
* **Tauri Yetenekleri (Capabilities):** `src-tauri/capabilities/default.json` altında tanımlıdır. Güvenlik kuralları gereği veritabanı ve web tarayıcı tetikleme izinleri sınırlandırılmıştır.

### 2. Frontend & Arayüz
* **React + TypeScript:** Statik tip güvenliği.
* **Tailwind CSS v4:** Vite entegrasyonu ile yerleşik CSS değişkenleri ve ultra hızlı derleme süreleri sunan en son sürüm. Renkler ve glassmorphism özellikleri tamamen vanilla CSS değişkenleriyle yönetilmektedir.
* **Zustand (`src/stores/useGameStore.ts`):** Uygulamanın global state'ini yönetir. SQLite ile senkronize çalışır. Global Toast bildirim listesi ve aktif tema bu store üzerinden yönetilir.
* **Sanallaştırma (`@tanstack/react-virtual`):** Büyük oyun listelerinin DOM'u şişirmeden performanslı bir şekilde çizilmesi için kullanılmıştır.

### 3. Veritabanı Mimarisi (SQLite)
`src-tauri/migrations/001_init.sql` dosyasındaki şema kullanılır. Ana tablolar:
* `platforms`: Platform bilgileri (Steam, Epic, Custom vb.)
* `games`: Oyun detayları (durum, favori, dosya yolları, süre bilgileri vb.)
* `play_sessions`: Oyun oynama oturumları ve süre takibi verileri.
* `settings`: Uygulama ayarları (API anahtarları, kullanıcı tercihleri vb.)
* **Performans İndeksleri:** Arama, platform, favori ve durum filtrelemelerinin anlık çalışması için `games` tablosunda kompozit indeksler (`idx_games_search`, `idx_games_platform_status`, `idx_games_favorite`) tanımlanmıştır.


---

## 🔄 Entegrasyon Akışları

### Steam Entegrasyonu
* **Yöntem:** Steam Web API.
* **Akış:** `src/hooks/useSync.ts` üzerinden tetiklenen akışta, Rust tarafındaki `sync_steam` komutu (`src-tauri/src/sync/steam.rs`) çağrılır. Kullanıcının Steam ID ve API Key bilgileriyle sahip olduğu oyunlar çekilir.
* **Çalıştırma:** `steam://run/<appid>` protokolü aracılığıyla işletim sistemi seviyesinde tetiklenir.

### Epic Games Entegrasyonu
* **Yöntem:** Epic Games OAuth / Device Code Flow.
* **Akış:** `src-tauri/src/sync/epic.rs` modülü Epic API'sine bağlanır. OAuth akışı web tabanlı giriş veya cihaz eşleştirme kodu (Device Code) ile çalışır. Oyun detayları (Catalog Items) ve görselleri Epic GraphQL/REST servislerinden çekilir.

---

## 🚨 Bilinen Durumlar ve Teknik Detaylar

1. **Rust Derleme Uyarıları ve Hataları:**
   * `SteamGame` yapısında `Serialize` trait'inin bulunmaması hatası düzeltildi (`#[derive(Debug, Deserialize, Serialize)]`).
   * `games.rs` ve `launcher.rs` dosyalarındaki kullanılmayan parametrelerin önüne alt çizgi (`_`) eklenerek derleme uyarıları (warnings) çözüldü.
   * `serde::Deserialize` ve `Serialize` için `games.rs` dosyasındaki kullanılmayan import'lar kaldırıldı.
2. **TypeScript Derleme Hataları:**
   * `Sidebar.tsx` dosyasındaki kullanılmayan `ChevronRight` import'u kaldırıldı, Vite/TypeScript derleme sorunları çözüldü.
3. **Geliştirme Ortamı:**
   * Tauri v2 çalıştırmak için yerel sistemde Tauri CLI'ın (`npm run tauri`) kullanılması gereklidir.


---

## 📋 Yapılacaklar Listesi (Backlog)

- [ ] **Epic Games OAuth Testleri:** Cihaz kodu akışının uçtan uca doğrulanması.
- [ ] **Yerel Oyun Taraması:** Windows işletim sisteminde `C:\Program Files (x86)\Steam\steamapps` dizinini otomatik tarayan Rust modülünün entegre edilmesi.
- [ ] **Arka Plan Süre İzleme:** Oyun başlatıldıktan sonra Rust backend tarafında process izleme (process monitoring) yapılarak oyun kapandığında sürenin otomatik veritabanına kaydedilmesi (şu an süreyi frontend simüle ediyor).
- [ ] **Görsel Önbellekleme:** Steam/Epic CDN'lerinden çekilen kapak görsellerinin yerel diske kaydedilerek offline modda da gösterilebilmesi.
