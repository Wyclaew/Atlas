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
      className="flex flex-col h-screen border-r"
      style={{
        width: '260px',
        minWidth: '260px',
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      {/* Logo / Başlık */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-purple))',
            boxShadow: '0 4px 15px var(--color-accent-indigo-glow)',
          }}
        >
          <Gamepad2 size={20} color="white" />
        </div>
        <div>
          <h1 className="text-sm font-bold" style={{ color: 'var(--color-text-bright)' }}>
            Game Manager
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>
            Kütüphane Yöneticisi
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
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Platformlar
          </p>
          <nav className="space-y-1">
            {platformNav.map(renderNavItem)}
          </nav>
        </div>

        {/* Koleksiyonlar */}
        <div>
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Koleksiyonlar
          </p>
          <nav className="space-y-1">
            {collectionNav.map(renderNavItem)}
          </nav>
        </div>
      </div>

      {/* Alt Bilgi — İstatistikler & Ayarlar */}
      <div className="px-3 py-4 border-t space-y-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
        {/* Mini istatistik kartları */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg px-3 py-2" style={{ background: 'var(--color-bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Toplam</p>
            <p className="text-lg font-bold" style={{ color: 'var(--color-accent-indigo)' }}>
              {stats.totalGames}
            </p>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: 'var(--color-bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Süre</p>
            <p className="text-lg font-bold" style={{ color: 'var(--color-accent-emerald)' }}>
              {stats.totalPlaytimeHours}
              <span className="text-xs font-normal ml-0.5">sa</span>
            </p>
          </div>
        </div>

        {/* Senkronizasyon durumu */}
        {isSyncing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
            <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--color-accent-indigo)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Senkronize ediliyor...
            </span>
          </div>
        )}

        {/* Ayarlar butonu */}
        <button
          onClick={() => setActiveNav('settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
          style={{
            background: activeNav === 'settings' ? 'var(--color-bg-elevated)' : 'transparent',
            color: activeNav === 'settings' ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
          }}
        >
          <Settings size={18} />
          <span className="flex-1 text-sm font-medium">Ayarlar</span>
          <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
    </aside>
  );
}
