'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Market {
  symbol: string;
  name: string;
  price: string;
  change24h: number;
}

const markets: Market[] = [
  { symbol: 'XLMUSD', name: 'XLM / USD', price: '0.10', change24h: 2.5 },
  { symbol: 'BTCUSD', name: 'BTC / USD', price: '100,000', change24h: -1.2 },
  { symbol: 'ETHUSD', name: 'ETH / USD', price: '4,000', change24h: 3.8 },
];

interface MarketSelectorProps {
  selectedMarket: string;
  onMarketSelect: (symbol: string) => void;
}

export default function MarketSelector({ selectedMarket, onMarketSelect }: MarketSelectorProps) {
  return (
    <div className="bg-perp-darker rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Markets</h3>
      <div className="space-y-2">
        {markets.map((market) => (
          <button
            key={market.symbol}
            onClick={() => onMarketSelect(market.symbol)}
            className={`w-full p-3 rounded-lg transition ${
              selectedMarket === market.symbol
                ? 'bg-perp-primary/20 border border-perp-primary'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-medium">{market.name}</div>
                <div className="text-sm text-gray-400">{market.symbol}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">${market.price}</div>
                <div className={`flex items-center text-sm ${
                  market.change24h >= 0 ? 'text-perp-success' : 'text-perp-danger'
                }`}>
                  {market.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="ml-1">{Math.abs(market.change24h)}%</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}