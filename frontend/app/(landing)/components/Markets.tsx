// Markets section for landing page

'use client';

import React, { useState, useEffect } from 'react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  funding: number;
  icon: string;
}

export default function Markets() {
  const [markets, setMarkets] = useState<MarketData[]>([
    {
      symbol: 'BTCUSD',
      name: 'Bitcoin',
      price: 65432.10,
      change24h: 2.45,
      volume24h: 1250000,
      funding: 0.0125,
      icon: '₿',
    },
    {
      symbol: 'ETHUSD',
      name: 'Ethereum',
      price: 3456.78,
      change24h: -1.23,
      volume24h: 890000,
      funding: -0.0089,
      icon: 'Ξ',
    },
    {
      symbol: 'XLMUSD',
      name: 'Stellar Lumens',
      price: 0.1234,
      change24h: 5.67,
      volume24h: 450000,
      funding: 0.0156,
      icon: '✦',
    },
  ]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(market => ({
        ...market,
        price: market.price * (1 + (Math.random() - 0.5) * 0.001), // ±0.05% random change
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'XLMUSD') {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const formatFunding = (funding: number) => {
    return `${(funding * 100).toFixed(3)}%`;
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Supported Markets</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trade major crypto perpetuals
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Access perpetual contracts for the most liquid cryptocurrencies with up to 10x leverage.
          </p>
        </div>

        {/* Markets table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Market</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">24h Change</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">24h Volume</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Funding Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {markets.map((market, index) => (
                  <tr key={market.symbol} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {market.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{market.symbol}</div>
                          <div className="text-sm text-gray-500">{market.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-semibold text-gray-900">
                        {formatPrice(market.price, market.symbol)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        market.change24h >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono text-gray-900">
                        {formatVolume(market.volume24h)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-mono ${
                        market.funding >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatFunding(market.funding)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market features */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Up to 10x Leverage</h3>
            <p className="text-gray-600">
              Amplify your trading power with flexible leverage options up to 10x on all markets.
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Trading</h3>
            <p className="text-gray-600">
              Markets never sleep. Trade perpetuals around the clock with continuous price discovery.
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Funding Rates</h3>
            <p className="text-gray-600">
              Transparent funding mechanism that keeps perpetual prices aligned with spot markets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}