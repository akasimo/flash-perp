// Market selector dropdown component

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface Market {
  symbol: string;
  displayName: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface MarketSelectorProps {
  selectedMarket: string;
  onMarketChange: (symbol: string) => void;
}

// Mock market data - will be replaced with real data
const MARKETS: Market[] = [
  {
    symbol: 'BTCUSD',
    displayName: 'Bitcoin',
    price: 65432.10,
    change24h: 2.45,
    volume24h: 1250000000,
  },
  {
    symbol: 'ETHUSD',
    displayName: 'Ethereum',
    price: 3456.78,
    change24h: -1.23,
    volume24h: 890000000,
  },
  {
    symbol: 'XLMUSD',
    displayName: 'Stellar Lumens',
    price: 0.1234,
    change24h: 5.67,
    volume24h: 45000000,
  },
];

export default function MarketSelector({ selectedMarket, onMarketChange }: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected market data
  const selectedMarketData = MARKETS.find(m => m.symbol === selectedMarket) || MARKETS[0];

  // Filter markets based on search
  const filteredMarkets = searchQuery === ''
    ? MARKETS
    : MARKETS.filter((market) =>
        market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Format functions
  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'XLMUSD') {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    }
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(0)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleMarketSelect = (symbol: string) => {
    console.log('Market selected:', symbol);
    onMarketChange(symbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left bg-gray-900 border border-gray-700 rounded hover:border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div>
            <div className="text-white font-semibold text-sm">{selectedMarketData.symbol}</div>
            <div className="text-gray-400 text-xs">{formatPrice(selectedMarketData.price, selectedMarketData.symbol)}</div>
          </div>
          <div className={`text-xs font-medium ${
            selectedMarketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {selectedMarketData.change24h >= 0 ? '+' : ''}{selectedMarketData.change24h.toFixed(2)}%
          </div>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-gray-900 border border-gray-700 rounded shadow-lg">
          {/* Search input */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Markets list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredMarkets.length === 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm">No markets found.</div>
            ) : (
              filteredMarkets.map((market) => (
                <button
                  key={market.symbol}
                  onClick={() => handleMarketSelect(market.symbol)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                    market.symbol === selectedMarket ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-semibold text-sm ${
                        market.symbol === selectedMarket ? 'text-blue-400' : 'text-white'
                      }`}>
                        {market.symbol}
                      </div>
                      <div className="text-gray-400 text-xs">{market.displayName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{formatPrice(market.price, market.symbol)}</div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                        </span>
                        <span className="text-gray-400">{formatVolume(market.volume24h)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}