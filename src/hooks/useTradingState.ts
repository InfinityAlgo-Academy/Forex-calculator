'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TradingState {
  globalPair: string;
  setGlobalPair: (pair: string) => void;
  exchangeRates: Record<string, number>;
  setExchangeRates: (rates: Record<string, number>) => void;
  stats: {
    totalCalculations: number;
    visitors: number;
    popularCalculators: { name: string; count: number }[];
  };
  incrementCalculation: (calculatorName: string) => void;
}

// Default exchange rates
const defaultExchangeRates: Record<string, number> = {
  'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 149.50, 'USD/CHF': 0.8850,
  'AUD/USD': 0.6550, 'USD/CAD': 1.3650, 'NZD/USD': 0.6150, 'XAU/USD': 2350.00,
  'BTC/USD': 67500.00, 'ETH/USD': 3450.00,
  'EUR/GBP': 0.8580, 'EUR/JPY': 162.15, 'GBP/JPY': 189.10, 'EUR/CHF': 0.9600,
  'AUD/JPY': 97.90, 'CAD/JPY': 109.50, 'NZD/JPY': 91.90, 'EUR/AUD': 1.6550,
  'GBP/AUD': 1.9300, 'EUR/CAD': 1.4800, 'GBP/CAD': 1.7250, 'AUD/CAD': 0.8940,
  'AUD/NZD': 1.0640, 'NZD/CAD': 0.8410, 'XAG/USD': 30.50
};

export const useTradingState = create<TradingState>()(
  persist(
    (set, get) => ({
      globalPair: 'EUR/USD',
      setGlobalPair: (pair) => set({ globalPair: pair }),
      exchangeRates: defaultExchangeRates,
      setExchangeRates: (rates) => set({ exchangeRates: rates }),
      stats: {
        totalCalculations: 0,
        visitors: 127,
        popularCalculators: [
          { name: 'Position Size', count: 0 },
          { name: 'Pip Value', count: 0 },
          { name: 'Risk/Reward', count: 0 },
          { name: 'Fibonacci', count: 0 },
          { name: 'Profit/Loss', count: 0 },
        ]
      },
      incrementCalculation: (calculatorName) => {
        const prev = get().stats;
        set({
          stats: {
            ...prev,
            totalCalculations: prev.totalCalculations + 1,
            popularCalculators: prev.popularCalculators.map(c => 
              c.name === calculatorName ? { ...c, count: c.count + 1 } : c
            ).sort((a, b) => b.count - a.count)
          }
        });
      }
    }),
    {
      name: 'forex-trading-state',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ 
        globalPair: state.globalPair,
        stats: state.stats 
      }),
    }
  )
);

// Hydration helper
export const hydrateTradingState = () => {
  useTradingState.persist.rehydrate();
};
