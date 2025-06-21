// Freighter wallet integration

import { 
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  signTransaction,
  getNetwork,
  getNetworkDetails,
  getPublicKey,
} from '@stellar/freighter-api';
import { NETWORK, NETWORK_PASSPHRASE } from '@/lib/utils/constants';
import type { WalletManager } from '@/types/wallet';

export class FreighterWalletManager implements WalletManager {
  private currentAddress: string | null = null;
  private accountChangeCallbacks: ((address: string | null) => void)[] = [];
  private networkChangeCallbacks: ((network: string) => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private async waitForFreighter(timeout = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkFreighter = async () => {
        try {
          // Use the official API to check if Freighter is available
          const connected = await isConnected();
          console.log('Freighter connection check:', connected);
          resolve(true);
          return;
        } catch (error) {
          // Freighter not available yet
          if (Date.now() - startTime > timeout) {
            console.log('Freighter detection timeout after', timeout, 'ms');
            resolve(false);
            return;
          }
          
          setTimeout(checkFreighter, 500); // Check every 500ms
        }
      };
      
      // Start checking immediately
      checkFreighter();
    });
  }

  private setupEventListeners(): void {
    // Note: Freighter doesn't provide native event listeners
    // We'll implement polling for account changes if needed
    if (typeof window !== 'undefined') {
      // Check for account changes every 5 seconds
      setInterval(() => {
        this.checkAccountChange();
      }, 5000);
    }
  }

  private async checkAccountChange(): Promise<void> {
    if (!this.isConnected()) return;

    try {
      const stillConnected = await isConnected();
      if (!stillConnected && this.currentAddress) {
        // Account disconnected
        this.currentAddress = null;
        this.accountChangeCallbacks.forEach(callback => callback(null));
      }
    } catch (error) {
      console.error('Error checking account change:', error);
    }
  }

  isFreighterInstalled(): boolean {
    // We'll use a try-catch approach since the official API handles detection
    try {
      return typeof window !== 'undefined';
    } catch {
      return false;
    }
  }

  async isFreighterInstalledAsync(): Promise<boolean> {
    console.log('Checking for Freighter installation...');
    
    try {
      // Use the official API to check
      await isConnected();
      console.log('Freighter is available');
      return true;
    } catch (error) {
      console.log('Freighter not available immediately, waiting...');
      // Wait for Freighter to load
      const result = await this.waitForFreighter(10000);
      console.log('Freighter async check result:', result);
      return result;
    }
  }

  async connect(): Promise<string | null> {
    try {
      console.log('Starting Freighter connection...');
      
      // First, wait for Freighter to be available
      const isAvailable = await this.isFreighterInstalledAsync();
      
      if (!isAvailable) {
        throw new Error('Freighter wallet not found. Please install it from freighter.app and refresh the page.');
      }

      // Check if already allowed
      const allowed = await isAllowed();
      console.log('Freighter access allowed:', allowed);
      
      if (!allowed) {
        // Request access to the wallet
        console.log('Requesting Freighter access...');
        await requestAccess();
      }

      // Get the public key
      const publicKey = await getPublicKey();
      console.log('Got public key:', publicKey);
      
      // Verify we're on the correct network
      const network = await getNetwork();
      console.log('Current network:', network);
      
      if (network !== NETWORK.TESTNET) {
        console.log('Switching to testnet...');
        await this.switchNetwork(NETWORK.TESTNET);
      }

      this.currentAddress = publicKey;
      this.accountChangeCallbacks.forEach(callback => callback(publicKey));
      
      return publicKey;
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User declined') || error.message.includes('denied')) {
          throw new Error('Connection cancelled. Please try again and approve the connection request.');
        }
        if (error.message.includes('not found') || error.message.includes('install')) {
          throw error; // Re-throw installation errors as-is
        }
        if (error.message.includes('not available')) {
          throw new Error('Freighter wallet not found. Please install it from freighter.app and refresh the page.');
        }
      }
      
      throw new Error('Failed to connect to Freighter wallet. Please ensure Freighter is unlocked and try again.');
    }
  }

  disconnect(): void {
    this.currentAddress = null;
    this.accountChangeCallbacks.forEach(callback => callback(null));
  }

  isConnected(): boolean {
    return this.currentAddress !== null;
  }

  getAddress(): string | null {
    return this.currentAddress;
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedXdr = await signTransaction(xdr, {
        network: NETWORK.TESTNET,
        accountToSign: this.currentAddress!,
      });

      return signedXdr;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  async getNetwork(): Promise<string> {
    try {
      return await getNetwork();
    } catch (error) {
      console.error('Error getting network:', error);
      throw new Error('Failed to get network');
    }
  }

  async switchNetwork(network: string): Promise<void> {
    try {
      // Note: Freighter API doesn't have a direct setNetwork function
      // Users need to manually switch networks in the extension
      console.log('Please switch to', network, 'network in Freighter');
      
      // For now, we'll just update our callbacks
      this.networkChangeCallbacks.forEach(callback => callback(network));
    } catch (error) {
      console.error('Error switching network:', error);
      throw new Error('Please manually switch to testnet in Freighter extension');
    }
  }

  onAccountChange(callback: (address: string | null) => void): void {
    this.accountChangeCallbacks.push(callback);
  }

  onNetworkChange(callback: (network: string) => void): void {
    this.networkChangeCallbacks.push(callback);
  }

  // Utility method to check if user is on correct network
  async isOnCorrectNetwork(): Promise<boolean> {
    try {
      const currentNetwork = await this.getNetwork();
      return currentNetwork === NETWORK.TESTNET;
    } catch {
      return false;
    }
  }

  // Method to prompt user to switch to correct network
  async ensureCorrectNetwork(): Promise<void> {
    const isCorrect = await this.isOnCorrectNetwork();
    if (!isCorrect) {
      throw new Error('Please switch to Stellar Testnet in your Freighter extension');
    }
  }

  // Helper method to validate if an address is valid Stellar address
  static isValidStellarAddress(address: string): boolean {
    // Basic validation - Stellar addresses start with G and are 56 characters
    return /^G[A-Z2-7]{55}$/.test(address);
  }
}

// Singleton instance
export const freighterWallet = new FreighterWalletManager();