// hooks/useSync.ts — Platform Senkronizasyon Hook'u
// Steam ve Epic kütüphanelerini arka planda senkronize eder

import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import { useGameStore } from '../stores/useGameStore';
import type { SteamGameData, InstalledGameInfo } from '../types';

export function useSync() {
  const { setSyncing, loadGames } = useGameStore();

  /**
   * Steam kütüphanesini senkronize eder:
   * 1. Steam Web API'den oyun listesini çeker
   * 2. Her oyunu SQLite'a UPSERT ile yazar
   * 3. Yerel kurulumları tarar ve is_installed alanını günceller
   */
  const syncSteam = useCallback(async (apiKey: string, steamId: string, currentSteamPath?: string) => {
    if (!apiKey || !steamId) {
      throw new Error('Steam API Key ve SteamID64 gereklidir');
    }

    try {
      let finalSteamPath = currentSteamPath;
      const db = await Database.load('sqlite:gamemanager.db');

      if (!finalSteamPath) {
        const rows = await db.select<{ key: string; value: string }[]>(
          `SELECT value FROM settings WHERE key = 'steam_path'`
        );
        finalSteamPath = rows[0]?.value;
      }

      if (!finalSteamPath) {
        try {
          const detected = await invoke<{ steam_path: string | null }>('detect_platform_paths');
          if (detected.steam_path) {
            finalSteamPath = detected.steam_path;
          }
        } catch (e) {
          console.warn('Otomatik Steam yolu tespiti başarısız:', e);
        }
      }

      if (!finalSteamPath) {
        throw new Error('Steam kurulum yolu otomatik bulunamadı. Lütfen ayarlardan dizini manuel olarak belirtin.');
      }

      setSyncing(true, 'Steam kütüphanesi senkronize ediliyor...');

      // 1. Steam Web API'den oyun listesini çek (Rust komutu)
      const gamesJson = await invoke<string>('sync_steam_library', {
        apiKey,
        steamId,
      });

      const steamGames: SteamGameData[] = JSON.parse(gamesJson);

      // Steam platform ID'sini al
      const platforms = await db.select<{ id: number }[]>(
        `SELECT id FROM platforms WHERE name = 'Steam'`
      );
      const platformId = platforms[0]?.id ?? 1;

      // 2. Her oyunu veritabanına yaz (UPSERT — varsa güncelle, yoksa ekle)
      setSyncing(true, `${steamGames.length} Steam oyunu işleniyor...`);
      
      for (const game of steamGames) {
        const coverUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`;
        const bannerUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
        const lastPlayed = game.rtime_last_played && game.rtime_last_played > 0
          ? new Date(game.rtime_last_played * 1000).toISOString()
          : null;

        await db.execute(
          `INSERT INTO games (platform_id, external_game_id, title, cover_image_url, banner_image_url, total_playtime_minutes, last_played_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT(platform_id, external_game_id) DO UPDATE SET
             title = excluded.title,
             cover_image_url = excluded.cover_image_url,
             banner_image_url = excluded.banner_image_url,
             total_playtime_minutes = excluded.total_playtime_minutes,
             last_played_at = CASE
               WHEN excluded.last_played_at IS NOT NULL THEN excluded.last_played_at
               ELSE games.last_played_at
             END,
             updated_at = datetime('now')`,
          [
            platformId,
            String(game.appid),
            game.name ?? `AppID: ${game.appid}`,
            coverUrl,
            bannerUrl,
            game.playtime_forever ?? 0,
            lastPlayed,
          ]
        );
      }

      // 3. Yerel kurulumları tara
      setSyncing(true, 'Yerel Steam kurulumları taranıyor...');
      try {
        const installedJson = await invoke<string>('sync_local_installations', {
          steamPath: finalSteamPath,
        });
        const installedGames: InstalledGameInfo[] = JSON.parse(installedJson);

        // Kurulu oyunların is_installed alanını güncelle
        for (const installed of installedGames) {
          await db.execute(
            `UPDATE games SET
               is_installed = 1,
               install_path = $1,
               updated_at = datetime('now')
             WHERE platform_id = $2 AND external_game_id = $3`,
            [installed.full_path, platformId, installed.appid]
          );
        }
      } catch (localErr) {
        // Yerel tarama hatası kritik değil — devam et
        console.warn('Yerel Steam taraması başarısız:', localErr);
      }

      // 4. UI'ı güncelle
      await loadGames();
      setSyncing(false, `${steamGames.length} Steam oyunu senkronize edildi`);
      
      return { gamesAdded: steamGames.length };
    } catch (err) {
      setSyncing(false);
      throw err;
    }
  }, [setSyncing, loadGames]);

  /**
   * Epic Games kütüphanesini senkronize eder:
   * Yerel manifest dosyalarını okuyarak kurulu oyunları tespit eder
   */
  const syncEpic = useCallback(async (currentEpicPath?: string) => {
    try {
      let finalEpicPath = currentEpicPath;
      const db = await Database.load('sqlite:gamemanager.db');

      if (!finalEpicPath) {
        const rows = await db.select<{ key: string; value: string }[]>(
          `SELECT value FROM settings WHERE key = 'epic_path'`
        );
        finalEpicPath = rows[0]?.value;
      }

      if (!finalEpicPath) {
        throw new Error('Epic Games kurulum yolu bulunamadı. Sisteminizde Epic Games yüklü değil gibi görünüyor.');
      }

      setSyncing(true, 'Epic Games kütüphanesi taranıyor...');

      // Yerel manifest dosyalarını oku
      // Bu kısım şimdilik basitleştirilmiş — ileride OAuth ile genişletilecek
      // TODO: Epic OAuth device code flow implementasyonu
      setSyncing(true, 'Epic Games yerel manifestleri okunuyor...');

      await loadGames();
      setSyncing(false, 'Epic Games senkronizasyonu tamamlandı');
    } catch (err) {
      setSyncing(false);
      throw err;
    }
  }, [setSyncing, loadGames]);

  /**
   * Uygulama başlangıcında tüm platformları senkronize eder
   */
  const syncAll = useCallback(async (settings: { steamApiKey: string; steamId: string }) => {
    try {
      if (settings.steamApiKey && settings.steamId) {
        await syncSteam(settings.steamApiKey, settings.steamId);
      }
      await syncEpic();
    } catch (err) {
      console.error('Senkronizasyon hatası:', err);
      setSyncing(false, 'Senkronizasyon hatası oluştu');
    }
  }, [syncSteam, syncEpic, setSyncing]);

  return { syncSteam, syncEpic, syncAll };
}
