// App.tsx — Ana Uygulama Bileşeni
// Uygulama başlangıcında veritabanını yükler ve ana düzeni render eder

import { useEffect, useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { useGameStore } from './stores/useGameStore';
import { useGameLauncher } from './hooks/useGameLauncher';
import type { Game } from './types';

function App() {
  const { loadGames } = useGameStore();
  const { launchGame } = useGameLauncher();

  // Uygulama başlangıcında oyunları yükle
  useEffect(() => {
    const init = async () => {
      try {
        await loadGames();
        console.log('✅ Oyun kütüphanesi yüklendi');
      } catch (err) {
        console.error('❌ Başlangıç hatası:', err);
      }
    };
    init();
  }, []);

  // Oyun başlatma handler'ı
  const handleLaunchGame = useCallback(async (game: Game) => {
    try {
      await launchGame(game);
    } catch (err) {
      console.error('Oyun başlatma hatası:', err);
      // İleride toast notification eklenecek
    }
  }, [launchGame]);

  return <MainLayout onLaunchGame={handleLaunchGame} />;
}

export default App;
