'use client';

import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { FlashPerpClient } from '@/lib/stellar';

interface HeaderProps {
  onWalletConnect: (address: string) => void;
}

export default function Header({ onWalletConnect }: HeaderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [client, setClient] = useState<FlashPerpClient | null>(null);

  useEffect(() => {
    const contractId = process.env.NEXT_PUBLIC_PERP_CONTRACT || '';
    if (contractId) {
      setClient(new FlashPerpClient(contractId));
    }
  }, []);

  const handleConnect = async () => {
    if (!client) return;
    
    const publicKey = await client.connectWallet();
    if (publicKey) {
      setAddress(publicKey);
      onWalletConnect(publicKey);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-perp-darker border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-perp-primary">FlashPerp</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white">Trade</a>
              <a href="#" className="text-gray-300 hover:text-white">Portfolio</a>
              <a href="#" className="text-gray-300 hover:text-white">Markets</a>
            </nav>
          </div>
          
          <button
            onClick={handleConnect}
            className="flex items-center space-x-2 bg-perp-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Wallet size={20} />
            <span>{address ? formatAddress(address) : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}