// components/layout/Sidebar.tsx — Sol Navigasyon Çubuğu
// Platform seçimi, koleksiyon filtreleri ve kütüphane istatistikleri

import {
  Gamepad2, Library, Monitor, Swords, FolderOpen,
  Heart, Clock, Trophy, Settings,
  RefreshCw, ChevronRight,
} from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import type { NavSection } from '../../types';

// Navigasyon öğesi yapılandırması
interface NavItem {
  id: NavSection;
  label: string;
  icon: typeof Gamepad2;
  count?: number;
  color?: string;
}

export function Sidebar() {
  const { activeNav, setActiveNav, stats, isSyncing } = useGameStore();

  // Ana navigasyon öğeleri
  const mainNav: NavItem[] = [
    { id: 'all', label: 'Tüm Oyunlar', icon: Library, count: stats.totalGames },
  ];

  // Platform navigasyonu
  const platformNav: NavItem[] = [
    { id: 'steam', label: 'Steam', icon: Monitor, count: stats.steamGames, color: '#66c0f4' },
    { id: 'epic', label: 'Epic Games', icon: Swords, count: stats.epicGames, color: '#ffffff' },
    { id: 'custom', label: 'Manuel', icon: FolderOpen, count: stats.customGames, color: '#a855f7' },
  ];

  // Koleksiyon navigasyonu
  const collectionNav: NavItem[] = [
    { id: 'favorites', label: 'Favoriler', icon: Heart, color: '#f43f5e' },
    { id: 'playing', label: 'Oynuyor', icon: Gamepad2, count: stats.statusCounts.Playing, color: '#f59e0b' },
    { id: 'backlog', label: 'Beklemede', icon: Clock, count: stats.statusCounts.Backlog, color: '#818cf8' },
    { id: 'completed', label: 'Tamamlandı', icon: Trophy, count: stats.statusCounts.Completed, color: '#10b981' },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = activeNav === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => setActiveNav(item.id)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group relative"
        style={{
          background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
          color: isActive ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
        }}
      >
        {/* Aktif göstergesi */}
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{ background: item.color ?? 'var(--color-accent-indigo)' }}
          />
        )}

        <Icon
          size={18}
          style={{ color: isActive ? (item.color ?? 'var(--color-accent-indigo)') : undefined }}
          className="flex-shrink-0 transition-colors group-hover:opacity-100"
        />

        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>

        {item.count !== undefined && item.count > 0 && (
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{
              background: isActive ? 'rgba(255,255,255,0.1)' : 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.7rem',
            }}
          >
            {item.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className="flex flex-col h-screen border-r w-[260px] min-w-[260px] bg-bg-secondary border-border-subtle"
    >
      {/* Logo / Başlık */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-subtle">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-indigo to-accent-purple shadow-[0_4px_15px_var(--accent-indigo-glow)]"
        >
          <Gamepad2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold font-display text-text-bright">
            Game Manager
          </h1>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            KÜTÜPHANE YÖNETİCİSİ
          </p>
        </div>
      </div>

      {/* Navigasyon İçeriği */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Ana */}
        <nav className="space-y-1">
          {mainNav.map(renderNavItem)}
        </nav>

        {/* Platformlar */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Platformlar
          </p>
          <nav className="space-y-1">
            {platformNav.map(renderNavItem)}
          </nav>
        </div>

        {/* Koleksiyonlar */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Koleksiyonlar
          </p>
          <nav className="space-y-1">
            {collectionNav.map(renderNavItem)}
          </nav>
        </div>
      </div>

      {/* Alt Bilgi — İstatistikler & Ayarlar */}
      <div className="px-3 py-4 border-t border-border-subtle space-y-4">
        {/* Mini istatistik kartları */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl px-3.5 py-2.5 bg-bg-tertiary border border-border-subtle hover:border-border-strong transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Toplam</p>
            <p className="text-lg font-bold font-display text-accent-indigo mt-0.5">
              {stats.totalGames}
            </p>
          </div>
          <div className="rounded-xl px-3.5 py-2.5 bg-bg-tertiary border border-border-subtle hover:border-border-strong transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Süre</p>
            <p className="text-lg font-bold font-display text-accent-emerald mt-0.5">
              {stats.totalPlaytimeHours}
              <span className="text-[10px] font-semibold font-sans text-text-secondary ml-0.5">sa</span>
            </p>
          </div>
        </div>

        {/* Senkronizasyon durumu */}
        {isSyncing && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-bg-tertiary border border-border-subtle animate-pulse">
            <RefreshCw size={12} className="animate-spin text-accent-indigo" />
            <span className="text-xs font-semibold text-text-secondary">
              Eşzamanlanıyor...
            </span>
          </div>
        )}

        {/* Ayarlar butonu */}
        <button
          onClick={() => setActiveNav('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
            activeNav === 'settings' 
              ? 'bg-bg-elevated text-text-bright border border-border-medium' 
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
          }`}
        >
          <Settings size={16} />
          <span className="flex-1 text-sm font-semibold">Ayarlar</span>
          <ChevronRight size={14} className="text-text-muted" />
        </button>
      </div>
    </aside>
  );
}
