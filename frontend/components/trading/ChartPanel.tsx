// Chart panel with TradingView integration

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import SymbolDropdown from '@/components/trading/SymbolDropdown';
import { useMarketData } from '@/lib/hooks/useMarketData';
import { formatPrice } from '@/lib/stellar/soroban-client';

// Dynamically import TradingView chart to avoid SSR issues
const TradingViewChart = dynamic(
  () => import('./TradingViewChart'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

interface ChartPanelProps {
  selectedMarket: string;
  onMarketChange: (symbol: string) => void;
}

function ChartSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">Loading Chart...</p>
      </div>
    </div>
  );
}

export default function ChartPanel({ selectedMarket, onMarketChange }: ChartPanelProps) {
  // Get live market data
  const { markPrice, indexPrice, funding, isLoading } = useMarketData(selectedMarket);

  return (
    <Card className="flex flex-col h-full" noPadding>
      {/* Chart header */}
      <div className="border-b border-gray-800 px-4 py-3 flex-shrink-0 bg-gray-950/50">
        <div className="flex items-center justify-between">
          <div>
            <SymbolDropdown selected={selectedMarket} onChange={onMarketChange} />
            <div className="flex items-center space-x-6 mt-1">
              {/* Mark Price */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Mark</span>
                <span className="text-white font-medium">
                  {isLoading ? '-.--' : `$${formatPrice(markPrice, selectedMarket)}`}
                </span>
              </div>
              
              {/* Index Price */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Index</span>
                <span className="text-white">
                  {isLoading ? '-.--' : `$${formatPrice(indexPrice, selectedMarket)}`}
                </span>
              </div>
              
              {/* Funding Rate */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Funding</span>
                <span className={`text-sm font-medium ${funding.rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {isLoading ? '-.--' : (
                    `${funding.rate >= 0 ? '+' : ''}${(funding.rate * 100).toFixed(3)}%`
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Live Data • TradingView
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<ChartSkeleton />}>
          <TradingViewChart symbol={selectedMarket} />
        </Suspense>
      </div>
    </Card>
  );
}