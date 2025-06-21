// Collateral deposit/withdraw side drawer

'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useWallet } from '@/lib/hooks/useWallet';

interface CollateralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CollateralModal({ isOpen, onClose }: CollateralModalProps) {
  const { state } = useWallet();
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');

  // Mock balance - replace with real data
  useEffect(() => {
    if (state.isConnected) {
      setBalance('1,234.56');
    }
  }, [state.isConnected]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!amount || isLoading) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement actual deposit/withdraw logic
      console.log(`${tab} ${amount} USC`);
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setAmount('');
      onClose();
    } catch (error) {
      console.error(`${tab} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Side drawer */}
      <div className="relative w-[400px] h-full bg-gray-900 border-l border-gray-700 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Collateral Operations</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setTab('deposit')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                tab === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setTab('withdraw')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                tab === 'withdraw'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Balance info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Current Collateral</span>
              <span className="text-lg font-semibold text-white">${balance}</span>
            </div>
            <div className="text-xs text-gray-500">USC (USD Coin)</div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Amount to {tab}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                USC
              </span>
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['25%', '50%', '75%', 'Max'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  if (preset === 'Max' && tab === 'withdraw') {
                    setAmount(balance.replace(',', ''));
                  } else if (preset !== 'Max') {
                    const percent = parseInt(preset) / 100;
                    const bal = parseFloat(balance.replace(',', ''));
                    setAmount((bal * percent).toFixed(2));
                  }
                }}
                className="py-1 px-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                disabled={tab === 'deposit' || !balance || balance === '0.00'}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Warning for withdraw */}
          {tab === 'withdraw' && amount && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                Withdrawing collateral will reduce your buying power and may affect open positions.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={tab === 'deposit' ? 'success' : 'danger'}
              fullWidth
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              {tab === 'deposit' ? 'Deposit' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}