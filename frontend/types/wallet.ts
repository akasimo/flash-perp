// Wallet-related type definitions

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  error: string | null;
}

export interface FreighterAPI {
  isConnected(): Promise<boolean>;
  requestAccess(): Promise<{ publicKey: string }>;
  signTransaction(
    xdr: string,
    options?: {
      network?: string;
      accountToSign?: string;
    }
  ): Promise<string>;
  getNetwork(): Promise<string>;
  setNetwork(network: string): Promise<void>;
}

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

// Freighter window extension
declare global {
  interface Window {
    freighter?: FreighterAPI;
  }
}