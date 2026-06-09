import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { navToView } from '../lib/nav';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { DashboardView } from '../features/dashboard/DashboardView';
import { LibraryView } from '../features/library/LibraryView';
import { AccountsView } from '../features/accounts/AccountsView';
import { StoreView } from '../features/store/StoreView';
import { WishlistView } from '../features/wishlist/WishlistView';
import { GameDetail } from '../features/detail/GameDetail';
import { CommandPalette } from '../components/CommandPalette';
import { Toasts } from '../components/ui/Toasts';

export function App() {
  const init = useStore((s) => s.init);
  const activeNav = useStore((s) => s.activeNav);
  const view = navToView(activeNav);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-bg text-text">
      {/* ambient animated backdrop */}
      <div className="app-aurora" aria-hidden />

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full overflow-hidden"
            >
              {view === 'dashboard' ? (
                <DashboardView />
              ) : view === 'accounts' ? (
                <AccountsView />
              ) : view === 'store' ? (
                <StoreView />
              ) : view === 'wishlist' ? (
                <WishlistView />
              ) : (
                <LibraryView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GameDetail />
      <CommandPalette />
      <Toasts />
    </div>
  );
}
