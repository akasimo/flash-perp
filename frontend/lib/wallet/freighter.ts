// Freighter wallet integration

import { NETWORK, NETWORK_PASSPHRASE } from '@/lib/utils/constants';
import type { FreighterAPI, WalletManager } from '@/types/wallet';

export class FreighterWalletManager implements WalletManager {
  private freighter: FreighterAPI | null = null;
  private currentAddress: string | null = null;
  private accountChangeCallbacks: ((address: string | null) => void)[] = [];
  private networkChangeCallbacks: ((network: string) => void)[] = [];

  constructor() {
    this.initializeFreighter();
    this.setupEventListeners();
  }

  private initializeFreighter(): void {
    if (typeof window !== 'undefined' && window.freighter) {
      this.freighter = window.freighter;
    }
  }

  private async waitForFreighter(timeout = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkFreighter = () => {
        if (typeof window !== 'undefined' && window.freighter) {
          this.freighter = window.freighter;
          resolve(true);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }
        
        setTimeout(checkFreighter, 100);
      };
      
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
    if (!this.freighter || !this.isConnected()) return;

    try {
      const isStillConnected = await this.freighter.isConnected();
      if (!isStillConnected && this.currentAddress) {
        // Account disconnected
        this.currentAddress = null;
        this.accountChangeCallbacks.forEach(callback => callback(null));
      }
    } catch (error) {
      console.error('Error checking account change:', error);
    }
  }

  isFreighterInstalled(): boolean {
    return typeof window !== 'undefined' && 'freighter' in window && !!window.freighter;
  }

  async isFreighterInstalledAsync(): Promise<boolean> {
    if (this.isFreighterInstalled()) {
      return true;
    }
    
    // Wait for Freighter to load (it might be injected asynchronously)
    return await this.waitForFreighter(5000);
  }

  async connect(): Promise<string | null> {
    try {
      // First, wait for Freighter to be available
      const isAvailable = await this.isFreighterInstalledAsync();
      
      if (!isAvailable) {
        throw new Error('Freighter wallet not found. Please install it from freighter.app and refresh the page.');
      }

      if (!this.freighter) {
        this.initializeFreighter();
      }

      // Double-check we have the freighter object
      if (!this.freighter) {
        throw new Error('Freighter wallet is not properly initialized. Please refresh the page and try again.');
      }

      // Request access to the wallet
      const { publicKey } = await this.freighter.requestAccess();
      
      // Verify we're on the correct network
      const network = await this.freighter.getNetwork();
      if (network !== NETWORK.TESTNET) {
        await this.switchNetwork(NETWORK.TESTNET);
      }

      this.currentAddress = publicKey;
      this.accountChangeCallbacks.forEach(callback => callback(publicKey));
      
      return publicKey;
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User declined access')) {
          throw new Error('Connection cancelled. Please try again and approve the connection request.');
        }
        if (error.message.includes('not found') || error.message.includes('install')) {
          throw error; // Re-throw installation errors as-is
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
    if (!this.freighter) {
      throw new Error('Freighter wallet not available');
    }

    if (!this.isConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedXdr = await this.freighter.signTransaction(xdr, {
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
    if (!this.freighter) {
      throw new Error('Freighter wallet not available');
    }

    try {
      return await this.freighter.getNetwork();
    } catch (error) {
      console.error('Error getting network:', error);
      throw new Error('Failed to get network');
    }
  }

  async switchNetwork(network: string): Promise<void> {
    if (!this.freighter) {
      throw new Error('Freighter wallet not available');
    }

    try {
      await this.freighter.setNetwork(network);
      this.networkChangeCallbacks.forEach(callback => callback(network));
    } catch (error) {
      console.error('Error switching network:', error);
      throw new Error('Failed to switch network');
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
      await this.switchNetwork(NETWORK.TESTNET);
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