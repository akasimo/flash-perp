// Main trading interface page

'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import TopBar from '@/components/trading/TopBar';
import MarketSelector from '@/components/trading/MarketSelector';
import OrderBookPanel from '@/components/trading/OrderBookPanel';
import ChartPanel from '@/components/trading/ChartPanel';
import TradingPanel from '@/components/trading/TradingPanel';

export default function TradingApp() {
  const { state, connect } = useWallet();
  const [selectedMarket, setSelectedMarket] = useState('BTCUSD');
  const [showCollateralModal, setShowCollateralModal] = useState(false);

  // Show connection prompt if wallet not connected
  if (!state.isConnected) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
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
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-400">{state.error}</p>
            </div>
          )}
          <button
            onClick={() => connect()}
            disabled={state.isConnecting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {state.isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <TopBar onCollateralClick={() => setShowCollateralModal(true)} />
      
      {/* Market selector bar */}
      <div className="border-b border-gray-800 bg-gray-950 p-3">
        <div className="max-w-xs">
          <MarketSelector
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
          />
        </div>
      </div>
      
      {/* Three-column trading layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left column - Order book */}
        <div className="col-span-3">
          <OrderBookPanel />
        </div>
        
        {/* Center column - Chart */}
        <div className="col-span-6">
          <ChartPanel selectedMarket={selectedMarket} />
        </div>
        
        {/* Right column - Trading panel */}
        <div className="col-span-3">
          <TradingPanel />
        </div>
      </div>
    </div>
  );
}