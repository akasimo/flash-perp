// Landing page layout

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlashPerp | Perpetual Trading on Stellar',
  description: 'Trade BTC, ETH, and XLM perpetuals with isolated margin on Stellar Network. Fast, secure, and decentralized.',
  keywords: 'stellar, perpetual, trading, defi, bitcoin, ethereum, xlm, derivatives',
  openGraph: {
    title: 'FlashPerp | Perpetual Trading on Stellar',
    description: 'Trade BTC, ETH, and XLM perpetuals with isolated margin on Stellar Network.',
    type: 'website',
    url: 'https://flashperp.stellar.org',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlashPerp | Perpetual Trading on Stellar',
    description: 'Trade BTC, ETH, and XLM perpetuals with isolated margin on Stellar Network.',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} landing-page`}>
        {children}
      </body>
    </html>
  );
}