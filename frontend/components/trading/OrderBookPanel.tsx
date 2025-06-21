// Order book and recent trades panel

'use client';

import React, { useState } from 'react';

type TabType = 'orderbook' | 'trades';

export default function OrderBookPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('orderbook');

  // Mock order book data
  const orderBookData = {
    bids: [
      { price: 65425.50, size: 0.15, total: 0.15 },
      { price: 65425.00, size: 0.25, total: 0.40 },
      { price: 65424.50, size: 0.35, total: 0.75 },
      { price: 65424.00, size: 0.20, total: 0.95 },
      { price: 65423.50, size: 0.30, total: 1.25 },
    ],
    asks: [
      { price: 65426.00, size: 0.20, total: 0.20 },
      { price: 65426.50, size: 0.30, total: 0.50 },
      { price: 65427.00, size: 0.25, total: 0.75 },
      { price: 65427.50, size: 0.15, total: 0.90 },
      { price: 65428.00, size: 0.35, total: 1.25 },
    ],
    spread: 0.50,
  };

  // Mock recent trades
  const recentTrades = [
    { price: 65425.50, size: 0.15, side: 'buy', time: '14:23:45' },
    { price: 65425.00, size: 0.25, side: 'sell', time: '14:23:44' },
    { price: 65426.00, size: 0.10, side: 'buy', time: '14:23:43' },
    { price: 65424.50, size: 0.30, side: 'sell', time: '14:23:42' },
    { price: 65425.50, size: 0.20, side: 'buy', time: '14:23:41' },
  ];

  return (
    <div className="bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`flex-1 px-4 py-2 text-xs font-medium ${
              activeTab === 'orderbook'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex-1 px-4 py-2 text-xs font-medium ${
              activeTab === 'trades'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Recent Trades
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'orderbook' ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-800">
              <div className="text-right">Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Total</div>
            </div>

            {/* Asks */}
            <div className="flex-1 flex flex-col-reverse">
              {orderBookData.asks.map((ask, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-3 py-1 text-xs hover:bg-gray-900/50">
                  <div className="text-right text-red-400">${ask.price.toFixed(2)}</div>
                  <div className="text-right text-white">{ask.size}</div>
                  <div className="text-right text-gray-300">{ask.total}</div>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="px-3 py-2 text-center border-y border-gray-800">
              <div className="text-xs text-gray-400">
                Spread: <span className="text-white">${orderBookData.spread.toFixed(2)}</span>
              </div>
            </div>

            {/* Bids */}
            <div className="flex-1">
              {orderBookData.bids.map((bid, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-3 py-1 text-xs hover:bg-gray-900/50">
                  <div className="text-right text-green-400">${bid.price.toFixed(2)}</div>
                  <div className="text-right text-white">{bid.size}</div>
                  <div className="text-right text-gray-300">{bid.total}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-800">
              <div className="text-right">Price</div>
              <div className="text-right">Size</div>
              <div>Side</div>
              <div className="text-right">Time</div>
            </div>

            {/* Trades */}
            <div className="space-y-0">
              {recentTrades.map((trade, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 px-3 py-1 text-xs hover:bg-gray-900/50">
                  <div className={`text-right ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    ${trade.price.toFixed(2)}
                  </div>
                  <div className="text-right text-white">{trade.size}</div>
                  <div className={trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}>
                    {trade.side.toUpperCase()}
                  </div>
                  <div className="text-right text-gray-300">{trade.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}