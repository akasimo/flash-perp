// Position data hooks for trading interface

import { useState, useEffect, useCallback } from 'react';
import { callView, formatTokenAmount } from '@/lib/stellar/soroban-client';
import { CONTRACTS, POLLING_INTERVALS, SUPPORTED_MARKETS } from '@/lib/constants/contracts';
import { handleContractError } from '@/lib/stellar/error-handler';
import { Position, RawPosition } from '@/lib/stellar/types';
import { useMarkPrice } from './useMarketData';

/**
 * Hook to get a single position for a specific market
 */
export function usePosition(address: string | null, symbol: string): Position | null {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const markPrice = useMarkPrice(symbol);
  
  const fetchPosition = useCallback(async () => {
    if (!address || !symbol || CONTRACTS.PERP.includes('PLACEHOLDER')) {
      setPosition(null);
      return;
    }
    
    try {
      // Call flashperp.get_position(address, symbol)
      const rawPosition = await callView<RawPosition>(
        CONTRACTS.PERP,
        'get_position',
        address,
        symbol.replace('USD', '')
      );
      
      if (!rawPosition || rawPosition.size === 0n) {
        setPosition(null);
        return;
      }
      
      // Convert raw position to UI format
      const size = formatTokenAmount(rawPosition.size);
      const entryPrice = formatTokenAmount(rawPosition.entry_price);
      const margin = formatTokenAmount(rawPosition.margin);
      
      // Calculate PnL
      const priceDiff = markPrice - entryPrice;
      const pnl = size * priceDiff;
      const pnlPercent = entryPrice > 0 ? (priceDiff / entryPrice) * 100 : 0;
      
      const formattedPosition: Position = {
        symbol: symbol as any,
        side: size > 0 ? 'long' : 'short',
        size: Math.abs(size),
        entryPrice,
        markPrice,
        pnl,
        pnlPercent,
        margin,
      };
      
      setPosition(formattedPosition);
      setError(null);
    } catch (err) {
      console.error(`Error fetching position for ${symbol}:`, err);
      setError(handleContractError(err));
      setPosition(null);
    }
  }, [address, symbol, markPrice]);
  
  useEffect(() => {
    fetchPosition();
    
    const interval = setInterval(fetchPosition, POLLING_INTERVALS.POSITIONS);
    return () => clearInterval(interval);
  }, [fetchPosition]);
  
  return position;
}

/**
 * Hook to get all positions for an address
 */
export function usePositions(address: string | null): Position[] {
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get individual positions for each market
  const btcPosition = usePosition(address, 'BTCUSD');
  const ethPosition = usePosition(address, 'ETHUSD');
  const xlmPosition = usePosition(address, 'XLMUSD');
  
  useEffect(() => {
    const allPositions = [btcPosition, ethPosition, xlmPosition].filter(
      (pos): pos is Position => pos !== null
    );
    
    setPositions(allPositions);
  }, [btcPosition, ethPosition, xlmPosition]);
  
  return positions;
}

/**
 * Hook to get total portfolio value and PnL
 */
export function usePortfolioSummary(address: string | null) {
  const positions = usePositions(address);
  
  const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0);
  const totalPnlPercent = totalMargin > 0 ? (totalPnl / totalMargin) * 100 : 0;
  
  return {
    totalPnl,
    totalMargin,
    totalPnlPercent,
    positionCount: positions.length,
    positions,
  };
}

/**
 * Hook to check if an address has any open positions
 */
export function useHasPositions(address: string | null): boolean {
  const positions = usePositions(address);
  return positions.length > 0;
}