import { create } from 'zustand';
import { Trade, TradeFormData } from '../types/trade';
import { DEMO_TRADES } from '../data/demoTrades';

interface TradeStore {
  trades: Trade[];
  nextId: number;
  createTrade: (data: TradeFormData) => Trade;
  updateTrade: (id: number, data: TradeFormData) => Trade | null;
  deleteTrade: (id: number) => boolean;
  getTrade: (id: number) => Trade | undefined;
  listTrades: () => Trade[];
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: DEMO_TRADES,
  nextId: DEMO_TRADES.length + 1,

  createTrade: (data: TradeFormData) => {
    const newTrade: Trade = { ...data, id: get().nextId };
    set((state) => ({
      trades: [newTrade, ...state.trades],
      nextId: state.nextId + 1,
    }));
    return newTrade;
  },

  updateTrade: (id: number, data: TradeFormData) => {
    const updated: Trade = { ...data, id };
    let found = false;
    set((state) => {
      const trades = state.trades.map((t) => {
        if (t.id === id) { found = true; return updated; }
        return t;
      });
      return { trades };
    });
    return found ? updated : null;
  },

  deleteTrade: (id: number) => {
    let found = false;
    set((state) => {
      const trades = state.trades.filter((t) => {
        if (t.id === id) { found = true; return false; }
        return true;
      });
      return { trades };
    });
    return found;
  },

  getTrade: (id: number) => get().trades.find((t) => t.id === id),

  listTrades: () => get().trades,
}));
