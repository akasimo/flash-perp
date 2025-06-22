// Bottom panel for positions and orders

'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { usePositions } from '@/lib/hooks/usePositions';
import { useWallet } from '@/lib/hooks/useWallet';
import { formatPrice } from '@/lib/stellar/soroban-client';
import { createClosePositionTransaction } from '@/lib/stellar/trading-operations';

type TabType = 'positions' | 'orders' | 'history';

export default function BottomPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [closingPosition, setClosingPosition] = useState<string | null>(null);
  const { state, signTransaction } = useWallet();
  
  // Get real positions from contracts
  const positions = usePositions(state.isConnected ? state.address : null);
  
  const handleClosePosition = async (symbol: string) => {
    if (!state.isConnected || !state.address || closingPosition) {
      return;
    }
    
    setClosingPosition(symbol);
    
    try {
      // Create close position transaction
      const txXdr = await createClosePositionTransaction(
        state.address,
        symbol
        // size parameter omitted to close entire position
      );
      
      // Sign and submit transaction
      const signedTx = await signTransaction(txXdr);
      
      console.log('Position closed successfully:', signedTx);
      
    } catch (error: any) {
      console.error('Error closing position:', error);
      alert(`Failed to close position: ${error.message || 'Unknown error'}`);
    } finally {
      setClosingPosition(null);
    }
  };

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
                    <td className="px-4 py-3 text-right text-white">{position.size.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      ${formatPrice(position.entryPrice, position.symbol)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      ${formatPrice(position.markPrice, position.symbol)}
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
                      ${position.margin.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-xs font-medium rounded transition-colors disabled:cursor-not-allowed"
                        onClick={() => handleClosePosition(position.symbol)}
                        disabled={closingPosition === position.symbol}
                      >
                        {closingPosition === position.symbol ? 'Closing...' : 'Close'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {state.isConnected ? 'No open positions' : 'Connect wallet to view positions'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            {state.isConnected ? 'No open orders' : 'Connect wallet to view orders'}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            {state.isConnected ? 'No trade history' : 'Connect wallet to view history'}
          </div>
        )}
      </div>
    </Card>
  );
}