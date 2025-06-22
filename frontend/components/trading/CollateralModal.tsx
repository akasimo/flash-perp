// Collateral deposit/withdraw side drawer

'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useWallet } from '@/lib/hooks/useWallet';
import { useCollateral } from '@/lib/hooks/useCollateral';
import { createApproveAndDepositTransaction, createWithdrawTransaction } from '@/lib/stellar/trading-operations';
import { CONTRACTS } from '@/lib/constants/contracts';

interface CollateralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CollateralModal({ isOpen, onClose }: CollateralModalProps) {
  const { state, signTransaction } = useWallet();
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get real collateral data
  const { walletBalance, exchangeBalance, allowance, refetch } = useCollateral(
    state.isConnected ? state.address : null
  );
  
  const displayBalance = tab === 'deposit' ? walletBalance : exchangeBalance;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!amount || isLoading || !state.isConnected || !state.address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const amountNum = parseFloat(amount);
      if (amountNum <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      
      if (tab === 'deposit' && amountNum > walletBalance) {
        throw new Error('Insufficient wallet balance');
      }
      
      if (tab === 'withdraw' && amountNum > exchangeBalance) {
        throw new Error('Insufficient exchange balance');
      }
      
      let txXdr: string;
      
      if (tab === 'deposit') {
        // For deposits, check if we need approval first
        if (allowance < amountNum) {
          // Create approve + deposit transaction
          txXdr = await createApproveAndDepositTransaction({
            trader: state.address,
            amount: amountNum,
          });
        } else {
          // Just deposit transaction
          const { createDepositTransaction } = await import('@/lib/stellar/trading-operations');
          txXdr = await createDepositTransaction({
            trader: state.address,
            amount: amountNum,
          });
        }
      } else {
        // Withdraw transaction
        txXdr = await createWithdrawTransaction({
          trader: state.address,
          amount: amountNum,
        });
      }
      
      // Sign and submit transaction
      const signedTx = await signTransaction(txXdr);
      
      console.log(`${tab} transaction submitted:`, signedTx);
      
      // Refresh balances after successful transaction
      setTimeout(() => {
        refetch();
      }, 2000);
      
      // Reset form and close
      setAmount('');
      onClose();
    } catch (error: any) {
      console.error(`${tab} failed:`, error);
      setError(error.message || `Failed to ${tab} collateral`);
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
              <span className="text-sm text-gray-400">
                {tab === 'deposit' ? 'Wallet Balance' : 'Exchange Balance'}
              </span>
              <span className="text-lg font-semibold text-white">
                ${displayBalance.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500">USDC (USD Coin)</div>
            {tab === 'deposit' && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Exchange Balance</span>
                  <span className="text-sm text-gray-300">${exchangeBalance.toFixed(2)}</span>
                </div>
              </div>
            )}
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
                USDC
              </span>
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['25%', '50%', '75%', 'Max'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  if (preset === 'Max') {
                    setAmount(displayBalance.toFixed(2));
                  } else {
                    const percent = parseInt(preset) / 100;
                    setAmount((displayBalance * percent).toFixed(2));
                  }
                }}
                className="py-1 px-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={displayBalance <= 0}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Faucet button for testnet */}
          {tab === 'deposit' && (
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={async () => {
                  if (!state.address) return;
                  setIsLoading(true);
                  try {
                    const response = await fetch('/api/faucet', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ address: state.address }),
                    });
                    const result = await response.json();
                    if (response.ok) {
                      alert(`Success! Minted ${result.amount} USDC to your wallet.`);
                      setTimeout(() => refetch(), 3000);
                    } else {
                      alert(`Faucet error: ${result.error}`);
                    }
                  } catch (error) {
                    alert('Failed to request from faucet');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading || !state.address}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? 'Requesting...' : '🚰 Get 100 USDC from Faucet'}
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Free testnet USDC • 1 request per hour
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          
          {/* Warning for withdraw */}
          {tab === 'withdraw' && amount && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                Withdrawing collateral will reduce your buying power and may affect open positions.
              </p>
            </div>
          )}
          
          {/* Approval info for deposits */}
          {tab === 'deposit' && amount && parseFloat(amount) > allowance && (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                This transaction will include approval for the FlashPerp contract to spend your USDC.
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