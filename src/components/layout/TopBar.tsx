// components/layout/TopBar.tsx — Üst Araç Çubuğu
// Arama, sıralama, görünüm modu değiştirici ve filtreler

import { Search, Grid3X3, List, SortAsc, SortDesc, Filter, RefreshCw } from 'lucide-react';
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
  } = useGameStore();

  return (
    <header
      className="flex items-center gap-4 px-6 py-3 border-b"
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-subtle)',
        minHeight: '64px',
      }}
    >
      {/* Sol: Sayfa başlığı ve oyun sayısı */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-lg font-bold whitespace-nowrap" style={{ color: 'var(--color-text-bright)' }}>
          {navTitles[activeNav] ?? 'Tüm Oyunlar'}
        </h2>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--color-accent-indigo-glow)',
            color: 'var(--color-accent-indigo-hover)',
          }}
        >
          {filteredGames.length} oyun
        </span>

        {isSyncing && (
          <RefreshCw size={16} className="animate-spin ml-1" style={{ color: 'var(--color-accent-indigo)' }} />
        )}
      </div>

      {/* Orta: Arama çubuğu */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Oyun ara..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="input-dark w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Sağ: Sıralama + Görünüm Modu */}
      <div className="flex items-center gap-2">
        {/* Sıralama Dropdown */}
        <div className="flex items-center gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.field}
              onClick={() => setSorting(opt.field)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={{
                background: sortField === opt.field ? 'var(--color-bg-elevated)' : 'transparent',
                color: sortField === opt.field ? 'var(--color-accent-indigo-hover)' : 'var(--color-text-secondary)',
                border: sortField === opt.field ? '1px solid var(--color-border-medium)' : '1px solid transparent',
              }}
              title={`${opt.label}e göre sırala`}
            >
              {opt.label}
              {sortField === opt.field && (
                sortDirection === 'asc'
                  ? <SortAsc size={12} className="inline ml-1" />
                  : <SortDesc size={12} className="inline ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Ayırıcı */}
        <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border-subtle)' }} />

        {/* Kurulu filtresi */}
        <button
          onClick={() => setFilter('installedOnly', !filters.installedOnly)}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
          style={{
            background: filters.installedOnly ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: filters.installedOnly ? 'var(--color-accent-emerald)' : 'var(--color-text-secondary)',
            border: filters.installedOnly ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
          }}
          title="Yalnızca kurulu oyunları göster"
        >
          <Filter size={14} className="inline mr-1" />
          Kurulu
        </button>

        {/* Ayırıcı */}
        <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border-subtle)' }} />

        {/* Grid / Liste görünüm değiştirici */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="p-1.5 transition-all duration-200"
            style={{
              background: viewMode === 'grid' ? 'var(--color-bg-elevated)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-accent-indigo)' : 'var(--color-text-muted)',
            }}
            title="Grid görünümü"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-1.5 transition-all duration-200"
            style={{
              background: viewMode === 'list' ? 'var(--color-bg-elevated)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-accent-indigo)' : 'var(--color-text-muted)',
            }}
            title="Liste görünümü"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
