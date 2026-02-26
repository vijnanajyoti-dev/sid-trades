export type TradeCategory = 'Equity' | 'Options' | 'Futures' | 'Forex';
export type TradeTimeFrame = 'Intraday' | 'Swing' | 'LongTerm';
export type TradeMarketCap = 'Small' | 'Mid' | 'Large';
export type TradeResult = 'Profit' | 'Loss' | 'Breakeven';
export type TradeStatus = 'Open' | 'Closed';

export interface Trade {
  id: number;
  date: string;
  scriptName: string;
  category: TradeCategory;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  timeFrame: TradeTimeFrame;
  marketCap: TradeMarketCap;
  sector: string;
  result: TradeResult;
  status: TradeStatus;
  notes: string;
  learningMistakes: string;
}

export type TradeFormData = Omit<Trade, 'id'>;
