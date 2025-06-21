// Trading panel for order entry and position management

'use client';

import React, { useState } from 'react';

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

export default function TradingPanel() {
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(10);

  // Mock position data
  const currentPosition = {
    symbol: 'BTCUSD',
    side: 'long',
    size: 0.5,
    entryPrice: 65200.00,
    markPrice: 65432.10,
    pnl: 116.05,
    pnlPercent: 2.31,
    margin: 3260.00,
  };

  const handleSubmitOrder = () => {
    console.log('Submitting order:', { orderSide, orderType, size, price, leverage });
  };

  return (
    <div className="bg-gray-950 flex flex-col h-full">
      {/* Order entry */}
      <div className="border-b border-gray-800 p-4">
        <h3 className="text-white font-semibold text-sm mb-4">Place Order</h3>
        
        {/* Buy/Sell tabs */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-4">
          <button
            onClick={() => setOrderSide('buy')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              orderSide === 'buy'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderSide('sell')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              orderSide === 'sell'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order type */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-2">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded transition-colors ${
              orderType === 'market'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            disabled
            className={`flex-1 py-2 px-3 text-xs font-medium rounded transition-colors cursor-not-allowed ${
              orderType === 'limit'
                ? 'bg-gray-800 text-gray-500'
                : 'text-gray-500'
            }`}
            title="Limit orders coming in v2"
          >
            Limit
          </button>
        </div>
        
        {/* Coming in v2 message */}
        <div className="text-xs text-gray-500 italic mb-4 text-center">
          Limit orders coming in v2
        </div>

        {/* Price input (only for limit orders) */}
        {orderType === 'limit' && (
          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-2">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Size input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-2">Size</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Leverage slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-400 text-xs">Leverage</label>
            <span className="text-white text-xs">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmitOrder}
          className={`w-full py-3 rounded font-medium text-sm transition-colors ${
            orderSide === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {orderSide === 'buy' ? 'Buy' : 'Sell'} / {orderType === 'market' ? 'Market' : 'Limit'}
        </button>
      </div>

      {/* Current position */}
      <div className="p-4">
        <h4 className="text-white font-semibold text-sm mb-3">Position</h4>
        
        {currentPosition ? (
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-xs">{currentPosition.symbol}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                currentPosition.side === 'long' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
                {currentPosition.side.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-400">Size</div>
                <div className="text-white">{currentPosition.size}</div>
              </div>
              <div>
                <div className="text-gray-400">Entry</div>
                <div className="text-white">${currentPosition.entryPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400">Mark</div>
                <div className="text-white">${currentPosition.markPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400">PnL</div>
                <div className={currentPosition.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${currentPosition.pnl.toFixed(2)} ({currentPosition.pnlPercent >= 0 ? '+' : ''}{currentPosition.pnlPercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            <button className="w-full mt-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors">
              Close Position
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            No open position
          </div>
        )}
      </div>
    </div>
  );
}