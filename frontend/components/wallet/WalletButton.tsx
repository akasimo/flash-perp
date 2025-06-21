// Wallet connection button component

'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useWallet, useNetworkStatus } from '@/lib/hooks/useWallet';
import { useIsMounted } from '@/lib/hooks/useIsMounted';
import WalletModal from './WalletModal';

interface WalletButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function WalletButton({ 
  className, 
  variant = 'primary', 
  size = 'md' 
}: WalletButtonProps) {
  const mounted = useIsMounted();
  const { state, connect, disconnect } = useWallet();
  const { needsNetworkSwitch } = useNetworkStatus();
  const [showModal, setShowModal] = useState(false);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        Loading...
      </Button>
    );
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Handle button click
  const handleClick = () => {
    if (state.isConnected) {
      setShowModal(true);
    } else {
      connect();
    }
  };

  // Show network warning if needed
  if (state.isConnected && needsNetworkSwitch) {
    return (
      <>
        <Button
          variant="danger"
          size={size}
          className={className}
          onClick={() => setShowModal(true)}
        >
          Wrong Network
        </Button>
        {showModal && (
          <WalletModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        loading={state.isConnecting}
        onClick={handleClick}
      >
        {state.isConnecting ? (
          'Connecting...'
        ) : state.isConnected ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>{formatAddress(state.address!)}</span>
          </div>
        ) : (
          'Connect Wallet'
        )}
      </Button>

      {showModal && (
        <WalletModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}