// Landing page

import React from 'react';
import Link from 'next/link';
import Hero from './components/Hero';
import Features from './components/Features';
import Markets from './components/Markets';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white">
                  Flash<span className="text-blue-400">Perp</span>
                </h1>
              </div>
            </div>

            {/* Navigation links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-blue-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#markets" className="text-blue-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Markets
                </a>
                <a href="#how-it-works" className="text-blue-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  How it Works
                </a>
                <a 
                  href="https://docs.stellar.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Docs
                </a>
              </div>
            </div>

            {/* CTA button */}
            <div className="flex items-center space-x-4">
              <Link href="/app">
                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                  Launch App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <Hero />

      {/* Features section */}
      <div id="features">
        <Features />
      </div>

      {/* Markets section */}
      <div id="markets">
        <Markets />
      </div>

      {/* How it works section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600">How it Works</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Start trading in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Wallet</h3>
              <p className="text-gray-600 mb-6">
                Connect your Freighter wallet to the FlashPerp trading interface. 
                Make sure you're on Stellar Testnet.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>Free Freighter wallet</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Deposit Collateral</h3>
              <p className="text-gray-600 mb-6">
                Deposit USDC to your FlashPerp account. This serves as universal 
                collateral for all your perpetual positions.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>USDC accepted</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Trading</h3>
              <p className="text-gray-600 mb-6">
                Open long or short positions on BTC, ETH, or XLM with up to 10x leverage. 
                Each position uses isolated margin for risk management.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 10x leverage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk disclaimer */}
          <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Risk Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Trading perpetual contracts involves substantial risk and may result in loss of capital. 
                    This is testnet software for demonstration purposes only. Never trade with funds you cannot afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-4">
                Flash<span className="text-blue-400">Perp</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Professional perpetual trading on Stellar Network.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/app" className="hover:text-white transition-colors">Trading App</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#markets" className="hover:text-white transition-colors">Markets</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://docs.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://stellar.expert" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Explorer</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FlashPerp. Built on Stellar Testnet.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                TESTNET ONLY
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}