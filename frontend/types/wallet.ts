// Wallet-related type definitions

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  error: string | null;
}

// FreighterAPI is now provided by @stellar/freighter-api package
// No need to define it here as we're using the official functions directly

export interface WalletManager {
  // Connection management
  connect(): Promise<string | null>;
  disconnect(): void;
  isConnected(): boolean;
  getAddress(): string | null;
  
  // Transaction signing
  signTransaction(xdr: string): Promise<string>;
  
  // Network management
  getNetwork(): Promise<string>;
  switchNetwork(network: string): Promise<void>;
  
  // Event handling
  onAccountChange(callback: (address: string | null) => void): void;
  onNetworkChange(callback: (network: string) => void): void;
}

export interface WalletContextType {
  state: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  switchNetwork: (network: string) => Promise<void>;
}

// Window extension is now handled by @stellar/freighter-api package