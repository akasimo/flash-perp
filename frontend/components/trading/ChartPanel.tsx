// Chart panel with TradingView integration

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

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

export default function ChartPanel({ selectedMarket }: ChartPanelProps) {
  // Get market display information
  const getMarketInfo = (market: string) => {
    const marketData: Record<string, { price: string; change: string; changeColor: string }> = {
      'BTCUSD': { price: '$65,432.10', change: '+2.45%', changeColor: 'text-green-400' },
      'ETHUSD': { price: '$3,456.78', change: '-1.23%', changeColor: 'text-red-400' },
      'XLMUSD': { price: '$0.1234', change: '+5.67%', changeColor: 'text-green-400' },
    };
    return marketData[market] || marketData['BTCUSD'];
  };

  const marketInfo = getMarketInfo(selectedMarket);

  return (
    <div className="bg-gray-950 flex flex-col h-full border-t border-gray-800">
      {/* Chart header */}
      <div className="border-b border-gray-800 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-white font-semibold text-sm">{selectedMarket}</h2>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-gray-400">Mark:</span>
              <span className="text-white">{marketInfo.price}</span>
              <span className={marketInfo.changeColor}>{marketInfo.change}</span>
            </div>
          </div>
          
          {/* TradingView handles intervals internally */}
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
    </div>
  );
}