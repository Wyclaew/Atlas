# 🎮 Game Manager (Kütüphane ve Oyun Yöneticisi)

Game Manager; Steam ve Epic Games Store kütüphanelerinizi tek bir çatı altında birleştiren, yerel kurulumlarınızı yönetmenizi sağlayan, oyun sürelerinizi takip eden ve tüm bunları son derece şık, modern ve performanslı bir arayüzle sunan çapraz platform (Windows odaklı) bir masaüstü uygulamasıdır.

Tauri v2 ve Rust backend altyapısı sayesinde minimum bellek tüketimiyle (low memory footprint) arka planda sessizce ve performansla çalışır. Frontend tarafında ise React, TypeScript ve en yeni Tailwind CSS v4 teknolojileri kullanılarak akıcı bir kullanıcı deneyimi hedeflenmiştir.

---

## ✨ Öne Çıkan Özellikler

* **🔌 Çift Platform Entegrasyonu:** Steam ve Epic Games Store hesaplarınızı bağlayarak tüm oyunlarınızı tek bir panelde listeleyin.
* **📦 Yerel Oyun Yönetimi:** Bilgisayarınızda kurulu olan oyunları otomatik tespit edin, kurulu olmayanları görüntüleyin.
* **⏱️ Süre Takibi (Playtime Tracking):** Oyun oynama sürelerinizi dakika hassasiyetinde takip edin ve toplam oynama sürenizi analiz edin.
* **⚡ Ultra Performanslı Arayüz:** `@tanstack/react-virtual` ile sanallaştırılmış oyun listesi sayesinde binlerce oyunluk kütüphanelerde bile donma olmadan akıcı kaydırma (scrolling).
* **🎨 Premium & Dinamik Tasarım:** Tailwind CSS v4 ile geliştirilmiş modern koyu tema, cam efekti (glassmorphism), yumuşak geçiş animasyonları ve kullanıcı dostu yerleşim.
* **💾 Yerel Veritabanı:** Verileriniz tamamen sizin kontrolünüzde! SQLite tabanlı Tauri SQL plugin'i ile tüm kütüphaneniz ve süreleriniz yerel olarak şifreli/güvenli bir şekilde saklanır.
* **⭐ Favoriler & Durum Yönetimi:** Oyunlarınızı favorilere ekleyin; "Oynanıyor", "Bitirildi", "İstek Listesi" veya "Kitaplıkta" gibi kategorilerle düzenleyin.

---

## 🛠️ Teknolojik Yığın

* **Backend:** Rust, Tauri v2
* **Veritabanı:** SQLite (Tauri SQL Plugin)
* **Frontend:** React.js, TypeScript, Vite
* **Tasarım & Stil:** Tailwind CSS v4, Lucide React (İkonlar)
* **Durum Yönetimi:** Zustand (Hafif ve hızlı global state)
* **Sanallaştırma:** @tanstack/react-virtual (Büyük veri kümeleri için)

---

## 📂 Proje Yapısı

Proje temel olarak iki ana bölümden oluşmaktadır:
1. **Rust Backend (`src-tauri/`):** Sistem seviyesindeki işlemleri (süre takibi, yerel uygulama başlatma, API entegrasyonları, disk taraması) gerçekleştirir.
2. **Frontend (`src/`):** Kullanıcının etkileşime girdiği modern React arayüzüdür.

```
├── src/                      # React Frontend Kaynak Kodları
│   ├── components/           # UI Bileşenleri (Layout, Games, Settings)
│   ├── hooks/                # Özel React Hook'ları (useGameLauncher, useSync)
│   ├── stores/               # Zustand Durum Yönetimi (useGameStore)
│   ├── types/                # TypeScript Tip Tanımlamaları
│   ├── App.tsx               # Ana Uygulama Bileşeni
│   └── index.css             # Tailwind CSS v4 Giriş Dosyası
│
└── src-tauri/                # Rust Backend Kaynak Kodları
    ├── capabilities/         # Tauri Yetkilendirme/Güvenlik Profilleri
    ├── migrations/           # SQLite Veritabanı Migrasyon Dosyaları
    ├── src/
    │   ├── commands/         # Tauri IPC Komut İşleyicileri (Games, Sync, Launcher)
    │   ├── sync/             # Steam ve Epic API Entegrasyon Mantığı
    │   ├── lib.rs            # Uygulama Başlangıcı ve Eklenti Tanımlamaları
    │   ├── models.rs         # Serde Modelleri ve Veri Yapıları
    │   └── main.rs           # Giriş Noktası
    └── Cargo.toml            # Rust Bağımlılıkları ve Yapılandırması
```

---

## 🚀 Başlangıç ve Kurulum

### Gereksinimler

Projenin bilgisayarınızda derlenebilmesi ve çalışabilmesi için aşağıdaki araçların yüklü olması gerekmektedir:
* **Node.js** (v18 veya üzeri önerilir)
* **Rust & Cargo** (Rust'ı yüklemek için [rustup.rs](https://rustup.rs/) adresini ziyaret edin)
* **C++ Build Tools** (Windows için derleme gereksinimleri)

### Adımlar

1. **Projeyi Klonlayın:**
   ```bash
   git clone https://github.com/Wyclaew/Game-Manager.git
   cd "Game Manager"
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme Modunda Çalıştırın:**
   Tauri geliştirme sunucusunu ve frontend sunucusunu eşzamanlı olarak başlatır:
   ```bash
   npm run tauri dev
   ```

4. **Üretim Sürümünü Derleyin (Production Build):**
   Uygulamanın optimize edilmiş `.exe` dosyasını oluşturur:
   ```bash
   npm run tauri build
   ```

---

## 🔒 Güvenlik ve İzinler

Tauri v2'nin güvenlik odaklı yapısı gereği, uygulamamızın kullandığı tüm yerel yetenekler `src-tauri/capabilities/default.json` dosyasında açıkça tanımlanmıştır:
* **SQL İzinleri:** SQLite veritabanının okunması ve yazılması için yetkilendirme.
* **Shell İzinleri:** Harici oyun dosyalarının ve URL'lerin (Steam URI'leri) açılabilmesi için `opener` yetkilendirmesi.
* **Dosya Sistemi İzinleri:** Yerel oyun dizinlerinin doğrulanması ve taranması için okuma izinleri.

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına (varsa) göz atabilirsiniz.
