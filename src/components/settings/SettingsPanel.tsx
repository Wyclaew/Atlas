import { useState, useEffect } from 'react';
import { Monitor, Swords, Key, User, FolderOpen, AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
import { useSync } from '../../hooks/useSync';
import { useGameStore } from '../../stores/useGameStore';
import { InputField } from '../ui/InputField';
import { ActionButton } from '../ui/ActionButton';

export function SettingsPanel() {
  const [steamApiKey, setSteamApiKey] = useState('');
  const [steamId, setSteamId] = useState('');
  const [steamPath, setSteamPath] = useState('');
  const [epicPath, setEpicPath] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { syncSteam, syncEpic } = useSync();
  const { isSyncing, syncMessage, addToast } = useGameStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      const rows = await db.select<{ key: string; value: string }[]>(`SELECT key, value FROM settings`);
      const settingsMap = new Map(rows.map(r => [r.key, r.value]));

      setSteamApiKey(settingsMap.get('steam_api_key') ?? '');
      setSteamId(settingsMap.get('steam_id') ?? '');
      
      let loadedSteam = settingsMap.get('steam_path') ?? '';
      let loadedEpic = settingsMap.get('epic_path') ?? '';

      if (!loadedSteam || !loadedEpic) {
        try {
          const detected = await invoke<{ steam_path: string | null; epic_path: string | null; os: string }>('detect_platform_paths');
          if (!loadedSteam && detected.steam_path) loadedSteam = detected.steam_path;
          if (!loadedEpic && detected.epic_path) loadedEpic = detected.epic_path;
        } catch (e) {}
      }
      setSteamPath(loadedSteam);
      setEpicPath(loadedEpic);
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const db = await Database.load('sqlite:gamemanager.db');
      const settings = [
        ['steam_api_key', steamApiKey],
        ['steam_id', steamId],
        ['steam_path', steamPath],
        ['epic_path', epicPath]
      ];
      for (const [key, value] of settings) {
        await db.execute(
          `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
          [key, value]
        );
      }
      addToast('Ayarlar başarıyla kaydedildi.', 'success');
    } catch (err) {
      addToast(`Kaydedilemedi: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-col select-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Integrations
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Connect your Steam and Epic Games accounts to manage your libraries in one place. All API keys are stored locally and never shared.
        </p>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Steam Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-8 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-500/15 border border-indigo-500/30">
              <Monitor size={24} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Steam</h3>
              <p className="text-xs text-slate-400 mt-1">Developer API integration</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            <InputField
              label="API Key"
              type="password"
              value={steamApiKey}
              onChange={e => setSteamApiKey(e.target.value)}
              icon={Key}
              placeholder="Enter your Steam API key"
            />
            <InputField
              label="Steam ID (64-bit)"
              type="text"
              value={steamId}
              onChange={e => setSteamId(e.target.value)}
              icon={User}
              placeholder="e.g., 76561198..."
            />
            <InputField
              label="Installation Path"
              type="text"
              value={steamPath}
              onChange={e => setSteamPath(e.target.value)}
              icon={FolderOpen}
              placeholder="e.g., C:\Program Files (x86)\Steam"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
            <ActionButton
              variant="secondary"
              icon={RefreshCw}
              onClick={() => syncSteam(steamApiKey, steamId, steamPath)}
              disabled={isSyncing || !steamApiKey || !steamId}
              loading={isSyncing}
            >
              {isSyncing ? syncMessage : 'Sync Library'}
            </ActionButton>
          </div>
        </motion.section>

        {/* Epic Games Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-lg p-8 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-violet-500/15 border border-violet-500/30">
              <Swords size={24} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Epic Games</h3>
              <p className="text-xs text-slate-400 mt-1">Secure OAuth authentication</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            <InputField
              label="Installation Path"
              type="text"
              value={epicPath}
              onChange={e => setEpicPath(e.target.value)}
              icon={FolderOpen}
              placeholder="e.g., C:\Program Files\Epic Games"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  We use <b>OAuth Device Code Flow</b> for secure authentication. You'll be directed to Epic's official page to authorize access.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
            <ActionButton
              variant="secondary"
              icon={Wifi}
              onClick={() => syncEpic(epicPath)}
              disabled={isSyncing}
              loading={isSyncing}
            >
              Authorize Account
            </ActionButton>
          </div>
        </motion.section>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end mt-2 mb-8"
      >
        <ActionButton
          variant="accent"
          onClick={saveSettings}
          loading={isSaving}
          className="px-8"
        >
          Save Changes
        </ActionButton>
      </motion.div>
    </div>
  );
}
