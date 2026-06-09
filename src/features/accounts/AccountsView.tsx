import { useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  KeyRound,
  Plug,
  RefreshCw,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Volume2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Switch } from '../../components/ui/Switch';
import { Slider } from '../../components/ui/Slider';
import { PLATFORM_META } from '../../lib/meta';
import { computeStats } from '../../lib/select';
import { relativeTime } from '../../lib/format';
import { errorMessage, openExternal } from '../../lib/tauri';
import { useT, LANGUAGES } from '../../i18n';
import type { Locale, PlatformKey } from '../../types';

const REGIONS: [string, string][] = [
  ['us', 'United States ($)'],
  ['tr', 'Türkiye (₺)'],
  ['gb', 'United Kingdom (£)'],
  ['de', 'Deutschland (€)'],
  ['fr', 'France (€)'],
  ['ru', 'Россия (₽)'],
  ['br', 'Brasil (R$)'],
  ['jp', '日本 (¥)'],
  ['ca', 'Canada (C$)'],
  ['au', 'Australia (A$)'],
];

function CardShell({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface elev-1 overflow-hidden rounded-2xl"
    >
      {children}
    </motion.section>
  );
}

function CardHeader({ icon: Icon, title, desc, color, badge }: { icon: ComponentType<{ size?: number }>; title: string; desc: string; color?: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-line p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: color ? `${color}1f` : 'rgba(255,255,255,0.05)', color: color ?? 'var(--color-accent)' }}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[17px] font-bold tracking-tight text-text">{title}</h3>
        <p className="truncate text-[13px] text-dim">{desc}</p>
      </div>
      {badge}
    </div>
  );
}

function Select({ value, onChange, options, icon: Icon }: { value: string; onChange: (v: string) => void; options: [string, string][]; icon: ComponentType<{ size?: number }> }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
        <Icon size={16} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface-2 pl-11 pr-9 text-sm text-text focus:border-line-strong focus:outline-none"
      >
        {options.map(([v, label]) => (
          <option key={v} value={v} className="bg-surface text-text">
            {label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-faint">▾</span>
    </div>
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
  const t = useT();

  const account = accounts.find((a) => a.platform_key === 'steam');
  const gameCount = computeStats(games).byPlatform.steam ?? 0;
  const meta = PLATFORM_META.steam;

  const [apiKey, setApiKey] = useState('');
  const [steamInput, setSteamInput] = useState('');
  const [connecting, setConnecting] = useState(false);

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
    <CardShell>
      <CardHeader
        icon={meta.Icon}
        title="Steam"
        desc={t('settings.steamDesc')}
        color={meta.color}
        badge={
          account && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ color: 'var(--color-st-playing)', backgroundColor: 'color-mix(in srgb, var(--color-st-playing) 14%, transparent)' }}>
              <CheckCircle2 size={13} /> {t('common.connected')}
            </span>
          )
        }
      />

      {account ? (
        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              [t('settings.account'), account.label ?? 'Steam user'],
              ['SteamID', account.external_id ?? '—'],
              [t('dash.statGames'), String(gameCount)],
              [t('settings.lastSync'), relativeTime(account.last_sync_at)],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-faint">{k}</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-text" title={v}>
                  {v}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" icon={RefreshCw} loading={isSyncing} onClick={() => void syncSteam()}>
              {isSyncing ? t('common.syncing') : t('common.resync')}
            </Button>
            <Button variant="danger" icon={Trash2} onClick={() => void disconnect('steam')}>
              {t('common.disconnect')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('settings.steamApiKey')} icon={KeyRound} type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••••••••••" />
            <Field label={t('settings.steamId')} icon={User} value={steamInput} onChange={(e) => setSteamInput(e.target.value)} placeholder="76561198… / vanity" />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="game" icon={Plug} loading={connecting} onClick={onConnect}>
              {t('settings.connectSteam')}
            </Button>
            <Button variant="ghost" size="sm" iconRight={ExternalLink} onClick={() => void openExternal('https://steamcommunity.com/dev/apikey')}>
              {t('settings.getApiKey')}
            </Button>
            <Button variant="ghost" size="sm" iconRight={ExternalLink} onClick={() => void openExternal('https://steamid.io/')}>
              {t('settings.findSteamId')}
            </Button>
          </div>
          <p className="rounded-xl bg-white/[0.025] px-4 py-3 text-[12.5px] leading-relaxed text-faint">{t('settings.steamPrivacy')}</p>
        </div>
      )}
    </CardShell>
  );
}

function PreferencesCard() {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const region = useStore((s) => s.region);
  const setRegion = useStore((s) => s.setRegion);
  const itadKey = useStore((s) => s.itadKey);
  const setItadKey = useStore((s) => s.setItadKey);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const soundVolume = useStore((s) => s.soundVolume);
  const setSoundEnabled = useStore((s) => s.setSoundEnabled);
  const setSoundVolume = useStore((s) => s.setSoundVolume);
  const toast = useStore((s) => s.toast);
  const t = useT();
  const [keyDraft, setKeyDraft] = useState(itadKey);

  return (
    <>
      <CardShell delay={0.05}>
        <CardHeader icon={Globe} title={t('settings.appearance')} desc={t('settings.language')} />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-dim">{t('settings.language')}</p>
            <Select icon={Globe} value={locale} onChange={(v) => setLocale(v as Locale)} options={LANGUAGES.map((l) => [l.code, l.label])} />
          </div>
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-dim">{t('settings.region')}</p>
            <Select icon={Tag} value={region} onChange={setRegion} options={REGIONS} />
          </div>
        </div>
      </CardShell>

      <CardShell delay={0.1}>
        <CardHeader icon={Tag} title={t('settings.prices')} desc={t('settings.pricesDesc')} />
        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field
                label={t('settings.itadKey')}
                icon={KeyRound}
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onBlur={() => {
                  if (keyDraft.trim() !== itadKey) {
                    void setItadKey(keyDraft);
                    toast('Saved', 'success');
                  }
                }}
                placeholder="ITAD API key"
              />
            </div>
            <Button variant="ghost" size="md" iconRight={ExternalLink} onClick={() => void openExternal('https://isthereanydeal.com/apps/new/')}>
              {t('settings.getItadKey')}
            </Button>
          </div>
        </div>
      </CardShell>

      <CardShell delay={0.15}>
        <CardHeader icon={Volume2} title={t('settings.sound')} desc={t('settings.soundDesc')} />
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">{t('settings.interfaceSounds')}</p>
              <p className="text-[12px] text-faint">{t('settings.interfaceSoundsDesc')}</p>
            </div>
            <Switch checked={soundEnabled} onChange={setSoundEnabled} label="sound" />
          </div>
          <div className={`flex items-center gap-4 transition-opacity ${soundEnabled ? '' : 'pointer-events-none opacity-40'}`}>
            <span className="w-16 shrink-0 text-[12px] text-faint">{t('settings.volume')}</span>
            <Slider value={soundVolume} onChange={setSoundVolume} aria-label="volume" className="flex-1" />
            <span className="w-10 shrink-0 text-right text-[12px] tabular-nums text-dim">{Math.round(soundVolume * 100)}%</span>
          </div>
        </div>
      </CardShell>
    </>
  );
}

function ComingSoonCard({ platform, delay }: { platform: Exclude<PlatformKey, 'steam'>; delay: number }) {
  const meta = PLATFORM_META[platform];
  const t = useT();
  const note: Record<string, string> = {
    epic: 'Library + installs via the Legendary backend',
    gog: 'DRM-free library + downloads via gogdl',
    xbox: 'Game Pass & owned titles via Xbox auth',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card-surface flex items-center gap-4 rounded-2xl p-4 opacity-65">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}>
        <meta.Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-[15px] font-bold tracking-tight text-text">{meta.name}</h4>
        <p className="truncate text-[12.5px] text-faint">{note[platform]}</p>
      </div>
      <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-faint">{t('common.comingSoon')}</span>
    </motion.div>
  );
}

export function AccountsView() {
  const t = useT();
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 px-8 py-8">
        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-[13px] leading-relaxed text-dim">{t('settings.privacy')}</p>
        </div>

        <SteamCard />
        <PreferencesCard />

        <div className="pt-1">
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{t('section.more')}</p>
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
