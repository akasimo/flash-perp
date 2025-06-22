// Contract addresses and network configuration

// Helper that makes sure critical env vars are present at **build time** (for
// static-export) and at **run time** (Vercel / Node).  If any are missing or
// still equal to the placeholder, we throw immediately so the developer knows
// to run `scripts/deploy_all.sh` or create a valid `.env.local`.

// During build, Next.js replaces process.env.NEXT_PUBLIC_* with literal values
// In the browser, process.env doesn't exist, so we get the injected values
export const CONTRACTS = {
  PERP: process.env.NEXT_PUBLIC_PERP_CONTRACT || '',
  TOKEN: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '',
  ORACLE: process.env.NEXT_PUBLIC_ORACLE_CONTRACT || '',
} as const;

export const NETWORK = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || '',
  PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || '',
} as const;

// Validation function that can be called when needed
export function validateConfiguration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!CONTRACTS.PERP || CONTRACTS.PERP.includes('PLACEHOLDER')) {
    errors.push('PERP contract not configured or contains placeholder');
  }
  if (!CONTRACTS.TOKEN || CONTRACTS.TOKEN.includes('PLACEHOLDER')) {
    errors.push('TOKEN contract not configured or contains placeholder');
  }
  if (!CONTRACTS.ORACLE || CONTRACTS.ORACLE.includes('PLACEHOLDER')) {
    errors.push('ORACLE contract not configured or contains placeholder');
  }
  if (!NETWORK.RPC_URL) {
    errors.push('RPC_URL not configured');
  }
  if (!NETWORK.PASSPHRASE) {
    errors.push('Network passphrase not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export const DECIMALS = {
  TOKEN: 6,           // USDC-style token decimals
  ORACLE: 14,         // Oracle price decimals  
  PRICE_DISPLAY: 6,   // Display decimals for prices
} as const;

export const POLLING_INTERVALS = {
  PRICES: 2000,       // 2 seconds for mark/index prices
  FUNDING: 30000,     // 30 seconds for funding rate
  BALANCES: 5000,     // 5 seconds for balances
  POSITIONS: 3000,    // 3 seconds for positions
} as const;

export const SCALING_FACTORS = {
  DEC6: 1_000_000n,
  DEC14: 10_000_000_000_000_000n,
  ORACLE_TO_MARK: 100_000_000n, // Convert from 14 decimals to 6
} as const;

// Market symbols supported
export const SUPPORTED_MARKETS = ['BTCUSD', 'ETHUSD', 'XLMUSD'] as const;
export type MarketSymbol = typeof SUPPORTED_MARKETS[number];