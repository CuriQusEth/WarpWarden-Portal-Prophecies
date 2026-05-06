import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/web3/config';
import { useGameStore } from './store/gameStore';
import MainScreen from './components/MainScreen';
import GameCanvas from './components/GameCanvas';
import GameOverMenu from './components/GameOverMenu';

const queryClient = new QueryClient();

function GameRouter() {
  const { phase } = useGameStore();

  return (
    <div className="w-full h-screen relative bg-warp-dark">
      {phase === 'MENU' && <MainScreen />}
      {(phase === 'PLAYING' || phase === 'GAMEOVER') && <GameCanvas />}
      {phase === 'GAMEOVER' && <GameOverMenu />}
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GameRouter />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
