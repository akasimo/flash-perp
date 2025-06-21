// Root layout - handles routing between landing and app

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlashPerp | Perpetual Trading on Stellar',
  description: 'Professional perpetual trading platform on Stellar Network. Trade BTC, ETH, and XLM with up to 10x leverage.',
  keywords: 'stellar, perpetual, trading, defi, bitcoin, ethereum, xlm, derivatives',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}