// Collateral balance hooks for wallet and exchange

import { useState, useEffect, useCallback } from 'react';
import { callView, formatTokenAmount } from '@/lib/stellar/soroban-client';
import { CONTRACTS, POLLING_INTERVALS } from '@/lib/constants/contracts';
import { handleContractError } from '@/lib/stellar/error-handler';
import { BalanceData } from '@/lib/stellar/types';

/**
 * Hook to get token balance in wallet
 */
export function useWalletBalance(address: string | null): number {
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fetchWalletBalance = useCallback(async () => {
    if (!address || CONTRACTS.TOKEN.includes('PLACEHOLDER')) {
      setBalance(0);
      return;
    }
    
    try {
      // Call token.balance(address)
      const rawBalance = await callView<bigint>(
        CONTRACTS.TOKEN,
        'balance',
        address
      );
      
      const displayBalance = formatTokenAmount(rawBalance);
      setBalance(displayBalance);
      setError(null);
    } catch (err) {
      console.error(`Error fetching wallet balance for ${address}:`, err);
      setError(handleContractError(err));
      setBalance(0);
    }
  }, [address]);
  
  useEffect(() => {
    fetchWalletBalance();
    
    const interval = setInterval(fetchWalletBalance, POLLING_INTERVALS.BALANCES);
    return () => clearInterval(interval);
  }, [fetchWalletBalance]);
  
  return balance;
}

/**
 * Hook to get free collateral on exchange
 */
export function useExchangeBalance(address: string | null): number {
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fetchExchangeBalance = useCallback(async () => {
    if (!address || CONTRACTS.PERP.includes('PLACEHOLDER')) {
      setBalance(0);
      return;
    }
    
    try {
      // Call flashperp.get_free_collateral(address)
      const rawBalance = await callView<bigint>(
        CONTRACTS.PERP,
        'get_free_collateral',
        address
      );
      
      const displayBalance = formatTokenAmount(rawBalance);
      setBalance(displayBalance);
      setError(null);
    } catch (err) {
      console.error(`Error fetching exchange balance for ${address}:`, err);
      setError(handleContractError(err));
      setBalance(0);
    }
  }, [address]);
  
  useEffect(() => {
    fetchExchangeBalance();
    
    const interval = setInterval(fetchExchangeBalance, POLLING_INTERVALS.BALANCES);
    return () => clearInterval(interval);
  }, [fetchExchangeBalance]);
  
  return balance;
}

/**
 * Hook to get token allowance for the perpetual contract
 */
export function useTokenAllowance(address: string | null): number {
  const [allowance, setAllowance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAllowance = useCallback(async () => {
    if (!address || CONTRACTS.TOKEN.includes('PLACEHOLDER') || CONTRACTS.PERP.includes('PLACEHOLDER')) {
      setAllowance(0);
      return;
    }
    
    try {
      // Call token.allowance(from: address, spender: PERP_CONTRACT)
      const rawAllowance = await callView<bigint>(
        CONTRACTS.TOKEN,
        'allowance',
        address,
        CONTRACTS.PERP
      );
      
      const displayAllowance = formatTokenAmount(rawAllowance);
      setAllowance(displayAllowance);
      setError(null);
    } catch (err) {
      console.error(`Error fetching allowance for ${address}:`, err);
      setError(handleContractError(err));
      setAllowance(0);
    }
  }, [address]);
  
  useEffect(() => {
    fetchAllowance();
    
    const interval = setInterval(fetchAllowance, POLLING_INTERVALS.BALANCES);
    return () => clearInterval(interval);
  }, [fetchAllowance]);
  
  return allowance;
}

/**
 * Combined hook for collateral data
 */
export function useCollateral(address: string | null) {
  const walletBalance = useWalletBalance(address);
  const exchangeBalance = useExchangeBalance(address);
  const allowance = useTokenAllowance(address);
  
  const refetch = useCallback(() => {
    // Force refetch by clearing cache or triggering re-fetch
    // This could be improved with a more sophisticated cache invalidation
    window.location.reload();
  }, []);
  
  return {
    walletBalance,
    exchangeBalance,
    allowance,
    refetch,
  };
}