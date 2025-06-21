// Smart contract related type definitions

export interface Position {
  size: bigint;
  notional: bigint;
  margin: bigint;
  funding_index: bigint;
}

export interface Reserve {
  base: bigint;
  quote: bigint;
}

export interface FundingData {
  rate: bigint;
  last_update: bigint;
}

export interface PriceData {
  price: bigint;
  timestamp: bigint;
}

// Contract error types
export enum ContractError {
  NotInitialized = 1,
  AlreadyInitialized = 2,
  InsufficientCollateral = 3,
  PositionTooLarge = 4,
  InvalidAmount = 5,
  BelowMaintenanceMargin = 6,
  PositionNotFound = 7,
  Unauthorized = 8,
  Paused = 9,
  OracleUnavailable = 10,
  OracleStale = 11,
  InvalidSymbol = 12,
  ZeroAmount = 13,
  SelfLiquidation = 14,
}

// Transaction types
export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface ContractOperation {
  type: 'deposit' | 'withdraw' | 'open_position' | 'close_position' | 'liquidate';
  params: Record<string, any>;
}

// Market data types
export interface MarketInfo {
  symbol: string;
  markPrice: bigint;
  oraclePrice: bigint;
  fundingRate: bigint;
  volume24h: bigint;
  openInterest: bigint;
  lastUpdate: number;
}

// User portfolio types
export interface UserPosition {
  symbol: string;
  size: bigint;
  notional: bigint;
  margin: bigint;
  entryPrice: bigint;
  markPrice: bigint;
  pnl: bigint;
  fundingAccrued: bigint;
  marginRatio: number;
  liquidationPrice: bigint;
}

export interface UserPortfolio {
  totalCollateral: bigint;
  freeCollateral: bigint;
  usedMargin: bigint;
  totalPnl: bigint;
  positions: UserPosition[];
  marginRatio: number;
}

// Contract client interface
export interface FlashPerpClientInterface {
  // Core functions
  initialize(admin: string): Promise<TransactionResult>;
  depositCollateral(amount: bigint): Promise<TransactionResult>;
  withdrawCollateral(amount: bigint): Promise<TransactionResult>;
  openPosition(symbol: string, size: bigint, margin: bigint): Promise<TransactionResult>;
  closePosition(symbol: string, size: bigint): Promise<TransactionResult>;
  liquidate(trader: string, symbol: string): Promise<TransactionResult>;
  
  // View functions
  getPosition(trader: string, symbol: string): Promise<Position | null>;
  getFreeCollateral(trader: string): Promise<bigint>;
  getMarkPrice(symbol: string): Promise<bigint>;
  getOraclePrice(symbol: string): Promise<bigint>;
  getCollateral(trader: string): Promise<bigint>;
  getFundingData(symbol: string): Promise<FundingData>;
  
  // Admin functions
  pause(): Promise<TransactionResult>;
  unpause(): Promise<TransactionResult>;
  updateFunding(symbol: string, oraclePrice: bigint): Promise<TransactionResult>;
}