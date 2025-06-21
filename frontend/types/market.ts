// Market and trading related type definitions

export interface Market {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  displayName: string;
  decimals: number;
  minOrderSize: number;
  maxOrderSize: number;
}

export interface PriceInfo {
  markPrice: number;
  oraclePrice: number;
  premium: number;
  premiumPercent: number;
  lastUpdate: number;
}

export interface FundingInfo {
  rate: number;
  ratePercent: number;
  nextFunding: number;
  lastUpdate: number;
}

export interface MarketStats {
  volume24h: number;
  openInterest: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercent: number;
}

export interface Trade {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface OrderForm {
  symbol: string;
  side: 'long' | 'short';
  size: string;
  leverage: number;
  orderType: 'market' | 'limit';
  limitPrice?: string;
  reduceOnly?: boolean;
  timeInForce?: 'IOC' | 'FOK' | 'GTC';
}

export interface PositionSummary {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  notional: number;
  margin: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  fundingAccrued: number;
  marginRatio: number;
  liquidationPrice: number;
  leverage: number;
  timestamp: number;
}

export interface TransactionHistory {
  id: string;
  type: 'deposit' | 'withdraw' | 'open' | 'close' | 'liquidation' | 'funding';
  symbol?: string;
  amount: number;
  price?: number;
  fee: number;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  freeCollateral: number;
  usedMargin: number;
  marginRatio: number;
  buyingPower: number;
  totalFunding: number;
}

// Chart data types
export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartConfig {
  symbol: string;
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  range: '1H' | '4H' | '1D' | '1W' | '1M';
}

// WebSocket data types
export interface PriceUpdate {
  symbol: string;
  markPrice: number;
  oraclePrice: number;
  timestamp: number;
}

export interface PositionUpdate {
  symbol: string;
  size: number;
  margin: number;
  pnl: number;
  timestamp: number;
}

export interface FundingUpdate {
  symbol: string;
  rate: number;
  timestamp: number;
}