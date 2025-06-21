// App-wide constants for FlashPerp frontend

// Network configuration
export const NETWORK = {
  TESTNET: 'TESTNET' as const,
  MAINNET: 'MAINNET' as const,
} as const;

export const HORIZON_URLS = {
  [NETWORK.TESTNET]: 'https://horizon-testnet.stellar.org',
  [NETWORK.MAINNET]: 'https://horizon.stellar.org',
} as const;

export const NETWORK_PASSPHRASE = {
  [NETWORK.TESTNET]: 'Test SDF Network ; September 2015',
  [NETWORK.MAINNET]: 'Public Global Stellar Network ; September 2015',
} as const;

// Contract configuration
export const CONTRACTS = {
  PERP: process.env.NEXT_PUBLIC_PERP_CONTRACT || '',
  ORACLE: process.env.NEXT_PUBLIC_ORACLE_CONTRACT || '',
} as const;

// Market configuration
export const MARKETS = {
  XLMUSD: {
    symbol: 'XLMUSD',
    baseAsset: 'XLM',
    quoteAsset: 'USD',
    displayName: 'XLM/USD',
    decimals: 6,
    minOrderSize: 1,
    maxOrderSize: 1000000,
  },
  BTCUSD: {
    symbol: 'BTCUSD',
    baseAsset: 'BTC',
    quoteAsset: 'USD',
    displayName: 'BTC/USD',
    decimals: 6,
    minOrderSize: 0.001,
    maxOrderSize: 100,
  },
  ETHUSD: {
    symbol: 'ETHUSD',
    baseAsset: 'ETH',
    quoteAsset: 'USD',
    displayName: 'ETH/USD',
    decimals: 6,
    minOrderSize: 0.01,
    maxOrderSize: 1000,
  },
} as const;

export type MarketSymbol = keyof typeof MARKETS;

// Trading configuration
export const TRADING = {
  MAX_LEVERAGE: 10,
  MIN_LEVERAGE: 1,
  DEFAULT_LEVERAGE: 2,
  MAX_SLIPPAGE: 5, // 5%
  DEFAULT_SLIPPAGE: 1, // 1%
  ORDER_TIMEOUT: 30000, // 30 seconds
} as const;

// UI configuration
export const UI = {
  POLLING_INTERVALS: {
    PRICES: 5000, // 5 seconds
    POSITIONS: 10000, // 10 seconds
    FUNDING: 30000, // 30 seconds
    BALANCE: 15000, // 15 seconds
  },
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
} as const;

// Formatting configuration
export const FORMAT = {
  PRICE_DECIMALS: 6,
  PERCENT_DECIMALS: 2,
  USD_DECIMALS: 2,
  TOKEN_DECIMALS: 6,
} as const;

// Error messages
export const ERRORS = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  WALLET_NOT_FOUND: 'Freighter wallet not found. Please install it from freighter.app',
  NETWORK_MISMATCH: 'Please switch to Stellar Testnet',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount entered',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  CONTRACT_NOT_INITIALIZED: 'Contract not initialized',
  POSITION_NOT_FOUND: 'Position not found',
  MARKET_PAUSED: 'Market is currently paused',
} as const;

// Success messages
export const SUCCESS = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  DEPOSIT_SUCCESS: 'Deposit completed successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal completed successfully',
  POSITION_OPENED: 'Position opened successfully',
  POSITION_CLOSED: 'Position closed successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted successfully',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_CHART: true,
  ENABLE_HISTORY: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_MOBILE_APP: false,
} as const;

// External links
export const LINKS = {
  FREIGHTER_INSTALL: 'https://freighter.app',
  STELLAR_EXPERT: 'https://stellar.expert',
  DOCUMENTATION: 'https://docs.stellar.org',
  GITHUB: 'https://github.com/your-org/flashperp',
  DISCORD: 'https://discord.gg/your-server',
  TWITTER: 'https://twitter.com/your-handle',
} as const;