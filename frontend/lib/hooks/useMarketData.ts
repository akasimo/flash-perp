// Market data hooks for real-time price and funding updates

import { useState, useEffect } from 'react';
import { FlashPerpClient } from '@/lib/stellar/client';

const POLLING_INTERVALS = {
  PRICES: 2000,    // 2 seconds
  FUNDING: 30000,  // 30 seconds
};

export interface FundingData {
  rate: number;          // 0.0001 → 0.01%
  nextEpochTs?: number;  // optional
}

export function useMarkPrice(symbol: string): number {
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
    // Mock data for now - replace with real contract calls
    const mockPrices: Record<string, number> = {
      'BTCUSD': 65432.10,
      'ETHUSD': 3456.78,
      'XLMUSD': 0.1234,
    };
    
    setPrice(mockPrices[symbol] || 0);
    
    const interval = setInterval(() => {
      // Add small random variation to simulate live data
      const basePrice = mockPrices[symbol] || 0;
      const variation = (Math.random() - 0.5) * basePrice * 0.0002; // 0.02% variation
      setPrice(basePrice + variation);
    }, POLLING_INTERVALS.PRICES);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  return price;
}

export function useIndexPrice(symbol: string): number {
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
    // Mock data - should be slightly different from mark price
    const mockPrices: Record<string, number> = {
      'BTCUSD': 65420.00,
      'ETHUSD': 3455.00,
      'XLMUSD': 0.1235,
    };
    
    setPrice(mockPrices[symbol] || 0);
    
    const interval = setInterval(() => {
      const basePrice = mockPrices[symbol] || 0;
      const variation = (Math.random() - 0.5) * basePrice * 0.0001;
      setPrice(basePrice + variation);
    }, POLLING_INTERVALS.PRICES);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  return price;
}

export function useFundingRate(symbol: string): FundingData {
  const [funding, setFunding] = useState<FundingData>({ rate: 0 });
  
  useEffect(() => {
    // Mock funding rates
    const mockRates: Record<string, number> = {
      'BTCUSD': 0.0001,   // 0.01%
      'ETHUSD': -0.0002,  // -0.02%
      'XLMUSD': 0.0003,   // 0.03%
    };
    
    setFunding({ 
      rate: mockRates[symbol] || 0,
      nextEpochTs: Date.now() + 8 * 60 * 60 * 1000 // 8 hours from now
    });
    
    const interval = setInterval(() => {
      // Funding rate changes less frequently
      const baseRate = mockRates[symbol] || 0;
      const variation = (Math.random() - 0.5) * 0.00001;
      setFunding(prev => ({ 
        ...prev, 
        rate: baseRate + variation 
      }));
    }, POLLING_INTERVALS.FUNDING);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  return funding;
}