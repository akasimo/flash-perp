// React hook for wallet state management

'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { freighterWallet } from '@/lib/wallet/freighter';
import type { WalletState, WalletContextType } from '@/types/wallet';
import { ERRORS, SUCCESS } from '@/lib/utils/constants';

// Create wallet context
const WalletContext = createContext<WalletContextType | null>(null);

// Initial wallet state
const initialState: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  network: 'TESTNET',
  error: null,
};

// Wallet provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState);

  // Update wallet state
  const updateState = useCallback((updates: Partial<WalletState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (state.isConnecting) return;

    updateState({ isConnecting: true, error: null });

    try {
      // Attempt to connect (this now includes async installation check)
      const address = await freighterWallet.connect();
      
      if (address) {
        // Verify network
        const network = await freighterWallet.getNetwork();
        
        updateState({
          address,
          isConnected: true,
          isConnecting: false,
          network,
          error: null,
        });

        console.log(SUCCESS.WALLET_CONNECTED);
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateState({
        isConnecting: false,
        error: errorMessage,
      });
      console.error('Wallet connection error:', error);
    }
  }, [state.isConnecting, updateState]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    freighterWallet.disconnect();
    updateState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, [updateState]);

  // Sign transaction
  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (!state.isConnected || !state.address) {
      throw new Error(ERRORS.WALLET_NOT_CONNECTED);
    }

    try {
      return await freighterWallet.signTransaction(xdr);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERRORS.TRANSACTION_FAILED;
      throw new Error(errorMessage);
    }
  }, [state.isConnected, state.address]);

  // Switch network
  const switchNetwork = useCallback(async (network: string) => {
    try {
      await freighterWallet.switchNetwork(network);
      updateState({ network });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      updateState({ error: errorMessage });
      throw error;
    }
  }, [updateState]);

  // Setup event listeners
  useEffect(() => {
    // Listen for account changes
    freighterWallet.onAccountChange((address) => {
      if (address) {
        updateState({ address, isConnected: true });
      } else {
        updateState({ address: null, isConnected: false });
      }
    });

    // Listen for network changes
    freighterWallet.onNetworkChange((network) => {
      updateState({ network });
    });

    // Check if already connected on mount
    if (freighterWallet.isConnected()) {
      const address = freighterWallet.getAddress();
      if (address) {
        updateState({ address, isConnected: true });
        
        // Also get current network
        freighterWallet.getNetwork().then((network) => {
          updateState({ network });
        }).catch((error) => {
          console.error('Error getting network on mount:', error);
        });
      }
    }
  }, [updateState]);

  const contextValue: WalletContextType = {
    state,
    connect,
    disconnect,
    signTransaction,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}

// Additional utility hooks

// Hook to check if wallet is ready for transactions
export function useWalletReady(): boolean {
  const { state } = useWallet();
  return state.isConnected && !state.isConnecting && !state.error && state.address !== null;
}

// Hook to get wallet address (throws if not connected)
export function useWalletAddress(): string {
  const { state } = useWallet();
  
  if (!state.address) {
    throw new Error(ERRORS.WALLET_NOT_CONNECTED);
  }
  
  return state.address;
}

// Hook to check network status
export function useNetworkStatus() {
  const { state } = useWallet();
  
  const isCorrectNetwork = state.network === 'TESTNET';
  const needsNetworkSwitch = state.isConnected && !isCorrectNetwork;
  
  return {
    currentNetwork: state.network,
    isCorrectNetwork,
    needsNetworkSwitch,
  };
}