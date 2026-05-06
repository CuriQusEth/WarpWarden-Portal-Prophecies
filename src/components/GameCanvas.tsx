import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameEngine, TowerType } from '../game/engine';
import { motion, AnimatePresence } from 'motion/react';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { wave, energy, score, baseHealth, setPhase } = useGameStore();

  const [selectedTower, setSelectedTower] = useState<TowerType>('BASIC');
  const [showPlacementError, setShowPlacementError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Handle resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        engine.resize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    resizeObserver.observe(containerRef.current);
    
    engine.start();

    return () => {
      engine.stop();
      resizeObserver.disconnect();
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const success = engineRef.current.placeTower(x, y, selectedTower);
    if (!success) {
      setShowPlacementError(true);
      setTimeout(() => setShowPlacementError(false), 500);
    }
  };

  const TOWER_PRICES = { BASIC: 50, SNIPER: 100, CHAIN: 120 };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#050508] font-sans" ref={containerRef}>
      
      {/* Background and overlays handled by canvas/engine, but we can add a subtle grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start pointer-events-none">
        
        <div className="flex flex-col gap-6 p-6 pointer-events-auto w-64 max-w-[50%]">
          <div className="p-4 border border-white/10 bg-white/5 backdrop-blur-md">
             <label className="text-[10px] uppercase text-gray-400 tracking-widest block mb-2 font-bold">Warp Energy</label>
             <div className="text-4xl sm:text-5xl font-black text-cyan-400 flex items-baseline gap-2">
                {energy} <span className="text-xs text-cyan-400/50 uppercase">WE</span>
             </div>
             <div className="w-full h-1 bg-gray-800 mt-4 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, energy/10)}%` }}></div>
             </div>
          </div>
          
          <div className="p-4 border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
             <label className="text-[10px] uppercase text-gray-400 tracking-widest block mb-2 font-bold">Base Health</label>
             <div className={`text-4xl font-black flex items-baseline gap-2 ${baseHealth <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {baseHealth} <span className="text-xs text-white/50 uppercase">HP</span>
             </div>
             <div className="w-full h-1 bg-gray-800 mt-4 overflow-hidden">
                <div className={`h-full ${baseHealth <= 3 ? 'bg-red-500' : 'bg-white'}`} style={{ width: `${(baseHealth/10)*100}%` }}></div>
             </div>
          </div>
        </div>

        {/* Wave Stats positioned at Top Right */}
        <div className="p-6 text-right pointer-events-none z-10 w-64 max-w-[50%]">
          <div className="text-5xl sm:text-7xl font-black text-white/10 select-none">WAVE {wave}</div>
          <div className="text-[8px] sm:text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase mt-2">Score {score}</div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-crosshair z-0"
        style={{ position: 'absolute', inset: 0 }}
        onClick={handleCanvasClick}
      />
      
      {/* Bottom Controls */}
      <footer className="absolute bottom-0 left-0 right-0 h-auto sm:h-32 bg-[#0a0a14] border-t border-white/5 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 w-full pb-8 sm:pb-4 pointer-events-auto">
        <div className="flex flex-col justify-center sm:border-r border-white/10 sm:pr-8">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center sm:text-left">Tower Placer</span>
          <span className="text-xl font-black text-white text-center sm:text-left">REALM PROTECTOR</span>
        </div>
        
        {/* Tower Selector Menu */}
        <div className="flex gap-2 w-full justify-center sm:w-auto">
            {(['BASIC', 'SNIPER', 'CHAIN'] as TowerType[]).map(t => (
               <div
                key={t}
                onClick={() => setSelectedTower(t)}
                className={`w-20 h-16 sm:w-24 sm:h-20 flex flex-col items-center justify-center cursor-pointer transition-colors border ${selectedTower === t ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'border-white/20 text-white hover:border-cyan-400'}`}
               >
                 <span className={`font-black text-sm sm:text-lg ${selectedTower === t ? '' : 'opacity-60'}`}>{t}</span>
                 <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter ${selectedTower === t ? '' : 'opacity-40'}`}>{TOWER_PRICES[t]} WE</span>
               </div>
            ))}
        </div>

        {/* Start Wave Button */}
        <button 
          className="w-full sm:w-auto px-6 py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_#00f3ff] shrink-0"
          onClick={() => engineRef.current?.startWave()}
        >
          START WAVE
        </button>
      </footer>

      {/* Error overlay */}
      <AnimatePresence>
        {showPlacementError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/80 text-white font-sans font-black tracking-widest text-xs px-6 py-3 pointer-events-none"
          >
            INVALID PLACEMENT OR NO ENERGY
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
