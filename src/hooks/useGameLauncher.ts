// hooks/useGameLauncher.ts — Oyun Başlatma Hook'u
// Oyunu platformuna göre başlatır ve oturum süresini takip eder

import { useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import { useGameStore } from '../stores/useGameStore';
import type { Game } from '../types';

export function useGameLauncher() {
  const { loadGames } = useGameStore();
  const sessionStartRef = useRef<Map<number, Date>>(new Map());

  /**
   * Oyunu başlatır:
   * - Steam: steam://run/<appid> URI scheme kullanır
   * - Epic/Custom: Doğrudan executable çalıştırır
   * Başlatma anında oturum kaydı başlatılır
   */
  const launchGame = useCallback(async (game: Game) => {
    try {
      // Rust komutu ile oyunu başlat
      const result = await invoke<string>('launch_game', {
        platform: game.platform_name,
        externalId: game.external_game_id,
        executablePath: game.executable_path,
      });

      console.log('Oyun başlatıldı:', result);

      // Oturum başlangıç zamanını kaydet
      sessionStartRef.current.set(game.id, new Date());

      // Veritabanında play_sessions tablosuna kayıt ekle
      const db = await Database.load('sqlite:gamemanager.db');
      await db.execute(
        `INSERT INTO play_sessions (game_id, started_at) VALUES ($1, datetime('now'))`,
        [game.id]
      );

      // last_played_at güncelle
      await db.execute(
        `UPDATE games SET last_played_at = datetime('now'), updated_at = datetime('now') WHERE id = $1`,
        [game.id]
      );

      await loadGames();
      return result;
    } catch (err) {
      console.error('Oyun başlatma hatası:', err);
      throw err;
    }
  }, [loadGames]);

  /**
   * Oyun oturumunu sonlandırır ve süreyi kaydeder.
   * Oyuncu oyunu kapattığında çağrılmalıdır.
   */
  const endSession = useCallback(async (gameId: number) => {
    const startTime = sessionStartRef.current.get(gameId);
    if (!startTime) return;

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    try {
      const db = await Database.load('sqlite:gamemanager.db');

      // Aktif oturumu güncelle (ended_at olmayan en son oturum)
      await db.execute(
        `UPDATE play_sessions SET
           ended_at = datetime('now'),
           duration_minutes = $1
         WHERE game_id = $2 AND ended_at IS NULL
         ORDER BY id DESC LIMIT 1`,
        [durationMinutes, gameId]
      );

      // Toplam oynama süresini güncelle
      await db.execute(
        `UPDATE games SET
           total_playtime_minutes = total_playtime_minutes + $1,
           updated_at = datetime('now')
         WHERE id = $2`,
        [durationMinutes, gameId]
      );

      sessionStartRef.current.delete(gameId);
      await loadGames();
    } catch (err) {
      console.error('Oturum sonlandırma hatası:', err);
    }
  }, [loadGames]);

  return { launchGame, endSession };
}
