// Chart panel placeholder - will be replaced with TradingView integration

'use client';

import React from 'react';

interface ChartPanelProps {
  selectedMarket: string;
}

export default function ChartPanel({ selectedMarket }: ChartPanelProps) {
  return (
    <div className="bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      {/* Chart header */}
      <div className="border-b border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-white font-semibold text-sm">{selectedMarket}</h2>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-gray-400">Mark:</span>
              <span className="text-white">$65,432.10</span>
              <span className="text-green-400">+2.45%</span>
            </div>
          </div>
          
          {/* Time intervals */}
          <div className="flex items-center space-x-1">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((interval) => (
              <button
                key={interval}
                className={`px-2 py-1 text-xs rounded ${
                  interval === '5m'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">TradingView Chart</p>
          <p className="text-gray-500 text-xs mt-1">Integration coming soon</p>
        </div>
      </div>
    </div>
  );
}