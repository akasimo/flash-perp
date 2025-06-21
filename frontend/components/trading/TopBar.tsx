// Minimal top bar for trading interface

'use client';

import React, { useState } from 'react';
import WalletButton from '@/components/wallet/WalletButton';
import { useNetworkStatus } from '@/lib/hooks/useWallet';

interface TopBarProps {
  onCollateralClick?: () => void;
}

export default function TopBar({ onCollateralClick }: TopBarProps) {
  const { currentNetwork, needsNetworkSwitch } = useNetworkStatus();

  // Network badge color
  const getNetworkBadgeColor = () => {
    if (needsNetworkSwitch) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (currentNetwork === 'TESTNET') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  return (
    <div className="h-10 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4">
      {/* Left side - Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">FP</span>
          </div>
          <span className="text-white font-semibold text-sm">FlashPerp</span>
        </div>
        
        {/* Network badge */}
        <div className={`px-2 py-0.5 rounded text-xs font-medium border ${getNetworkBadgeColor()}`}>
          {currentNetwork}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        {/* Collateral button */}
        <button
          onClick={onCollateralClick}
          className="px-3 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          Collateral
        </button>
        
        {/* Wallet button */}
        <WalletButton variant="outline" size="sm" />
      </div>
    </div>
  );
}