// Error handling and mapping for Soroban contract interactions

import { ContractError } from './types';

// Contract error codes mapping
const CONTRACT_ERRORS: Record<number, ContractError> = {
  1: {
    code: 1,
    message: 'NotInitialized',
    userMessage: 'Contract not initialized. Please contact support.',
  },
  2: {
    code: 2,
    message: 'AlreadyInitialized',
    userMessage: 'Contract already initialized. Please refresh the page.',
  },
  3: {
    code: 3,
    message: 'InsufficientCollateral',
    userMessage: 'Not enough free collateral for this operation.',
  },
  4: {
    code: 4,
    message: 'InvalidPrice',
    userMessage: 'Invalid price. Please check your input.',
  },
  5: {
    code: 5,
    message: 'InvalidAmount',
    userMessage: 'Please enter a valid positive amount.',
  },
  6: {
    code: 6,
    message: 'BelowMaintenanceMargin',
    userMessage: 'Position would be at risk of liquidation.',
  },
  7: {
    code: 7,
    message: 'PositionNotFound',
    userMessage: 'No position found for this market.',
  },
  8: {
    code: 8,
    message: 'MarketNotFound',
    userMessage: 'Market not supported.',
  },
  9: {
    code: 9,
    message: 'InsufficientLiquidity',
    userMessage: 'Not enough liquidity for this trade size.',
  },
  10: {
    code: 10,
    message: 'PriceOutdated',
    userMessage: 'Price data is outdated. Please try again.',
  },
  11: {
    code: 11,
    message: 'MaxLeverageExceeded',
    userMessage: 'Leverage too high. Please reduce position size.',
  },
  12: {
    code: 12,
    message: 'MinPositionSize',
    userMessage: 'Position size too small. Minimum trade size required.',
  },
  13: {
    code: 13,
    message: 'MaxPositionSize',
    userMessage: 'Position size too large. Please reduce trade size.',
  },
  14: {
    code: 14,
    message: 'SelfTrade',
    userMessage: 'Cannot trade against your own order.',
  },
  15: {
    code: 15,
    message: 'SlippageExceeded',
    userMessage: 'Price moved beyond your limit. Please try again.',
  },
  16: {
    code: 16,
    message: 'Overflow',
    userMessage: 'Number too large. Please use a smaller amount.',
  },
  17: {
    code: 17,
    message: 'Unauthorized',
    userMessage: 'You are not authorized to perform this action.',
  },
  18: {
    code: 18,
    message: 'Paused',
    userMessage: 'Trading is temporarily paused.',
  },
};

export class SorobanError extends Error {
  public readonly code: number;
  public readonly userMessage: string;

  constructor(code: number, message?: string) {
    const errorInfo = CONTRACT_ERRORS[code] || {
      code,
      message: message || 'Unknown error',
      userMessage: 'An unexpected error occurred. Please try again.',
    };
    
    super(errorInfo.message);
    this.code = code;
    this.userMessage = errorInfo.userMessage;
    this.name = 'SorobanError';
  }
}

export function parseContractError(error: any): SorobanError {
  // Try to extract error code from various error formats
  let code: number | null = null;
  let message = '';

  if (typeof error === 'string') {
    message = error;
    // Look for Error(code) pattern
    const match = /Error\((\d+)\)/.exec(error);
    if (match) {
      code = Number(match[1]);
    }
  } else if (error?.message) {
    message = error.message;
    // Look for Error(code) pattern in message
    const match = /Error\((\d+)\)/.exec(error.message);
    if (match) {
      code = Number(match[1]);
    }
  }

  // If no code found, try to infer from message content
  if (code === null) {
    if (message.includes('insufficient') || message.includes('InsufficientCollateral')) {
      code = 3;
    } else if (message.includes('invalid') || message.includes('InvalidAmount')) {
      code = 5;
    } else if (message.includes('unauthorized') || message.includes('Unauthorized')) {
      code = 17;
    } else {
      code = 0; // Unknown error
    }
  }

  return new SorobanError(code, message);
}

export function handleContractError(error: any): string {
  try {
    const sorobanError = parseContractError(error);
    console.error('Contract error:', sorobanError);
    return sorobanError.userMessage;
  } catch (e) {
    console.error('Error parsing contract error:', e, error);
    return 'An unexpected error occurred. Please try again.';
  }
}

// Network-specific error handling
export function handleNetworkError(error: any): string {
  if (error?.code === 'NETWORK_ERROR') {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (error?.message?.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  return 'Network error occurred. Please try again.';
}

// Transaction-specific error handling
export function handleTransactionError(error: any): string {
  if (error?.message?.includes('insufficient')) {
    return 'Insufficient balance for transaction fees.';
  }
  
  if (error?.message?.includes('timeout')) {
    return 'Transaction timed out. It may still succeed.';
  }
  
  if (error?.message?.includes('rejected')) {
    return 'Transaction was rejected. Please try again.';
  }
  
  return handleContractError(error);
}