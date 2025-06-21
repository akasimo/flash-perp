export interface Position {
  symbol: string;
  size: bigint;
  notional: bigint;
  margin: bigint;
  fundingIndex: bigint;
}

export interface MarketData {
  symbol: string;
  markPrice: bigint;
  indexPrice: bigint;
  fundingRate: bigint;
  volume24h: bigint;
  openInterest: bigint;
}

export interface UserData {
  address: string;
  collateral: bigint;
  freeCollateral: bigint;
  positions: Position[];
}

export type OrderSide = 'long' | 'short';

export interface OrderForm {
  symbol: string;
  side: OrderSide;
  size: string;
  leverage: number;
}