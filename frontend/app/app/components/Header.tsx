// Trading app header with wallet integration and navigation

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from '@/components/wallet/WalletButton';
import { useWallet } from '@/lib/hooks/useWallet';

export default function AppHeader() {
  const pathname = usePathname();
  const { state } = useWallet();

  const navItems = [
    { name: 'Trading', href: '/app', active: pathname === '/app' },
    { name: 'Positions', href: '/app/positions', active: pathname === '/app/positions' },
    { name: 'History', href: '/app/history', active: pathname === '/app/history' },
  ];

  return (
    <header className="flex-shrink-0 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section - Logo and nav */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Flash<span className="text-blue-400">Perp</span>
              </h1>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-900 text-red-200 border border-red-700">
                  TESTNET
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center section - Network status */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="text-sm text-gray-300">Stellar Testnet</span>
          </div>
          
          {state.isConnected && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-300">Connected</span>
            </div>
          )}
        </div>

        {/* Right section - Wallet and settings */}
        <div className="flex items-center space-x-4">
          {/* Settings dropdown (placeholder) */}
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Wallet button */}
          <WalletButton />
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-700">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}