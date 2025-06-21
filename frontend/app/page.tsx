'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketSelector from '@/components/MarketSelector';
import TradingPanel from '@/components/TradingPanel';
import PositionList from '@/components/PositionList';
import { Position, OrderForm } from '@/types';
import { FlashPerpClient } from '@/lib/stellar';

export default function Home() {
  const [selectedMarket, setSelectedMarket] = useState('XLMUSD');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [collateral, setCollateral] = useState<bigint>(0n);
  const [client, setClient] = useState<FlashPerpClient | null>(null);

  useEffect(() => {
    const contractId = process.env.NEXT_PUBLIC_PERP_CONTRACT || '';
    if (contractId) {
      setClient(new FlashPerpClient(contractId));
    }
  }, []);

  useEffect(() => {
    if (client && walletAddress) {
      // Fetch user data
      fetchUserData();
      // Set up polling for updates
      const interval = setInterval(fetchUserData, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [client, walletAddress]);

  const fetchUserData = async () => {
    if (!client || !walletAddress) return;
    
    try {
      const userCollateral = await client.getCollateral(walletAddress);
      setCollateral(userCollateral);
      
      // Fetch positions for all markets
      // In a real app, you'd have a method to fetch all positions at once
      // For now, we'll just update collateral
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleOrderSubmit = async (order: OrderForm) => {
    if (!client || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const size = BigInt(Math.floor(parseFloat(order.size) * 1_000_000)); // Convert to 6 decimals
      const margin = size / BigInt(order.leverage);
      
      const success = await client.openPosition(
        order.symbol,
        order.side === 'long' ? size : -size,
        margin
      );

      if (success) {
        alert('Position opened successfully!');
        fetchUserData();
      } else {
        alert('Failed to open position');
      }
    } catch (error) {
      console.error('Error opening position:', error);
      alert('Error opening position');
    }
  };

  const handleClosePosition = async (position: Position) => {
    // Implement position closing
    alert('Close position functionality to be implemented');
  };

  const handleDeposit = async () => {
    if (!client || !walletAddress) return;
    
    const amount = prompt('Enter amount to deposit (USDC):');
    if (!amount) return;
    
    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
      const success = await client.depositCollateral(amountBigInt);
      
      if (success) {
        alert('Deposit successful!');
        fetchUserData();
      } else {
        alert('Deposit failed');
      }
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Error depositing collateral');
    }
  };

  return (
    <div className="min-h-screen bg-perp-dark">
      <Header onWalletConnect={handleWalletConnect} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Account Info */}
        {walletAddress && (
          <div className="bg-perp-darker rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Free Collateral</p>
                <p className="text-2xl font-bold">
                  {(Number(collateral) / 1_000_000).toFixed(2)} USDC
                </p>
              </div>
              <button
                onClick={handleDeposit}
                className="bg-perp-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                Deposit
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Market Selector */}
          <div className="lg:col-span-1">
            <MarketSelector
              selectedMarket={selectedMarket}
              onMarketSelect={setSelectedMarket}
            />
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <TradingPanel
              selectedMarket={selectedMarket}
              onSubmitOrder={handleOrderSubmit}
            />
          </div>

          {/* Chart Area (Placeholder) */}
          <div className="lg:col-span-2">
            <div className="bg-perp-darker rounded-lg p-6 h-full min-h-[400px] flex items-center justify-center">
              <p className="text-gray-400">Chart coming soon...</p>
            </div>
          </div>
        </div>

        {/* Positions */}
        <div className="mt-6">
          <PositionList
            positions={positions}
            onClosePosition={handleClosePosition}
          />
        </div>
      </main>
    </div>
  );
}