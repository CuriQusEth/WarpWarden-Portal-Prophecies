import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'motion/react';
import { useAccount, useSendTransaction, useSignMessage } from 'wagmi';
import confetti from 'canvas-confetti';
import { getAttributionPayload } from '../lib/erc8021/attributions';

export default function GameOverMenu() {
  const { wave, score, resetGame } = useGameStore();
  const { address, isConnected } = useAccount();
  const { sendTransaction, isPending: isTxPending } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  const [statusText, setStatusText] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#b026ff', '#ffd700']
    });
  };

  const handleRecordDefense = async () => {
    if (!isConnected || !address) {
      setStatusText("Please connect wallet first!");
      return;
    }
    
    setStatusText("Signing message (SIWE)...");
    try {
      // 1. SIWE Simulation (Score Signature)
      const message = `WARPWARDEN\nDefended Wave: ${wave}\nScore: ${score}\nAddress: ${address}\nNonce: ${Math.floor(Math.random() * 1000000)}`;
      const signature = await signMessageAsync({ account: address, message });
      console.log("SIWE Signature acquired:", signature);
      
      // 2. Transact (Recording score + ERC8021 Attribution on Base)
      setStatusText("Confirm transaction...");
      
      // We send a 0-value transaction to self with the attribution data as extra calldata
      // In a real implementation this would call a Base contract.
      sendTransaction({
        to: address, 
        value: 0n,
        data: getAttributionPayload(), // Injecting the Base Builder Code
      }, {
        onSuccess: (hash) => {
          triggerConfetti();
          setStatusText(`Defense recorded! Hash: ${hash.slice(0, 8)}...`);
        },
        onError: (e) => {
          setStatusText("Transaction failed.");
          console.error(e);
        }
      });
      
    } catch (e) {
      console.error(e);
      setStatusText("Signature rejected");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md font-sans">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#050508] border border-red-500/50 p-8 max-w-sm w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-purple-500" />
        
        <h2 className="text-4xl font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 mb-2">
          REALM FALLEN
        </h2>
        <p className="text-[10px] uppercase text-gray-400 tracking-widest font-bold mb-8">Defenses Overwhelmed</p>
        
        <div className="p-4 border border-white/10 bg-white/5 mb-6 text-left">
          <label className="text-[10px] uppercase text-gray-400 tracking-widest block mb-4 font-bold">Performance</label>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-300">Waves Survived</span>
            <span className="text-lg font-black text-white">{wave > 1 ? wave - 1 : 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300">Total Score</span>
            <span className="text-lg font-black text-amber-400">{score}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleRecordDefense}
            disabled={isTxPending || !isConnected}
            className="group p-4 bg-purple-600 hover:bg-purple-500 transition-all text-white flex flex-col items-center justify-center border-b-4 border-purple-800 disabled:opacity-50"
          >
            <span className="text-sm font-black uppercase tracking-widest">{isTxPending ? 'RECORDING...' : 'RECORD DEFENSE'}</span>
            <span className="text-[8px] uppercase tracking-[0.2em] opacity-70 mt-1">Base Mainnet Transaction</span>
          </button>
          
          <button 
            onClick={() => resetGame()}
            className="p-4 bg-white/10 hover:bg-white/20 transition-all text-white font-black uppercase tracking-widest text-xs"
          >
            TRY AGAIN
          </button>
        </div>

        {statusText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
             {statusText}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
