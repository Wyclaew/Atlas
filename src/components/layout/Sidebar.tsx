import {
  Gamepad2, Library, Monitor, Swords, FolderOpen,
  Heart, Clock, Trophy, Settings, RefreshCw, Menu, X
} from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavSection } from '../../types';

interface MenuItem {
  id: NavSection;
  label: string;
  icon: typeof Library;
  count?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function Sidebar() {
  const { activeNav, setActiveNav, stats, isSyncing, syncMessage, isSidebarOpen, toggleSidebar } = useGameStore();

  const menuSections: MenuSection[] = [
    {
      title: 'LIBRARY',
      items: [
        { id: 'all', label: 'All Games', icon: Library, count: stats.totalGames }
      ]
    },
    {
      title: 'PLATFORMS',
      items: [
        { id: 'steam', label: 'Steam', icon: Monitor, count: stats.steamGames },
        { id: 'epic', label: 'Epic Games', icon: Swords, count: stats.epicGames },
        { id: 'custom', label: 'Local', icon: FolderOpen, count: stats.customGames }
      ]
    },
    {
      title: 'COLLECTIONS',
      items: [
        { id: 'favorites', label: 'Favorites', icon: Heart },
        { id: 'playing', label: 'Playing', icon: Gamepad2, count: stats.statusCounts.Playing },
        { id: 'backlog', label: 'Backlog', icon: Clock, count: stats.statusCounts.Backlog },
        { id: 'completed', label: 'Completed', icon: Trophy, count: stats.statusCounts.Completed }
      ]
    }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`border-r border-white/[0.06] flex flex-col h-screen z-20 relative overflow-y-auto scrollbar-none bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-sm ${
        isSidebarOpen ? 'px-5 py-6' : 'px-3 py-6'
      }`}
    >
      <div className="w-full flex-1">
        {/* Header */}
        <div className={`mb-12 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} w-full`}>
          {isSidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-white leading-none">
                  GameMgr
                </span>
                <span className="text-[10px] font-mono text-indigo-400 mt-0.5">
                  v2.0
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600"
            >
              <Gamepad2 className="w-5 h-5 text-white" />
            </motion.div>
          )}

          <AnimatePresence>
            {isSidebarOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => toggleSidebar()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {!isSidebarOpen && (
            <button
              onClick={() => toggleSidebar()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-8">
          {menuSections.map((section, idx) => (
            <motion.div key={section.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-3"
                  >
                    {section.title}
                  </motion.span>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center ${isSidebarOpen ? 'justify-between px-3' : 'justify-center'} py-2.5 w-full rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-indigo-500/15 border border-indigo-500/30'
                          : 'hover:bg-white/[0.05] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ color: isActive ? '#6366f1' : '#a0a0a0' }}
                          transition={{ duration: 0.2 }}
                        >
                          <item.icon size={18} />
                        </motion.div>

                        <AnimatePresence>
                          {isSidebarOpen && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              className={`text-sm whitespace-nowrap transition-colors duration-200 ${
                                isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'
                              }`}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {isSidebarOpen && item.count !== undefined && item.count > 0 && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
                              isActive
                                ? 'bg-indigo-500/30 text-indigo-300'
                                : 'bg-white/[0.05] text-slate-500 group-hover:bg-white/[0.08]'
                            }`}
                          >
                            {item.count}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full pt-6 mt-auto border-t border-white/[0.06] flex-shrink-0 space-y-3">
        <AnimatePresence>
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center py-2'} rounded-lg bg-indigo-500/10 border border-indigo-500/20`}
            >
              <RefreshCw size={16} className="animate-spin text-indigo-400 flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium text-indigo-300 truncate"
                  >
                    {syncMessage || 'Syncing...'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setActiveNav('settings')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative flex items-center ${isSidebarOpen ? 'justify-between px-3' : 'justify-center'} py-2.5 w-full rounded-lg transition-all duration-200 group ${
            activeNav === 'settings'
              ? 'bg-indigo-500/15 border border-indigo-500/30'
              : 'hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ color: activeNav === 'settings' ? '#6366f1' : '#a0a0a0' }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={18} />
            </motion.div>

            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className={`text-sm whitespace-nowrap transition-colors ${
                    activeNav === 'settings' ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
    </motion.aside>
  );
}
