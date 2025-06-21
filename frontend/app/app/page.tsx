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
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--app-bg-primary)' }}>
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--app-accent-primary)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-text-primary)' }}>Connect Your Wallet</h2>
            <p className="mb-8" style={{ color: 'var(--app-text-muted)' }}>
              Connect your Freighter wallet to start trading perpetual contracts on Stellar.
            </p>
            {state.error && (
              <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-sm" style={{ color: 'var(--app-accent-danger)' }}>{state.error}</p>
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
        <div className="w-64 border-r flex-shrink-0" style={{ backgroundColor: 'var(--app-bg-secondary)', borderColor: 'rgba(33, 150, 243, 0.1)' }}>
          <div className="p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--app-text-muted)' }}>
              Markets
            </h3>
            <div className="space-y-2">
              {['BTCUSD', 'ETHUSD', 'XLMUSD'].map((market) => (
                <button
                  key={market}
                  onClick={() => setSelectedMarket(market)}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: selectedMarket === market ? 'var(--app-accent-primary)' : 'transparent',
                    color: selectedMarket === market ? 'white' : 'var(--app-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMarket !== market) {
                      e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)';
                      e.currentTarget.style.color = 'var(--app-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMarket !== market) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--app-text-secondary)';
                    }
                  }}
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
          <div className="border-b p-4" style={{ backgroundColor: 'var(--app-bg-secondary)', borderColor: 'rgba(33, 150, 243, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{selectedMarket}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--app-text-muted)' }}>Mark Price: </span>
                    <span className="font-mono" style={{ color: 'var(--app-text-primary)' }}>
                      {selectedMarket === 'BTCUSD' ? '$65,432.10' : 
                       selectedMarket === 'ETHUSD' ? '$3,456.78' : 
                       '$0.1234'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--app-text-muted)' }}>24h: </span>
                    <span className="font-mono" style={{
                      color: selectedMarket === 'ETHUSD' ? 'var(--app-accent-danger)' : 'var(--app-accent-success)'
                    }}>
                      {selectedMarket === 'BTCUSD' ? '+2.45%' : 
                       selectedMarket === 'ETHUSD' ? '-1.23%' : 
                       '+5.67%'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--app-text-muted)' }}>Funding: </span>
                    <span className="font-mono" style={{ color: 'var(--app-accent-primary)' }}>0.0125%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading interface grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
            {/* Order panel */}
            <div className="lg:col-span-1 rounded-lg p-4" style={{ backgroundColor: 'var(--app-bg-secondary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--app-text-primary)' }}>Place Order</h3>
              
              {/* Order form placeholder */}
              <div className="space-y-4">
                {/* Order type tabs */}
                <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--app-bg-tertiary)' }}>
                  <button className="flex-1 py-2 px-4 text-sm font-medium text-white rounded-md" style={{ backgroundColor: 'var(--app-accent-primary)' }}>
                    Market
                  </button>
                  <button className="flex-1 py-2 px-4 text-sm font-medium transition-colors" style={{ color: 'var(--app-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-text-secondary)'}>
                    Limit
                  </button>
                </div>

                {/* Side selector */}
                <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--app-bg-tertiary)' }}>
                  <button className="flex-1 py-2 px-4 text-sm font-medium text-white rounded-md" style={{ backgroundColor: 'var(--app-accent-success)' }}>
                    Long
                  </button>
                  <button className="flex-1 py-2 px-4 text-sm font-medium transition-colors" style={{ color: 'var(--app-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-text-secondary)'}>
                    Short
                  </button>
                </div>

                {/* Size input */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>Size</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors placeholder-gray-400"
                    style={{ 
                      backgroundColor: 'var(--app-bg-tertiary)', 
                      border: '1px solid rgba(33, 150, 243, 0.2)', 
                      color: 'var(--app-text-primary)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--app-accent-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(33, 150, 243, 0.2)'}
                  />
                </div>

                {/* Leverage slider */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>Leverage: 2x</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="2"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--app-text-muted)' }}>
                    <span>1x</span>
                    <span>5x</span>
                    <span>10x</span>
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--app-accent-success)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Open Long Position
                </button>
              </div>
            </div>

            {/* Chart area */}
            <div className="lg:col-span-2 rounded-lg p-4" style={{ backgroundColor: 'var(--app-bg-secondary)' }}>
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--app-text-muted)' }}>
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
            <div className="lg:col-span-1 rounded-lg p-4" style={{ backgroundColor: 'var(--app-bg-secondary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--app-text-primary)' }}>Portfolio</h3>
              
              <div className="space-y-4">
                {/* Balance info */}
                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--app-bg-tertiary)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>Total Collateral</span>
                    <span className="font-mono" style={{ color: 'var(--app-text-primary)' }}>$10,000.00</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>Free Collateral</span>
                    <span className="font-mono" style={{ color: 'var(--app-accent-success)' }}>$8,500.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>Used Margin</span>
                    <span className="font-mono" style={{ color: 'var(--app-accent-primary)' }}>$1,500.00</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="space-y-2">
                  <button 
                    className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--app-accent-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Deposit
                  </button>
                  <button 
                    className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--app-bg-tertiary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                  >
                    Withdraw
                  </button>
                </div>

                {/* Positions summary */}
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>Open Positions</h4>
                  <div className="text-center py-4" style={{ color: 'var(--app-text-muted)' }}>
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