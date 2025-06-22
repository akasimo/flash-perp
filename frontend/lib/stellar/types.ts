// TypeScript types for Stellar/Soroban interactions

import { MarketSymbol } from '@/lib/constants/contracts';

// Contract method parameter types
export interface ContractCallParams {
  contractId: string;
  method: string;
  args: any[];
}

// Position data from contract
export interface RawPosition {
  trader: string;
  symbol: string;
  size: bigint;
  margin: bigint;
  entry_price: bigint;
  last_funding_index: bigint;
}

// UI-friendly position data
export interface Position {
  symbol: MarketSymbol;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
}

// Funding data
export interface FundingData {
  rate: number;          // 0.0001 → 0.01%
  nextEpochTs?: number;  // Optional next funding time
}

// Balance information
export interface BalanceData {
  wallet: bigint;        // Token balance in wallet
  exchange: bigint;      // Free collateral on exchange
  total: bigint;         // Total available
}

// Transaction result
export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// Contract error mapping
export interface ContractError {
  code: number;
  message: string;
  userMessage: string;
}

// Price data
export interface PriceData {
  markPrice: number;
  indexPrice: number;
  funding: FundingData;
  lastUpdate: number;
}

// Event data from contract
export interface ContractEvent {
  type: 'DEPOSIT' | 'WITHDRAW' | 'OPEN' | 'CLOSE' | 'LIQUIDATE';
  trader: string;
  symbol?: string;
  amount?: bigint;
  price?: bigint;
  timestamp: number;
}

// Order data (for future implementation)
export interface Order {
  id: string;
  trader: string;
  symbol: MarketSymbol;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  type: 'market' | 'limit';
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

// Faucet request
export interface FaucetRequest {
  address: string;
  captcha?: string;
}

export interface FaucetResponse {
  success: boolean;
  hash?: string;
  error?: string;
  amount?: number;
}