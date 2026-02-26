import { useTradeStore } from '../store/tradeStore';
import { TradeFormData } from '../types/trade';

// Re-export store hooks as query-style hooks for consistent API
export function useListTrades() {
  const trades = useTradeStore((s) => s.trades);
  return { data: trades, isLoading: false, error: null };
}

export function useGetTrade(id: number) {
  const getTrade = useTradeStore((s) => s.getTrade);
  const trade = getTrade(id);
  return { data: trade, isLoading: false, error: null };
}

export function useCreateTrade() {
  const createTrade = useTradeStore((s) => s.createTrade);
  return {
    mutate: (data: TradeFormData, options?: { onSuccess?: () => void }) => {
      createTrade(data);
      options?.onSuccess?.();
    },
    isPending: false,
  };
}

export function useUpdateTrade() {
  const updateTrade = useTradeStore((s) => s.updateTrade);
  return {
    mutate: (payload: { id: number; data: TradeFormData }, options?: { onSuccess?: () => void }) => {
      updateTrade(payload.id, payload.data);
      options?.onSuccess?.();
    },
    isPending: false,
  };
}

export function useDeleteTrade() {
  const deleteTrade = useTradeStore((s) => s.deleteTrade);
  return {
    mutate: (id: number, options?: { onSuccess?: () => void }) => {
      deleteTrade(id);
      options?.onSuccess?.();
    },
    isPending: false,
  };
}
