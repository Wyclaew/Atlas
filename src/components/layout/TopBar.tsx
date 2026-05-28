// components/layout/TopBar.tsx — Üst Araç Çubuğu

import { Search, Grid3X3, List, SortAsc, SortDesc, Filter, RefreshCw } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import type { SortField } from '../../types';

const navTitles: Record<string, string> = {
  all: 'Tüm Kütüphane',
  steam: 'Steam Games',
  epic: 'Epic Games Store',
  custom: 'Yerel Oyunlar',
  favorites: 'Favori Oyunlar',
  playing: 'Aktif Oynananlar',
  backlog: 'Bekleme Listesi',
  completed: 'Tamamlananlar',
  settings: 'Ayarlar',
};

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'title', label: 'İsim' },
  { field: 'playtime', label: 'Süre' },
  { field: 'lastPlayed', label: 'Son Oynama' },
  { field: 'status', label: 'Durum' },
];

export function TopBar() {
  const {
    filters, setFilter,
    sortField, sortDirection, setSorting,
    viewMode, setViewMode,
    activeNav, filteredGames,
    isSyncing,
  } = useGameStore();

  return (
    <header
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 py-6 bg-bg-glass border-b border-border-subtle backdrop-blur-md relative z-10"
    >
      {/* Sol: Başlık ve Oyun Sayacı */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black font-display text-text-bright tracking-tight">
          {navTitles[activeNav] ?? 'Tüm Kütüphane'}
        </h2>
        
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-accent-ember-start/10 border border-accent-ember-start/20 text-accent-ember-start tracking-wider uppercase"
          >
            {filteredGames.length} Oyun
          </span>
          {isSyncing && (
            <div className="flex items-center justify-center p-1 rounded bg-bg-hover border border-border-subtle">
              <RefreshCw size={12} className="animate-spin text-orange-500" />
            </div>
          )}
        </div>
      </div>

      {/* Sağ Grup: Arama ve Segmented Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Arama Kutusu - Focus olunca genişleyen pürüzsüz kapsül */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary"
          />
          <input
            type="text"
            placeholder="Kütüphanede ara..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-48 focus:w-72 bg-bg-elevated text-text-bright text-[12px] placeholder-text-muted pr-4 py-2.5 rounded-full border border-border-subtle focus:border-orange-500/30 outline-none transition-all duration-300 shadow-inner focus:shadow-[0_0_15px_rgba(249,115,22,0.1),inset_0_2px_4px_rgba(0,0,0,0.8)] font-medium"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Segmented Control - Sıralama Seçenekleri */}
        <div className="flex items-center gap-1 bg-bg-tertiary p-1.5 rounded-2xl border border-border-subtle shadow-inner">
          {sortOptions.map((opt) => {
            const isSelected = sortField === opt.field;
            return (
              <button
                key={opt.field}
                onClick={() => setSorting(opt.field)}
                className={`relative px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 outline-none ${
                  isSelected 
                    ? 'text-text-primary bg-bg-elevated border border-border-medium shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 shadow-glow" />
                )}
                {opt.label}
                {isSelected && (
                  sortDirection === 'asc'
                    ? <SortAsc size={11} className="text-orange-500" />
                    : <SortDesc size={11} className="text-orange-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Segmented Control - Kurulu Filtresi */}
        <div className="flex items-center bg-bg-tertiary p-1.5 rounded-2xl border border-border-subtle shadow-inner">
          <button
            onClick={() => setFilter('installedOnly', !filters.installedOnly)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 outline-none ${
              filters.installedOnly 
                ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 shadow-sm' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Filter size={11} />
            Kurulu
          </button>
        </div>

        {/* Görünüm Modu Değiştirici */}
        <div className="flex items-center gap-1 bg-bg-tertiary p-1.5 rounded-2xl border border-border-subtle shadow-inner">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer outline-none ${
              viewMode === 'grid' ? 'bg-bg-elevated text-orange-500 shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Grid3X3 size={13} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer outline-none ${
              viewMode === 'list' ? 'bg-bg-elevated text-orange-500 shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <List size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
