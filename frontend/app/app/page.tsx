// Main trading interface page

'use client';

import React, { useState } from 'react';
import AppHeader from './components/Header';
import { useWallet } from '@/lib/hooks/useWallet';

export default function TradingApp() {
  const { state } = useWallet();
  const [selectedMarket, setSelectedMarket] = useState('BTCUSD');

  // Show connection prompt if wallet not connected
  if (!state.isConnected) {
    return (
      <div className="h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">
              Connect your Freighter wallet to start trading perpetual contracts on Stellar.
            </p>
            {state.error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm">{state.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <AppHeader />
      
      {/* Main trading interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Market selector */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Markets
            </h3>
            <div className="space-y-2">
              {['BTCUSD', 'ETHUSD', 'XLMUSD'].map((market) => (
                <button
                  key={market}
                  onClick={() => setSelectedMarket(market)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedMarket === market
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{market}</div>
                    <div className="text-xs opacity-75">
                      {market === 'BTCUSD' ? '$65,432' : 
                       market === 'ETHUSD' ? '$3,456' : 
                       '$0.1234'}
                    </div>
                  </div>
                  <div className={`text-xs ${
                    market === 'BTCUSD' ? 'text-green-400' : 
                    market === 'ETHUSD' ? 'text-red-400' : 
                    'text-green-400'
                  }`}>
                    {market === 'BTCUSD' ? '+2.45%' : 
                     market === 'ETHUSD' ? '-1.23%' : 
                     '+5.67%'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar - Selected market info */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h2 className="text-xl font-bold text-white">{selectedMarket}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-400">Mark Price: </span>
                    <span className="text-white font-mono">
                      {selectedMarket === 'BTCUSD' ? '$65,432.10' : 
                       selectedMarket === 'ETHUSD' ? '$3,456.78' : 
                       '$0.1234'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">24h: </span>
                    <span className={`font-mono ${
                      selectedMarket === 'ETHUSD' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {selectedMarket === 'BTCUSD' ? '+2.45%' : 
                       selectedMarket === 'ETHUSD' ? '-1.23%' : 
                       '+5.67%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Funding: </span>
                    <span className="text-blue-400 font-mono">0.0125%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading interface grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
            {/* Order panel */}
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
              
              {/* Order form placeholder */}
              <div className="space-y-4">
                {/* Order type tabs */}
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button className="flex-1 py-2 px-4 text-sm font-medium bg-blue-600 text-white rounded-md">
                    Market
                  </button>
                  <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-300 hover:text-white">
                    Limit
                  </button>
                </div>

                {/* Side selector */}
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button className="flex-1 py-2 px-4 text-sm font-medium bg-green-600 text-white rounded-md">
                    Long
                  </button>
                  <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-300 hover:text-white">
                    Short
                  </button>
                </div>

                {/* Size input */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Size</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Leverage slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Leverage: 2x</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="2"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1x</span>
                    <span>5x</span>
                    <span>10x</span>
                  </div>
                </div>

                {/* Submit button */}
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Open Long Position
                </button>
              </div>
            </div>

            {/* Chart area */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Price Chart Coming Soon</p>
                  <p className="text-sm mt-2">TradingView integration planned</p>
                </div>
              </div>
            </div>

            {/* Portfolio panel */}
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Portfolio</h3>
              
              <div className="space-y-4">
                {/* Balance info */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Total Collateral</span>
                    <span className="text-white font-mono">$10,000.00</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Free Collateral</span>
                    <span className="text-green-400 font-mono">$8,500.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Used Margin</span>
                    <span className="text-blue-400 font-mono">$1,500.00</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Deposit
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Withdraw
                  </button>
                </div>

                {/* Positions summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Open Positions</h4>
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No open positions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}