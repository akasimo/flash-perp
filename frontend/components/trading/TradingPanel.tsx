// Trading panel for order entry and position management

'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { useWallet } from '@/lib/hooks/useWallet';
import { useCollateral } from '@/lib/hooks/useCollateral';
import { useMarkPrice } from '@/lib/hooks/useMarketData';
import { createOpenPositionTransaction, validateTradeParams, calculateRequiredMargin } from '@/lib/stellar/trading-operations';
import Button from '@/components/ui/Button';

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

interface TradingPanelProps {
  selectedMarket: string;
}

export default function TradingPanel({ selectedMarket }: TradingPanelProps) {
  const { state, signTransaction } = useWallet();
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get real data
  const { exchangeBalance } = useCollateral(state.isConnected ? state.address : null);
  const markPrice = useMarkPrice(selectedMarket);
  
  // Calculate required margin
  const sizeNum = parseFloat(size) || 0;
  const requiredMargin = sizeNum > 0 ? calculateRequiredMargin(sizeNum, markPrice, leverage) : 0;
  const canAfford = requiredMargin <= exchangeBalance;

  const handleSubmitOrder = async () => {
    if (!state.isConnected || !state.address || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const sizeNum = parseFloat(size);
      if (!sizeNum || sizeNum <= 0) {
        throw new Error('Size must be greater than 0');
      }
      
      // Convert side to signed size
      const signedSize = orderSide === 'buy' ? sizeNum : -sizeNum;
      
      // Validate trade parameters
      const validation = validateTradeParams({
        trader: state.address,
        symbol: selectedMarket,
        size: signedSize,
        margin: requiredMargin,
      });
      
      if (validation) {
        throw new Error(validation);
      }
      
      // Check if user has enough collateral
      if (!canAfford) {
        throw new Error(`Insufficient collateral. Required: $${requiredMargin.toFixed(2)}, Available: $${exchangeBalance.toFixed(2)}`);
      }
      
      // Create transaction
      const txXdr = await createOpenPositionTransaction({
        trader: state.address,
        symbol: selectedMarket,
        size: signedSize,
        margin: requiredMargin,
      });
      
      // Sign and submit transaction
      const signedTx = await signTransaction(txXdr);
      
      console.log('Order submitted:', signedTx);
      
      // Reset form on success
      setSize('');
      setPrice('');
      
    } catch (error: any) {
      console.error('Order submission failed:', error);
      setError(error.message || 'Failed to submit order');
    } finally {
      setIsLoading(false);
    }
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
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              {selectedMarket.replace('USD', '')}
            </span>
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

        {/* Order summary */}
        {sizeNum > 0 && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Required Margin</span>
              <span className="text-white">${requiredMargin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Available Balance</span>
              <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
                ${exchangeBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Position Value</span>
              <span className="text-white">${(sizeNum * markPrice).toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
        
        {/* Wallet connection prompt */}
        {!state.isConnected && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <p className="text-xs text-blue-400">Connect your wallet to place orders</p>
          </div>
        )}
        
        {/* Submit button */}
        <Button
          onClick={handleSubmitOrder}
          disabled={!state.isConnected || !sizeNum || !canAfford || isLoading}
          loading={isLoading}
          variant={orderSide === 'buy' ? 'success' : 'danger'}
          fullWidth
          className="py-4 text-base font-semibold"
        >
          {!state.isConnected 
            ? 'Connect Wallet'
            : !sizeNum 
              ? 'Enter Size'
              : !canAfford
                ? 'Insufficient Balance'
                : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${orderType === 'market' ? 'Market' : 'Limit'}`
          }
        </Button>
      </Card>
    </div>
  );
}