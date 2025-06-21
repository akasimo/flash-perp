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
    <header className="flex-shrink-0 border-b" style={{ backgroundColor: 'var(--app-bg-secondary)', borderColor: 'rgba(33, 150, 243, 0.1)' }}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section - Logo and nav */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--app-accent-primary)' }}>
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--app-text-primary)' }}>
                Flash<span style={{ color: 'var(--app-accent-primary)' }}>Perp</span>
              </h1>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border" 
                      style={{ backgroundColor: 'var(--app-accent-danger)', color: 'white', borderColor: 'var(--app-accent-danger)' }}>
                  TESTNET
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--app-accent-success)' }} />
                  <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>Live</span>
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
                    ? 'text-white'
                    : 'hover:text-white'
                }`}
                style={{
                  backgroundColor: item.active ? 'var(--app-accent-primary)' : 'transparent',
                  color: item.active ? 'white' : 'var(--app-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center section - Network status */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--app-bg-tertiary)' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--app-accent-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Stellar Testnet</span>
          </div>
          
          {state.isConnected && (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--app-bg-tertiary)' }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--app-accent-success)' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Connected</span>
            </div>
          )}
        </div>

        {/* Right section - Wallet and settings */}
        <div className="flex items-center space-x-4">
          {/* Settings dropdown (placeholder) */}
          <button 
            className="p-2 rounded-lg transition-colors" 
            style={{ 
              color: 'var(--app-text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)';
              e.currentTarget.style.color = 'var(--app-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--app-text-muted)';
            }}
          >
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
      <div className="md:hidden border-t" style={{ borderColor: 'rgba(33, 150, 243, 0.1)' }}>
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: item.active ? 'var(--app-accent-primary)' : 'transparent',
                color: item.active ? 'white' : 'var(--app-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)';
                  e.currentTarget.style.color = 'var(--app-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--app-text-secondary)';
                }
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}