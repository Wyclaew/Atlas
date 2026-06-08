// components/layout/MainLayout.tsx — Ana Düzen Bileşeni

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GameGrid } from '../games/GameGrid';
import { GameDetailPanel } from '../games/GameDetailPanel';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useGameStore } from '../../stores/useGameStore';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Game } from '../../types';

interface MainLayoutProps {
  onLaunchGame: (game: Game) => void;
}

export function MainLayout({ onLaunchGame }: MainLayoutProps) {
  const { activeNav, toasts, removeToast } = useGameStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-white/[0.01] via-white/[0.005] to-white/[0.01] text-white">
      {/* Global Toast Notification Portal */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.15 } }}
              className={`glass p-4 rounded-lg flex items-center justify-between pointer-events-auto shadow-lg ${
                t.type === 'error'
                  ? 'border-l-2 border-l-red-500 bg-red-500/10'
                  : t.type === 'success'
                    ? 'border-l-2 border-l-green-500 bg-green-500/10'
                    : 'border-l-2 border-l-indigo-500 bg-indigo-500/10'
              }`}
            >
              <span className="text-sm font-medium text-white pr-3">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer outline-none"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-none relative px-10 pb-12">
          
          {/* Üst Araç Çubuğu - Sabit */}
          {activeNav !== 'settings' && <TopBar />}
          
          <div className="mt-4">
            <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {activeNav === 'settings' ? (
                <SettingsPanel />
              ) : (
                <GameGrid onLaunchGame={onLaunchGame} />
              )}
            </motion.div>
          </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Detay paneli (overlay) */}
      <GameDetailPanel onLaunch={onLaunchGame} />
    </div>
  );
}
