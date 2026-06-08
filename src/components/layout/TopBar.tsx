import { Search, Grid3X3, List, SortAsc, RefreshCw } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { SortField } from '../../types';

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'title', label: 'Name' },
  { field: 'playtime', label: 'Hours' },
  { field: 'lastPlayed', label: 'Recent' },
  { field: 'status', label: 'Status' },
];

export function TopBar() {
  const {
    filters, setFilter,
    sortField, sortDirection, setSorting,
    viewMode, setViewMode,
    activeNav, filteredGames,
    isSyncing,
  } = useGameStore();

  const getNavLabel = () => {
    const labels: Record<string, string> = {
      'all': 'All Games',
      'steam': 'Steam',
      'epic': 'Epic Games',
      'custom': 'Local',
      'favorites': 'Favorites',
      'playing': 'Playing',
      'backlog': 'Backlog',
      'completed': 'Completed',
    };
    return labels[activeNav] || activeNav;
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-md border-b border-white/[0.06] py-5 px-8 mb-8 flex items-center justify-between">
      {/* Left: Title & Count */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {getNavLabel()}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </p>
        </div>

        <AnimatePresence>
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
            >
              <RefreshCw size={12} className="animate-spin text-indigo-400" />
              <span className="text-xs text-indigo-300">Syncing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right: Controls */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        {/* Search Input */}
        <div className="relative group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search games..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-56 focus:w-72 bg-white/[0.04] text-white text-sm placeholder-slate-600 pr-4 py-2.5 rounded-lg border border-white/[0.08] focus:border-indigo-500/50 focus:bg-white/[0.06] outline-none transition-all duration-300"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2 border-r border-l border-white/[0.06] px-4">
          {sortOptions.map((opt) => {
            const isSelected = sortField === opt.field;
            return (
              <motion.button
                key={opt.field}
                onClick={() => setSorting(opt.field)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {opt.label}
                <motion.div
                  animate={{ rotate: isSelected && sortDirection === 'desc' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSelected && <SortAsc size={12} />}
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          {(['grid', 'list'] as const).map((mode) => (
            <motion.button
              key={mode}
              onClick={() => setViewMode(mode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-md transition-all ${
                viewMode === mode
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {mode === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </header>
  );
}
