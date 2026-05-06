import { create } from 'zustand';

export type GamePhase = 'MENU' | 'PLAYING' | 'GAMEOVER';

interface GameState {
  phase: GamePhase;
  wave: number;
  energy: number;
  score: number;
  baseHealth: number;
  maxBaseHealth: number;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setWave: (wave: number | ((w: number) => number)) => void;
  setEnergy: (val: number | ((e: number) => number)) => void;
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'MENU',
  wave: 1,
  energy: 100,
  score: 0,
  baseHealth: 10,
  maxBaseHealth: 10,
  
  setPhase: (phase) => set({ phase }),
  setWave: (w) => set((s) => ({ wave: typeof w === 'function' ? w(s.wave) : w })),
  setEnergy: (e) => set((s) => ({ energy: typeof e === 'function' ? e(s.energy) : e })),
  addScore: (points) => set((s) => ({ score: s.score + points })),
  takeDamage: (amount) => set((s) => {
    const newHealth = Math.max(0, s.baseHealth - amount);
    if (newHealth === 0 && s.phase === 'PLAYING') {
      return { baseHealth: newHealth, phase: 'GAMEOVER' };
    }
    return { baseHealth: newHealth };
  }),
  resetGame: () => set({
    phase: 'PLAYING',
    wave: 1,
    energy: 150,
    score: 0,
    baseHealth: 10
  }),
}));
