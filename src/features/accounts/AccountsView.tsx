import { useState, type ComponentType, type InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  KeyRound,
  Plug,
  RefreshCw,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { PLATFORM_META } from '../../lib/meta';
import { computeStats } from '../../lib/select';
import { relativeTime } from '../../lib/format';
import { errorMessage, openExternal } from '../../lib/tauri';
import type { PlatformKey } from '../../types';

function Field({
  label,
  icon: Icon,
  ...props
}: { label: string; icon: ComponentType<{ size?: number }> } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-dim">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
          <Icon size={16} />
        </span>
        <input
          {...props}
          className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3.5 text-sm text-text placeholder:text-faint transition-colors focus:border-line-strong focus:outline-none"
        />
      </div>
    </label>
  );
}

function SteamCard() {
  const accounts = useStore((s) => s.accounts);
  const games = useStore((s) => s.games);
  const connectSteam = useStore((s) => s.connectSteam);
  const syncSteam = useStore((s) => s.syncSteam);
  const disconnect = useStore((s) => s.disconnect);
  const isSyncing = useStore((s) => s.isSyncing);
  const toast = useStore((s) => s.toast);

  const account = accounts.find((a) => a.platform_key === 'steam');
  const gameCount = computeStats(games).byPlatform.steam ?? 0;

  const [apiKey, setApiKey] = useState('');
  const [steamInput, setSteamInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const meta = PLATFORM_META.steam;

  const onConnect = async () => {
    if (!apiKey.trim() || !steamInput.trim()) {
      toast('Enter your Steam API key and profile ID.', 'error');
      return;
    }
    setConnecting(true);
    try {
      await connectSteam(apiKey, steamInput);
      setApiKey('');
      setSteamInput('');
      await syncSteam();
    } catch (e) {
      toast(errorMessage(e), 'error');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-3.5 border-b border-line p-5">
        <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}>
          <meta.Icon size={22} />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-[17px] font-bold tracking-tight text-text">Steam</h3>
          <p className="text-[13px] text-dim">Games, playtime and achievements via the Steam Web API</p>
        </div>
        {account && (
          <span className="flex items-center gap-1.5 rounded-full bg-st-playing/15 px-2.5 py-1 text-[12px] font-semibold" style={{ color: 'var(--color-st-playing)' }}>
            <CheckCircle2 size={13} /> Connected
          </span>
        )}
      </div>

      {account ? (
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-faint">Account</p>
              <p className="text-sm font-semibold text-text">{account.label ?? 'Steam user'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-faint">SteamID</p>
              <p className="font-mono text-sm text-dim">{account.external_id}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-faint">Games</p>
              <p className="text-sm font-semibold tabular-nums text-text">{gameCount}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-faint">Last sync</p>
              <p className="text-sm text-dim">{relativeTime(account.last_sync_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="primary" icon={RefreshCw} loading={isSyncing} onClick={() => void syncSteam()}>
              {isSyncing ? 'Syncing' : 'Re-sync library'}
            </Button>
            <Button variant="danger" icon={Trash2} onClick={() => void disconnect('steam')}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Steam Web API Key"
              icon={KeyRound}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••••••••••"
            />
            <Field
              label="SteamID64 or profile name"
              icon={User}
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              placeholder="76561198… or vanity URL"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="game" icon={Plug} loading={connecting} onClick={onConnect}>
              Connect Steam
            </Button>
            <Button variant="ghost" size="sm" iconRight={ExternalLink} onClick={() => void openExternal('https://steamcommunity.com/dev/apikey')}>
              Get an API key
            </Button>
            <Button variant="ghost" size="sm" iconRight={ExternalLink} onClick={() => void openExternal('https://steamid.io/')}>
              Find your SteamID
            </Button>
          </div>

          <p className="text-[12px] leading-relaxed text-faint">
            Your <span className="text-dim">Game details</span> privacy must be set to <span className="text-dim">Public</span> for
            playtime and achievements to load. Keys are stored only on this device.
          </p>
        </div>
      )}
    </motion.section>
  );
}

function ComingSoonCard({ platform, delay }: { platform: Exclude<PlatformKey, 'steam'>; delay: number }) {
  const meta = PLATFORM_META[platform];
  const note: Record<string, string> = {
    epic: 'Library + installs via the Legendary backend',
    gog: 'DRM-free library + downloads via gogdl',
    xbox: 'Game Pass & owned titles via Xbox auth',
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-surface flex items-center gap-3.5 rounded-2xl p-5 opacity-70"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}>
        <meta.Icon size={22} />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-[16px] font-bold tracking-tight text-text">{meta.name}</h3>
        <p className="text-[12.5px] text-faint">{note[platform]}</p>
      </div>
      <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-faint">Coming soon</span>
    </motion.section>
  );
}

export function AccountsView() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 px-8 py-7">
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-[13px] leading-relaxed text-dim">
          Atlas talks to each platform directly and keeps everything — credentials, games, playtime — in a local
          database on your machine. Nothing is sent to any server of ours.
        </p>
      </div>

      <SteamCard />

      <div className="pt-1">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          <Gamepad2 size={13} /> More platforms
        </p>
        <div className="space-y-3">
          <ComingSoonCard platform="epic" delay={0.05} />
          <ComingSoonCard platform="gog" delay={0.1} />
          <ComingSoonCard platform="xbox" delay={0.15} />
        </div>
      </div>
      </div>
    </div>
  );
}
