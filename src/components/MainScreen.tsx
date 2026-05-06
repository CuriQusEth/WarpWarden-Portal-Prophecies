import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'motion/react';
import { useAccount, useConnect, useSendTransaction } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getAttributionPayload } from '../lib/erc8021/attributions';

export default function MainScreen() {
  const { setPhase } = useGameStore();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { sendTransaction, isPending } = useSendTransaction();
  const [gmStatus, setGmStatus] = useState('');

  const handleSayGm = () => {
    if (!address) return;
    setGmStatus('Confirming...');
    sendTransaction({
      to: address,
      value: 0n,
      data: getAttributionPayload(), // Emitting builder data as proof of interaction
    }, {
      onSuccess: (hash) => {
        setGmStatus(`GM Said!`);
        setTimeout(() => setGmStatus(''), 3000);
      },
      onError: () => setGmStatus('Canceled')
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#050508] font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#a855f7_0%,_transparent_60%)] opacity-20 pointer-events-none" />
      <motion.div 
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#22d3ee_10px,#22d3ee_11px)] opacity-5 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center p-6 text-center max-w-sm w-full">
        
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-6xl font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 mb-2"
        >
          WARPWARDEN
        </motion.h1>
        
        <div className="flex gap-4 mt-2 mb-12">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold px-2 py-0.5 border border-cyan-400/30 bg-cyan-400/10">System Stable</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold px-2 py-0.5 border border-purple-400/30 bg-purple-400/10">Rift Ready</span>
        </div>

        <motion.div 
          className="flex flex-col gap-4 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {!isConnected ? (
            <button 
              onClick={() => connect({ connector: injected() })}
              className="px-6 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_#00f3ff]"
            >
              CONNECT WALLET
            </button>
          ) : (
            <>
              <div className="text-[10px] uppercase text-gray-500 tracking-widest font-bold mb-1">Warden Identity</div>
              <div className="font-mono text-amber-400 mb-2 bg-white/5 border border-white/10 px-4 py-2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button 
                onClick={handleSayGm}
                disabled={isPending}
                className="mb-4 px-6 py-2 border border-purple-500 hover:bg-purple-500/20 text-purple-400 font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50"
              >
                {gmStatus || "Say GM (On-Chain)"}
              </button>
              
              <button 
                onClick={() => setPhase('PLAYING')}
                className="px-6 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_#00f3ff]"
              >
                DEPLOY WARDEN
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* Base App ID Meta Mockup */}
      <div className="absolute bottom-4 text-[8px] text-white/20 font-mono tracking-widest opacity-80">
        APP_ID: 68ed3d92346a767663952018 | BUILDER: bc_4u3cx6kl
      </div>
    </div>
  )
}
