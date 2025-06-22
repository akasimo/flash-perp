// Trading operations for FlashPerp contract interactions

import { createContractCall, buildTransaction, parseTokenAmount } from './soroban-client';
import { CONTRACTS } from '@/lib/constants/contracts';
import { handleContractError } from './error-handler';

export interface TradeParams {
  trader: string;
  symbol: string;
  size: number;      // Position size in display units
  margin?: number;   // Margin in display units  
  limitPrice?: number; // Limit price (for limit orders)
}

export interface DepositParams {
  trader: string;
  amount: number;    // Amount in display units
}

export interface WithdrawParams {
  trader: string;
  amount: number;    // Amount in display units
}

/**
 * Create approve transaction for token spending
 */
export async function createApproveTransaction(
  trader: string,
  amount: number,
  expirationLedger: number = 999999
): Promise<string> {
  try {
    const rawAmount = parseTokenAmount(amount);
    
    const approveOp = createContractCall(CONTRACTS.TOKEN, 'approve', {
      from: trader,
      spender: CONTRACTS.PERP,
      amount: rawAmount.toString(),
      expiration_ledger: expirationLedger,
    });
    
    return await buildTransaction(trader, [approveOp]);
  } catch (error) {
    console.error('Error creating approve transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Create deposit transaction
 */
export async function createDepositTransaction({
  trader,
  amount,
}: DepositParams): Promise<string> {
  try {
    const rawAmount = parseTokenAmount(amount);
    
    const depositOp = createContractCall(CONTRACTS.PERP, 'deposit_collateral', {
      trader,
      amount: rawAmount.toString(),
    });
    
    return await buildTransaction(trader, [depositOp]);
  } catch (error) {
    console.error('Error creating deposit transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Create combined approve + deposit transaction
 * NOTE: This function is deprecated because Soroban doesn't support multiple operations
 * in a single transaction when using prepareTransaction. Use separate transactions instead.
 */
export async function createApproveAndDepositTransaction({
  trader,
  amount,
}: DepositParams): Promise<string> {
  throw new Error(
    'Batched approve + deposit is not supported by Soroban. Use separate approve and deposit transactions.'
  );
}

/**
 * Create withdraw transaction
 */
export async function createWithdrawTransaction({
  trader,
  amount,
}: WithdrawParams): Promise<string> {
  try {
    const rawAmount = parseTokenAmount(amount);
    
    const withdrawOp = createContractCall(CONTRACTS.PERP, 'withdraw_collateral', {
      trader,
      amount: rawAmount.toString(),
    });
    
    return await buildTransaction(trader, [withdrawOp]);
  } catch (error) {
    console.error('Error creating withdraw transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Create open position transaction (market order)
 */
export async function createOpenPositionTransaction({
  trader,
  symbol,
  size,
  margin,
  limitPrice,
}: TradeParams): Promise<string> {
  try {
    const rawSize = parseTokenAmount(Math.abs(size));
    
    // Calculate margin - if provided, it's already in display units (USD)
    let rawMargin: bigint;
    if (margin && margin > 0) {
      rawMargin = parseTokenAmount(margin);
    } else {
      // Default: calculate 25% of position value as margin for safety
      // This ensures we meet the contract's 20% requirement with buffer
      const positionValue = Math.abs(size) * 0.1; // Assume $0.1 price for XLM
      rawMargin = parseTokenAmount(positionValue * 0.25);
    }
    
    // Simpler limit price strategy for market orders
    let rawLimitPrice: bigint;
    if (limitPrice) {
      rawLimitPrice = parseTokenAmount(limitPrice);
    } else {
      // For market orders: use very permissive limits to avoid slippage failures
      if (size > 0) {
        // For longs (buying): use very high limit price to ensure execution
        rawLimitPrice = parseTokenAmount(999999); // $999,999 - extremely high upper limit
      } else {
        // For shorts (selling): use very low limit price to ensure execution
        rawLimitPrice = parseTokenAmount(0.000001); // $0.000001 - extremely low lower limit
      }
    }
    
    const baseSym = symbol.replace('USD', '');
    const openOp = createContractCall(CONTRACTS.PERP, 'open_position', {
      trader,
      symbol: baseSym,
      size: (size > 0 ? rawSize : -rawSize).toString(), // Preserve sign
      margin: rawMargin.toString(),
      limit_price: rawLimitPrice.toString(), // Add missing limit_price parameter
    });
    
    return await buildTransaction(trader, [openOp]);
  } catch (error) {
    console.error('Error creating open position transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Create close position transaction
 */
export async function createClosePositionTransaction(
  trader: string,
  symbol: string,
  size?: number, // If not provided, close entire position
  limitPrice?: number // Limit price for slippage protection
): Promise<string> {
  try {
    if (!size) {
      throw new Error('Size is required for close position');
    }
    
    // Default to very permissive limit price if not provided (market order behavior)
    const rawLimitPrice = limitPrice ? parseTokenAmount(limitPrice) :
      (size > 0 ? parseTokenAmount(0.000001) : parseTokenAmount(999999999)); // Very low for closing longs, very high for closing shorts
    
    const baseSym = symbol.replace('USD', '');
    const closeOp = createContractCall(CONTRACTS.PERP, 'close_position', {
      trader,
      symbol: baseSym,
      size: parseTokenAmount(Math.abs(size)).toString(),
      limit_price: rawLimitPrice.toString(), // Add missing limit_price parameter
    });
    
    return await buildTransaction(trader, [closeOp]);
  } catch (error) {
    console.error('Error creating close position transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Create modify margin transaction
 */
export async function createModifyMarginTransaction(
  trader: string,
  symbol: string,
  marginDelta: number // Positive to add, negative to remove
): Promise<string> {
  try {
    const rawDelta = parseTokenAmount(Math.abs(marginDelta));
    const operation = marginDelta > 0 ? 'add_margin' : 'remove_margin';
    
    const baseSym = symbol.replace('USD', '');
    const modifyOp = createContractCall(CONTRACTS.PERP, operation, {
      trader,
      symbol: baseSym,
      amount: rawDelta.toString(),
    });
    
    return await buildTransaction(trader, [modifyOp]);
  } catch (error) {
    console.error('Error creating modify margin transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Create limit order transaction (if supported)
 */
export async function createLimitOrderTransaction({
  trader,
  symbol,
  size,
  limitPrice,
  margin,
}: TradeParams): Promise<string> {
  try {
    if (!limitPrice) {
      throw new Error('Limit price is required for limit orders');
    }
    
    const rawSize = parseTokenAmount(Math.abs(size));
    const rawPrice = parseTokenAmount(limitPrice);
    const rawMargin = margin ? parseTokenAmount(margin) : rawSize;
    
    const baseSym = symbol.replace('USD', '');
    const limitOp = createContractCall(CONTRACTS.PERP, 'place_limit_order', {
      trader,
      symbol: baseSym,
      size: (size > 0 ? rawSize : -rawSize).toString(),
      price: rawPrice.toString(),
      margin: rawMargin.toString(),
    });
    
    return await buildTransaction(trader, [limitOp]);
  } catch (error) {
    console.error('Error creating limit order transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Cancel limit order transaction (if supported)
 */
export async function createCancelOrderTransaction(
  trader: string,
  orderId: string
): Promise<string> {
  try {
    const cancelOp = createContractCall(CONTRACTS.PERP, 'cancel_order', {
      trader,
      order_id: orderId,
    });
    
    return await buildTransaction(trader, [cancelOp]);
  } catch (error) {
    console.error('Error creating cancel order transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Liquidate position transaction (if user has liquidation permissions)
 */
export async function createLiquidateTransaction(
  liquidator: string,
  trader: string,
  symbol: string
): Promise<string> {
  try {
    const baseSym = symbol.replace('USD', '');
    const liquidateOp = createContractCall(CONTRACTS.PERP, 'liquidate', {
      liquidator,
      trader,
      symbol: baseSym,
    });
    
    return await buildTransaction(liquidator, [liquidateOp]);
  } catch (error) {
    console.error('Error creating liquidate transaction:', error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Utility function to estimate transaction fees
 */
export function estimateTransactionFee(operationCount: number = 1): number {
  // Base fee per operation (in stroops, 1 XLM = 10,000,000 stroops)
  const baseFee = 100;
  return (baseFee * operationCount) / 10_000_000; // Convert to XLM
}

/**
 * Validate trade parameters
 */
export function validateTradeParams(params: TradeParams): string | null {
  if (!params.trader) {
    return 'Trader address is required';
  }
  
  if (!params.symbol) {
    return 'Market symbol is required';
  }
  
  if (!params.size || params.size === 0) {
    return 'Position size must be greater than 0';
  }
  
  if (params.limitPrice && params.limitPrice <= 0) {
    return 'Limit price must be greater than 0';
  }
  
  if (params.margin && params.margin <= 0) {
    return 'Margin must be greater than 0';
  }
  
  return null;
}

/**
 * Calculate required margin for a trade
 */
export function calculateRequiredMargin(
  size: number,
  price: number,
  leverage: number = 1
): number {
  return (Math.abs(size) * price) / leverage;
}

/**
 * Calculate position value
 */
export function calculatePositionValue(size: number, price: number): number {
  return Math.abs(size) * price;
}

/**
 * Calculate PnL for a position
 */
export function calculatePnL(
  size: number,
  entryPrice: number,
  currentPrice: number
): { pnl: number; pnlPercent: number } {
  const priceDiff = currentPrice - entryPrice;
  const pnl = size * priceDiff;
  const pnlPercent = entryPrice > 0 ? (priceDiff / entryPrice) * 100 : 0;
  
  return { pnl, pnlPercent };
}