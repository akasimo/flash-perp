// Trading panel for order entry and position management

'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

export default function TradingPanel() {
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(10);

  const handleSubmitOrder = () => {
    console.log('Submitting order:', { orderSide, orderType, size, price, leverage });
  };

  return (
    <div className="bg-gray-950 flex flex-col h-full space-y-6 p-4">
      {/* Order entry */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
        <h3 className="text-white font-semibold text-base mb-6">Place Order</h3>
        
        {/* Buy/Sell tabs */}
        <div className="flex bg-gray-950 rounded-xl p-1.5 mb-6 shadow-inner">
          <button
            onClick={() => setOrderSide('buy')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
              orderSide === 'buy'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderSide('sell')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
              orderSide === 'sell'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order type */}
        <div className="flex bg-gray-950 rounded-lg p-1 mb-6 shadow-inner">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
              orderType === 'market'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            disabled
            aria-disabled="true"
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 cursor-not-allowed ${
              orderType === 'limit'
                ? 'bg-gray-800 text-gray-600'
                : 'text-gray-600'
            }`}
            title="Limit orders coming in v2"
          >
            Limit
          </button>
        </div>

        {/* Price input (only for limit orders) */}
        {orderType === 'limit' && (
          <div className="mb-6">
            <label className="block text-gray-400 text-xs font-medium mb-2">Price</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-900 transition-all duration-200 hover:border-gray-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">USD</span>
            </div>
          </div>
        )}

        {/* Size input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-xs font-medium mb-2">Size</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={0.01}
              value={size}
              onChange={(e) => setSize(e.target.value)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-900 transition-all duration-200 hover:border-gray-700"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">BTC</span>
          </div>
        </div>

        {/* Leverage slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-gray-400 text-xs font-medium">Leverage</label>
            <span className="text-white text-sm font-semibold bg-gray-800 px-3 py-1 rounded-md">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider hover:bg-gray-700 transition-colors"
            style={{
              background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${(leverage - 1) / 49 * 100}%, rgb(55, 65, 81) ${(leverage - 1) / 49 * 100}%, rgb(55, 65, 81) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmitOrder}
          className={`w-full py-4 rounded-lg font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
            orderSide === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
          }`}
        >
          {orderSide === 'buy' ? 'Buy' : 'Sell'} {orderType === 'market' ? 'Market' : 'Limit'}
        </button>
      </Card>
    </div>
  );
}