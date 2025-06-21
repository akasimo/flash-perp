// Hero section for landing page

'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-blue-600/20 px-4 py-1.5 text-sm font-medium text-blue-200 ring-1 ring-inset ring-blue-600/30 mb-8">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
            </svg>
            Now Live on Stellar Testnet
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Perpetual Trading
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Redefined
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">
            Trade BTC, ETH, and XLM perpetuals with isolated margin on Stellar Network. 
            Experience lightning-fast settlements with minimal fees.
          </p>

          {/* Key stats */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center ring-1 ring-white/20">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-blue-200">Supported Markets</div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center ring-1 ring-white/20">
              <div className="text-2xl font-bold text-white">10x</div>
              <div className="text-sm text-blue-200">Max Leverage</div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center ring-1 ring-white/20">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-blue-200">Trading</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/app">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl"
              >
                Launch App
              </Button>
            </Link>
            <button className="text-sm font-semibold leading-6 text-white hover:text-blue-200 transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-200/60">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1L5 4v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V4l-5-3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Audited Smart Contracts</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Non-custodial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/2 right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </section>
  );
}