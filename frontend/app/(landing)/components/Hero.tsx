// Hero section for landing page

'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--landing-bg-primary) 0%, var(--landing-bg-accent) 50%, var(--landing-bg-primary) 100%)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full hero-card px-4 py-1.5 text-sm font-medium mb-8" style={{ color: 'var(--blue-800)' }}>
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l1.5 2.25a.75.75 0 001.262-.044l4-5.5z" clipRule="evenodd" />
            </svg>
            Now Live on Stellar Testnet
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style={{ color: 'var(--landing-text-primary)' }}>
            Perpetual Trading
            <span className="block bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              Redefined
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl" style={{ color: 'var(--landing-text-body)' }}>
            Trade BTC, ETH, and XLM perpetuals with isolated margin on Stellar Network. 
            Experience lightning-fast settlements with minimal fees.
          </p>

          {/* Key stats */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="hero-card p-6 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--blue-700)' }}>3</div>
              <div className="text-sm" style={{ color: 'var(--landing-text-muted)' }}>Supported Markets</div>
            </div>
            <div className="hero-card p-6 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--blue-700)' }}>10x</div>
              <div className="text-sm" style={{ color: 'var(--landing-text-muted)' }}>Max Leverage</div>
            </div>
            <div className="hero-card p-6 text-center">
              <div className="text-3xl font-bold mb-2 stat-spacing" style={{ color: 'var(--blue-700)' }}>24 / 7</div>
              <div className="text-sm" style={{ color: 'var(--landing-text-muted)' }}>Trading</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/app">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg px-8 py-3"
              >
                Launch App
              </Button>
            </Link>
            <button className="text-sm font-semibold leading-6 hover:text-blue-700 transition-colors" style={{ color: 'var(--landing-text-secondary)' }}>
              Learn more <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-12 flex items-center justify-center space-x-8" style={{ color: 'var(--landing-text-muted)' }}>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Non-custodial</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Open Source</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}