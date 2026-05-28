// components/layout/TopBar.tsx — Üst Araç Çubuğu
// Arama, sıralama, görünüm modu değiştirici ve filtreler

import { Search, Grid3X3, List, SortAsc, SortDesc, Filter, RefreshCw, Sun, Moon } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import type { SortField } from '../../types';

// Sekme başlıkları (activeNav'a göre)
const navTitles: Record<string, string> = {
  all: 'Tüm Oyunlar',
  steam: 'Steam Kütüphanesi',
  epic: 'Epic Games Kütüphanesi',
  custom: 'Manuel Eklenen Oyunlar',
  favorites: 'Favorilerim',
  playing: 'Oynadıklarım',
  backlog: 'Beklemede',
  completed: 'Tamamlanan Oyunlar',
  settings: 'Ayarlar',
};

// Sıralama seçenekleri
const sortOptions: { field: SortField; label: string }[] = [
  { field: 'title', label: 'İsim' },
  { field: 'playtime', label: 'Oynama Süresi' },
  { field: 'lastPlayed', label: 'Son Oynanan' },
  { field: 'status', label: 'Durum' },
];

export function TopBar() {
  const {
    filters, setFilter,
    sortField, sortDirection, setSorting,
    viewMode, setViewMode,
    activeNav, filteredGames,
    isSyncing,
    theme, setTheme,
  } = useGameStore();

  return (
    <header
      className="flex items-center gap-4 px-6 py-3 border-b bg-bg-secondary border-border-subtle"
      style={{
        minHeight: '64px',
      }}
    >
      {/* Sol: Sayfa başlığı ve oyun sayısı */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-lg font-bold font-display text-text-bright whitespace-nowrap">
          {navTitles[activeNav] ?? 'Tüm Oyunlar'}
        </h2>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-indigo-glow text-accent-indigo"
        >
          {filteredGames.length} oyun
        </span>

        {isSyncing && (
          <RefreshCw size={16} className="animate-spin ml-1 text-accent-indigo" />
        )}
      </div>

      {/* Orta: Arama çubuğu */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
          />
          <input
            type="text"
            placeholder="Oyun ara..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="input-premium w-full pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* Sağ: Sıralama + Görünüm Modu + Tema */}
      <div className="flex items-center gap-2">
        {/* Sıralama Dropdown */}
        <div className="flex items-center gap-1">
          {sortOptions.map((opt) => {
            const isSelected = sortField === opt.field;
            return (
              <button
                key={opt.field}
                onClick={() => setSorting(opt.field)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-bg-elevated text-accent-indigo border border-border-strong' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                }`}
                title={`${opt.label}e göre sırala`}
              >
                {opt.label}
                {isSelected && (
                  sortDirection === 'asc'
                    ? <SortAsc size={12} className="inline ml-1" />
                    : <SortDesc size={12} className="inline ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Ayırıcı */}
        <div className="w-px h-6 mx-1 bg-border-subtle" />

        {/* Kurulu filtresi */}
        <button
          onClick={() => setFilter('installedOnly', !filters.installedOnly)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            filters.installedOnly 
              ? 'bg-accent-emerald-glow text-accent-emerald border border-accent-emerald/30' 
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
          }`}
          title="Yalnızca kurulu oyunları göster"
        >
          <Filter size={13} className="inline mr-1" />
          Kurulu
        </button>

        {/* Ayırıcı */}
        <div className="w-px h-6 mx-1 bg-border-subtle" />

        {/* Grid / Liste görünüm değiştirici */}
        <div
          className="flex rounded-lg overflow-hidden border border-border-subtle p-0.5 bg-bg-primary"
        >
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === 'grid' ? 'bg-bg-elevated text-accent-indigo' : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Grid görünümü"
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === 'list' ? 'bg-bg-elevated text-accent-indigo' : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Liste görünümü"
          >
            <List size={15} />
          </button>
        </div>

        {/* Ayırıcı */}
        <div className="w-px h-6 mx-1 bg-border-subtle" />

        {/* Tema Değiştirici */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg border border-border-subtle bg-bg-secondary text-text-secondary hover:text-accent-indigo hover:bg-bg-hover hover:border-border-strong transition-all duration-300 cursor-pointer flex items-center justify-center"
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
        >
          {theme === 'dark' ? <Sun size={16} className="animate-pulse" /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
