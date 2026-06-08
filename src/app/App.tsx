import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { navToView } from '../lib/nav';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { DashboardView } from '../features/dashboard/DashboardView';
import { LibraryView } from '../features/library/LibraryView';
import { AccountsView } from '../features/accounts/AccountsView';
import { GameDetail } from '../features/detail/GameDetail';
import { Toasts } from '../components/ui/Toasts';

export function App() {
  const init = useStore((s) => s.init);
  const activeNav = useStore((s) => s.activeNav);
  const view = navToView(activeNav);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
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
              ) : (
                <LibraryView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GameDetail />
      <Toasts />
    </div>
  );
}
