// Bottom panel for positions and orders

'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';

type TabType = 'positions' | 'orders' | 'history';

interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
}

export default function BottomPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('positions');

  // Mock position data
  const positions: Position[] = [
    {
      symbol: 'BTCUSD',
      side: 'long',
      size: 0.5,
      entryPrice: 65200.00,
      markPrice: 65432.10,
      pnl: 116.05,
      pnlPercent: 2.31,
      margin: 3260.00,
    },
  ];

  return (
    <Card className="h-full flex flex-col" noPadding>
      {/* Tab Header */}
      <div className="border-b border-gray-800 px-4 py-2 flex items-center space-x-6">
        <button
          onClick={() => setActiveTab('positions')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'positions'
              ? 'text-white border-blue-500'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Positions ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'text-white border-blue-500'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Open Orders (0)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'text-white border-blue-500'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Trade History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-auto">
        {activeTab === 'positions' && (
          <table className="w-full text-sm">
            <thead className="bg-gray-950/50">
              <tr className="text-gray-400 text-xs">
                <th className="text-left px-4 py-3 font-medium">Symbol</th>
                <th className="text-left px-4 py-3 font-medium">Side</th>
                <th className="text-right px-4 py-3 font-medium">Size</th>
                <th className="text-right px-4 py-3 font-medium">Entry Price</th>
                <th className="text-right px-4 py-3 font-medium">Mark Price</th>
                <th className="text-right px-4 py-3 font-medium">PnL</th>
                <th className="text-right px-4 py-3 font-medium">Margin</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.length > 0 ? (
                positions.map((position, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-950/30">
                    <td className="px-4 py-3 text-white font-medium">{position.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        position.side === 'long' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">{position.size}</td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      ${position.entryPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      ${position.markPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        <div className="font-medium">
                          ${position.pnl.toFixed(2)}
                        </div>
                        <div className="text-xs">
                          {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      ${position.margin.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors">
                        Close
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No open positions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            No open orders
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            No trade history
          </div>
        )}
      </div>
    </Card>
  );
}