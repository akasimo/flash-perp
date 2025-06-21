// Trading app layout with wallet integration

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { WalletProvider } from '@/lib/hooks/useWallet';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlashPerp App | Perpetual Trading on Stellar',
  description: 'Professional perpetual trading interface for BTC, ETH, and XLM on Stellar Network.',
  robots: 'noindex, nofollow', // Prevent indexing of the app
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white overflow-hidden`}>
        <WalletProvider>
          <div className="h-screen flex flex-col">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}