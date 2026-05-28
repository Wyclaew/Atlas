// components/settings/SettingsPanel.tsx — Ayarlar Sayfası
// Steam API Key, SteamID64, Epic hesap bilgileri ve uygulama ayarları

import { useState, useEffect } from 'react';
import {
  Save, RefreshCw, Monitor, Swords, Key,
  User, FolderOpen, CheckCircle2, AlertCircle, Wifi
} from 'lucide-react';
import Database from '@tauri-apps/plugin-sql';
import { useSync } from '../../hooks/useSync';
import { useGameStore } from '../../stores/useGameStore';

export function SettingsPanel() {
  // Form durumları
  const [steamApiKey, setSteamApiKey] = useState('');
  const [steamId, setSteamId] = useState('');
  const [steamPath, setSteamPath] = useState('C:\\Program Files (x86)\\Steam');
  const [epicPath, setEpicPath] = useState('C:\\Program Files\\Epic Games');
  const [autoSync, setAutoSync] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [syncError, setSyncError] = useState('');

  const { syncSteam, syncEpic } = useSync();
  const { isSyncing, syncMessage } = useGameStore();

  // Ayarları veritabanından yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      const rows = await db.select<{ key: string; value: string }[]>(
        `SELECT key, value FROM settings`
      );
      const settingsMap = new Map(rows.map(r => [r.key, r.value]));

      setSteamApiKey(settingsMap.get('steam_api_key') ?? '');
      setSteamId(settingsMap.get('steam_id') ?? '');
      setSteamPath(settingsMap.get('steam_path') ?? 'C:\\Program Files (x86)\\Steam');
      setEpicPath(settingsMap.get('epic_path') ?? 'C:\\Program Files\\Epic Games');
      setAutoSync(settingsMap.get('auto_sync') !== 'false');
    } catch (err) {
      console.error('Ayarlar yüklenirken hata:', err);
    }
  };

  // Ayarları veritabanına kaydet
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      const settings = [
        ['steam_api_key', steamApiKey],
        ['steam_id', steamId],
        ['steam_path', steamPath],
        ['epic_path', epicPath],
        ['auto_sync', String(autoSync)],
      ];

      for (const [key, value] of settings) {
        await db.execute(
          `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, datetime('now'))
           ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = datetime('now')`,
          [key, value]
        );
      }

      setSaveMessage('Ayarlar kaydedildi');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Ayarlar kaydedilirken hata:', err);
      setSaveMessage('Kaydetme hatası!');
    } finally {
      setIsSaving(false);
    }
  };

  // Steam senkronizasyonu başlat
  const handleSteamSync = async () => {
    setSyncError('');
    try {
      await syncSteam(steamApiKey, steamId);
    } catch (err) {
      setSyncError(String(err));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 max-w-3xl">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-bright)' }}>
          Ayarlar
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Platform bağlantıları ve uygulama yapılandırması
        </p>
      </div>

      {/* ==========================================
          Steam Yapılandırması
          ========================================== */}
      <section
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(102, 192, 244, 0.1)' }}
          >
            <Monitor size={20} style={{ color: '#66c0f4' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-bright)' }}>
              Steam Entegrasyonu
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Steam Web API ile kütüphanenizi senkronize edin
            </p>
          </div>
        </div>

        {/* Steam API Key */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            <Key size={14} style={{ color: 'var(--color-accent-indigo)' }} />
            Steam API Anahtarı
          </label>
          <input
            type="password"
            value={steamApiKey}
            onChange={(e) => setSteamApiKey(e.target.value)}
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="input-dark w-full font-mono text-xs"
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            API anahtarınızı{' '}
            <span style={{ color: 'var(--color-accent-indigo)' }}>steamcommunity.com/dev/apikey</span>
            {' '}adresinden alabilirsiniz
          </p>
        </div>

        {/* SteamID64 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            <User size={14} style={{ color: 'var(--color-accent-indigo)' }} />
            SteamID64
          </label>
          <input
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="76561198XXXXXXXXX"
            className="input-dark w-full font-mono text-xs"
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            SteamID'nizi{' '}
            <span style={{ color: 'var(--color-accent-indigo)' }}>steamid.io</span>
            {' '}üzerinden bulabilirsiniz
          </p>
        </div>

        {/* Steam Kurulum Yolu */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            <FolderOpen size={14} style={{ color: 'var(--color-accent-indigo)' }} />
            Steam Kurulum Yolu
          </label>
          <input
            type="text"
            value={steamPath}
            onChange={(e) => setSteamPath(e.target.value)}
            className="input-dark w-full font-mono text-xs"
          />
        </div>

        {/* Steam Senkronizasyon Butonu */}
        <button
          className="btn-primary flex items-center gap-2 w-full justify-center py-2.5"
          onClick={handleSteamSync}
          disabled={isSyncing || !steamApiKey || !steamId}
          style={{
            opacity: isSyncing || !steamApiKey || !steamId ? 0.5 : 1,
          }}
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? syncMessage : 'Steam Kütüphanesini Senkronize Et'}
        </button>

        {syncError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <AlertCircle size={16} style={{ color: 'var(--color-accent-rose)', flexShrink: 0, marginTop: '1px' }} />
            <p className="text-xs" style={{ color: 'var(--color-accent-rose)' }}>
              {syncError}
            </p>
          </div>
        )}
      </section>

      {/* ==========================================
          Epic Games Yapılandırması
          ========================================== */}
      <section
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <Swords size={20} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-bright)' }}>
              Epic Games Entegrasyonu
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              OAuth akışı ile Epic Games kütüphanenizi bağlayın
            </p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            <FolderOpen size={14} style={{ color: 'var(--color-accent-purple)' }} />
            Epic Games Kurulum Yolu
          </label>
          <input
            type="text"
            value={epicPath}
            onChange={(e) => setEpicPath(e.target.value)}
            className="input-dark w-full font-mono text-xs"
          />
        </div>

        <button
          className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-border-medium)',
            color: 'var(--color-text-primary)',
          }}
          onClick={() => syncEpic()}
          disabled={isSyncing}
        >
          <Wifi size={16} />
          Epic Games Hesabını Bağla
        </button>
      </section>

      {/* ==========================================
          Genel Ayarlar
          ========================================== */}
      <section
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-bright)' }}>
          Genel Ayarlar
        </h3>

        {/* Otomatik senkronizasyon toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Başlangıçta Otomatik Senkronizasyon
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Uygulama açıldığında kütüphaneleri otomatik güncelle
            </p>
          </div>
          <button
            className="relative w-11 h-6 rounded-full transition-all duration-200"
            style={{
              background: autoSync ? 'var(--color-accent-indigo)' : 'var(--color-bg-hover)',
            }}
            onClick={() => setAutoSync(!autoSync)}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ left: autoSync ? '24px' : '4px' }}
            />
          </button>
        </div>
      </section>

      {/* Kaydet butonu */}
      <div className="flex items-center gap-3">
        <button
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
          onClick={saveSettings}
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>

        {saveMessage && (
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-accent-emerald)' }}>
            <CheckCircle2 size={16} />
            {saveMessage}
          </span>
        )}
      </div>
    </div>
  );
}
