// Market data hooks for real-time price and funding updates from Stellar testnet

import { useState, useEffect, useCallback } from 'react';
import { callView, formatTokenAmount, scalePrice, symbolToContractSymbol } from '@/lib/stellar/soroban-client';
import { CONTRACTS, POLLING_INTERVALS, DECIMALS, SCALING_FACTORS } from '@/lib/constants/contracts';
import { handleContractError } from '@/lib/stellar/error-handler';
import { FundingData } from '@/lib/stellar/types';

/**
 * Hook to get mark price from FlashPerp contract
 */
export function useMarkPrice(symbol: string): number {
  const [price, setPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMarkPrice = useCallback(async () => {
    if (!symbol || CONTRACTS.PERP.includes('PLACEHOLDER')) {
      return;
    }
    
    try {
      // Call flashperp.get_mark_price_view(symbol) 
      // Use base asset name (BTC, ETH, XLM) not USD pairs
      const baseSymbol = symbolToContractSymbol(symbol);
      console.log('Fetching mark price for base symbol:', baseSymbol);
      
      const rawPrice = await callView<bigint>(
        CONTRACTS.PERP,
        'get_mark_price_view',
        baseSymbol
      );
      
      // Convert from DEC6 to display number
      const displayPrice = formatTokenAmount(rawPrice, DECIMALS.PRICE_DISPLAY);
      setPrice(displayPrice);
      setError(null);
    } catch (err) {
      console.error(`Error fetching mark price for ${symbol}:`, err);
      setError(handleContractError(err));
    }
  }, [symbol]);
  
  useEffect(() => {
    fetchMarkPrice();
    
    const interval = setInterval(fetchMarkPrice, POLLING_INTERVALS.PRICES);
    return () => clearInterval(interval);
  }, [fetchMarkPrice]);
  
  return price;
}

/**
 * Hook to get index price from Oracle contract
 */
export function useIndexPrice(symbol: string): number {
  const [price, setPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fetchIndexPrice = useCallback(async () => {
    if (!symbol || CONTRACTS.ORACLE.includes('PLACEHOLDER')) {
      return;
    }
    
    try {
      // Build Asset::Other(Symbol) enum as Vec<ScVal> 
      // Use base asset name (BTC, ETH, XLM) not USD pairs
      const baseSymbol = symbolToContractSymbol(symbol);
      console.log('Fetching index price for base symbol:', baseSymbol);
      
      const { xdr } = await import('@stellar/stellar-sdk');
      const assetParam = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Other'),
        xdr.ScVal.scvSymbol(baseSymbol),
      ]);

      const rawPrice = await callView<bigint>(
        CONTRACTS.ORACLE,
        'lastprice',
        assetParam,
      );
      
      // rawPrice is already a bigint – no need to cast again
      const scaledPrice = scalePrice(rawPrice, DECIMALS.ORACLE, DECIMALS.PRICE_DISPLAY);
      const displayPrice = formatTokenAmount(scaledPrice, DECIMALS.PRICE_DISPLAY);
      
      setPrice(displayPrice);
      setError(null);
    } catch (err) {
      console.error(`Error fetching index price for ${symbol}:`, err);
      setError(handleContractError(err));
    }
  }, [symbol]);
  
  useEffect(() => {
    fetchIndexPrice();
    
    const interval = setInterval(fetchIndexPrice, POLLING_INTERVALS.PRICES);
    return () => clearInterval(interval);
  }, [fetchIndexPrice]);
  
  return price;
}

/**
 * Hook to get funding rate from FlashPerp contract
 */
export function useFundingRate(symbol: string): FundingData {
  const [funding, setFunding] = useState<FundingData>({ rate: 0 });
  const [error, setError] = useState<string | null>(null);
  
  const fetchFundingRate = useCallback(async () => {
    if (!symbol || CONTRACTS.PERP.includes('PLACEHOLDER')) {
      return;
    }
    
    try {
      // First poke funding to update it
      const baseSym = symbolToContractSymbol(symbol);
      await callView(
        CONTRACTS.PERP,
        'poke_funding',
        baseSym
      );
      
      // The FlashPerp v1 contract doesn't expose detailed funding info yet.
      // We simply assume `poke_funding` succeeded and show 0% until the
      // method is available.
      setFunding({ rate: 0 });
      setError(null);
    } catch (err) {
      console.error(`Error fetching funding rate for ${symbol}:`, err);
      setError(handleContractError(err));
    }
  }, [symbol]);
  
  useEffect(() => {
    fetchFundingRate();
    
    const interval = setInterval(fetchFundingRate, POLLING_INTERVALS.FUNDING);
    return () => clearInterval(interval);
  }, [fetchFundingRate]);
  
  return funding;
}

/**
 * Combined hook for all market data
 */
export function useMarketData(symbol: string) {
  const markPrice = useMarkPrice(symbol);
  const indexPrice = useIndexPrice(symbol);
  const funding = useFundingRate(symbol);
  
  return {
    markPrice,
    indexPrice,
    funding,
    isLoading: markPrice === 0 && indexPrice === 0,
  };
}