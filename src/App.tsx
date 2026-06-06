import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useSendTransaction } from 'wagmi';
import { config } from './lib/web3/config';
import { useGameStore } from './store/gameStore';
import MainScreen from './components/MainScreen';
import GameCanvas from './components/GameCanvas';
import GameOverMenu from './components/GameOverMenu';
import { stringToHex } from 'viem';
import { Sun } from 'lucide-react';

const queryClient = new QueryClient();

function GMButton() {
  const { isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const sendGMTransaction = () => {
    sendTransaction({
      to: '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3',
      data: stringToHex('gm'),
      value: 0n,
    });
  };

  if (!isConnected) return null;

  return (
    <div className="absolute top-4 left-4 z-50">
      <button 
        onClick={sendGMTransaction}
        className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
      >
        <Sun size={14} />
        Say GM
      </button>
    </div>
  );
}

function GameRouter() {
  const { phase } = useGameStore();

  return (
    <div className="w-full h-screen relative bg-warp-dark overflow-hidden">
      <GMButton />
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
