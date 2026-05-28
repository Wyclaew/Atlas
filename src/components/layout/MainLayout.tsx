// components/layout/MainLayout.tsx — Ana Düzen Bileşeni
// CSS Grid ile sidebar + content düzenini yönetir

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GameGrid } from '../games/GameGrid';
import { GameDetailPanel } from '../games/GameDetailPanel';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useGameStore } from '../../stores/useGameStore';
import type { Game } from '../../types';

interface MainLayoutProps {
  onLaunchGame: (game: Game) => void;
}

export function MainLayout({ onLaunchGame }: MainLayoutProps) {
  const { activeNav } = useGameStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Sol: Sidebar */}
      <Sidebar />

      {/* Sağ: Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Üst: Araç çubuğu (Ayarlar sayfası dışında gösterilir) */}
        {activeNav !== 'settings' && <TopBar />}

        {/* İçerik alanı */}
        <main className="flex-1 overflow-hidden">
          {activeNav === 'settings' ? (
            <SettingsPanel />
          ) : (
            <GameGrid onLaunchGame={onLaunchGame} />
          )}
        </main>
      </div>

      {/* Detay paneli (overlay) */}
      <GameDetailPanel onLaunch={onLaunchGame} />
    </div>
  );
}
