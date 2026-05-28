// components/layout/Sidebar.tsx — Sol Navigasyon Çubuğu (Minimap Rail)

import {
  Gamepad2, Library, Monitor, Swords, FolderOpen,
  Heart, Clock, Trophy, Settings,
  RefreshCw, Menu, PanelLeftClose
} from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { SidebarButton } from '../ui/SidebarButton';
import { motion } from 'framer-motion';
import type { NavSection } from '../../types';

interface NavItem {
  id: NavSection;
  label: string;
  icon: typeof Gamepad2;
  count?: number;
  color?: string;
}

export function Sidebar() {
  const { activeNav, setActiveNav, stats, isSyncing, syncMessage, isSidebarOpen, toggleSidebar } = useGameStore();

  // Kütüphane grubu
  const libraryNav: NavItem[] = [
    { id: 'all', label: 'Tüm Oyunlar', icon: Library, count: stats.totalGames, color: 'var(--color-accent-ember-start)' },
  ];

  // Platformlar grubu
  const platformNav: NavItem[] = [
    { id: 'steam', label: 'Steam', icon: Monitor, count: stats.steamGames, color: '#66c0f4' },
    { id: 'epic', label: 'Epic Games', icon: Swords, count: stats.epicGames, color: '#ffffff' },
    { id: 'custom', label: 'Yerel Eklemeler', icon: FolderOpen, count: stats.customGames, color: '#10b981' },
  ];

  // Koleksiyonlar grubu
  const collectionNav: NavItem[] = [
    { id: 'favorites', label: 'Favoriler', icon: Heart, color: '#f43f5e' },
    { id: 'playing', label: 'Aktif Oynanan', icon: Gamepad2, count: stats.statusCounts.Playing, color: '#f59e0b' },
    { id: 'backlog', label: 'Beklemede', icon: Clock, count: stats.statusCounts.Backlog, color: '#818cf8' },
    { id: 'completed', label: 'Tamamlandı', icon: Trophy, count: stats.statusCounts.Completed, color: '#10b981' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isSidebarOpen ? 240 : 80,
        minWidth: isSidebarOpen ? 240 : 80
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-bg-glass border-r border-border-subtle py-6 pb-10 backdrop-blur-xl z-20 overflow-hidden"
    >
      {/* Logo & Toggle - Üst Alan */}
      <div className={`flex items-center ${isSidebarOpen ? 'justify-between px-6' : 'justify-center'} pb-6 border-b border-border-subtle w-full mb-6 transition-all duration-300`}>
        {/* Sadece açıkken göster */}
        {isSidebarOpen && (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent-ember-start/10 border border-accent-ember-start/30 shadow-glow flex-shrink-0"
            >
              <Gamepad2 size={16} className="text-orange-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-black font-display text-text-bright tracking-wider uppercase leading-none truncate">
                GAME MANAGER
              </span>
              <span className="text-[9px] text-text-secondary font-bold mt-1 tracking-widest leading-none truncate">
                V2.0 STABLE
              </span>
            </div>
          </div>
        )}

        {/* Toggle Butonu */}
        <button
          onClick={() => toggleSidebar()}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors outline-none"
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Ana Navigasyon Grupları */}
      <div className={`flex-1 overflow-y-auto ${isSidebarOpen ? 'px-4' : 'px-2'} space-y-6 w-full flex flex-col no-scrollbar`}>
        {/* Kütüphane Grubu */}
        <div className="space-y-2">
          {isSidebarOpen && (
            <label className="text-[9px] font-black uppercase text-text-secondary px-3 tracking-widest opacity-60 block">
              Kütüphane
            </label>
          )}
          <nav className="space-y-1">
            {libraryNav.map((item) => (
              <SidebarButton
                key={item.id}
                isActive={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
                icon={item.icon}
                label={item.label}
                count={item.count}
              />
            ))}
          </nav>
        </div>

        {/* Platformlar Grubu */}
        <div className="space-y-2">
          {isSidebarOpen && (
            <label className="text-[9px] font-black uppercase text-text-secondary px-3 tracking-widest opacity-60 block">
              Platformlar
            </label>
          )}
          <nav className="space-y-1">
            {platformNav.map((item) => (
              <SidebarButton
                key={item.id}
                isActive={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
                icon={item.icon}
                label={item.label}
                count={item.count}
              />
            ))}
          </nav>
        </div>

        {/* Koleksiyonlar Grubu */}
        <div className="space-y-2">
          {isSidebarOpen && (
            <label className="text-[9px] font-black uppercase text-text-secondary px-3 tracking-widest opacity-60 block">
              Koleksiyonlar
            </label>
          )}
          <nav className="space-y-1">
            {collectionNav.map((item) => (
              <SidebarButton
                key={item.id}
                isActive={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
                icon={item.icon}
                label={item.label}
                count={item.count}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Alt Bölüm — Senkronizasyon & Ayarlar */}
      <div className={`${isSidebarOpen ? 'px-4' : 'px-2'} border-t border-border-subtle w-full pt-4 flex flex-col gap-4 mt-auto`}>
        {/* Senkronizasyon Durumu */}
        {isSyncing && isSidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg-hover border border-border-subtle animate-pulse">
            <RefreshCw size={13} className="animate-spin text-orange-500 flex-shrink-0" />
            <span className="text-[11px] font-bold text-text-secondary truncate">
              {syncMessage || 'Senkronize ediliyor...'}
            </span>
          </div>
        )}
        
        {isSyncing && !isSidebarOpen && (
           <div className="mx-auto p-2 rounded-xl bg-bg-hover border border-border-subtle">
             <RefreshCw size={14} className="animate-spin text-orange-500" />
           </div>
        )}

        {/* Ayarlar Düğmesi */}
        <div className="w-full">
          <SidebarButton
            isActive={activeNav === 'settings'}
            onClick={() => setActiveNav('settings')}
            icon={Settings}
            label={isSidebarOpen ? "Ayarlar" : ""}
          />
        </div>
      </div>
    </motion.aside>
  );
}
