'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { OrderForm } from '@/types';

interface TradingPanelProps {
  selectedMarket: string;
  onSubmitOrder: (order: OrderForm) => void;
}

export default function TradingPanel({ selectedMarket, onSubmitOrder }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<'long' | 'short'>('long');
  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!size || parseFloat(size) <= 0) return;

    onSubmitOrder({
      symbol: selectedMarket,
      side: orderType,
      size,
      leverage,
    });
  };

  return (
    <div className="bg-perp-darker rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Place Order</h3>
      
      {/* Order Type Selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setOrderType('long')}
          className={`py-3 rounded-lg font-medium transition ${
            orderType === 'long'
              ? 'bg-perp-success text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowUp size={20} />
            <span>Long</span>
          </div>
        </button>
        <button
          onClick={() => setOrderType('short')}
          className={`py-3 rounded-lg font-medium transition ${
            orderType === 'short'
              ? 'bg-perp-danger text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowDown size={20} />
            <span>Short</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Size Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Size</label>
          <div className="relative">
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-perp-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {selectedMarket.replace('USD', '')}
            </span>
          </div>
        </div>

        {/* Leverage Slider */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Leverage</span>
            <span className="text-white font-medium">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span>
            <span>5x</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin Required</span>
            <span>{size && leverage ? (parseFloat(size) * 100 / leverage).toFixed(2) : '0.00'} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Fee (0.1%)</span>
            <span>{size ? (parseFloat(size) * 0.001).toFixed(4) : '0.00'} USDC</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-medium transition ${
            orderType === 'long'
              ? 'bg-perp-success hover:bg-green-500 text-black'
              : 'bg-perp-danger hover:bg-red-500 text-white'
          }`}
        >
          {orderType === 'long' ? 'Long' : 'Short'} {selectedMarket}
        </button>
      </form>
    </div>
  );
}