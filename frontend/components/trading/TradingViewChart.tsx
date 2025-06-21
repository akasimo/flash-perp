// TradingView chart component with Binance data feed

'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Clean up existing widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        // Widget might already be removed
      }
      widgetRef.current = null;
    }

    if (!containerRef.current) return;

    // Map our symbols to TradingView/Binance format
    const getTradingViewSymbol = (sym: string) => {
      const symbolMap: Record<string, string> = {
        'BTCUSD': 'BINANCE:BTCUSDT',
        'ETHUSD': 'BINANCE:ETHUSDT', 
        'XLMUSD': 'BINANCE:XLMUSDT'
      };
      return symbolMap[sym] || 'BINANCE:BTCUSDT';
    };

    const tvSymbol = getTradingViewSymbol(symbol);

    // Load TradingView script if not already loaded
    const loadTradingViewWidget = () => {
      if (typeof window.TradingView !== 'undefined') {
        createWidget();
      } else {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = createWidget;
        document.head.appendChild(script);
      }
    };

    const createWidget = () => {
      if (!containerRef.current || typeof window.TradingView === 'undefined') return;

      try {
        widgetRef.current = new window.TradingView.widget({
          container_id: containerRef.current.id,
          symbol: tvSymbol,
          interval: '5', // 5 minute interval
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1', // Candlestick
          locale: 'en',
          toolbar_bg: '#0b0e11',
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          details: false,
          hotlist: false,
          calendar: false,
          studies: [
            'MACD@tv-basicstudies',
            'RSI@tv-basicstudies'
          ],
          width: '100%',
          height: '100%',
          save_image: false,
          hide_volume: false,
          overrides: {
            'paneProperties.background': '#0b0e11',
            'paneProperties.vertGridProperties.color': '#1e222d',
            'paneProperties.horzGridProperties.color': '#1e222d',
            'scalesProperties.textColor': '#d1d4dc',
            'scalesProperties.backgroundColor': '#0b0e11',
          },
          studies_overrides: {
            'volume.volume.color.0': '#ef534f',
            'volume.volume.color.1': '#26a69a',
          },
          loading_screen: {
            backgroundColor: '#0b0e11',
            foregroundColor: '#2563eb'
          }
        });
      } catch (error) {
        console.error('Failed to create TradingView widget:', error);
        // Fallback to placeholder
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="h-full flex items-center justify-center text-gray-400">
              <div class="text-center">
                <div class="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p class="text-sm">Chart Loading Failed</p>
                <p class="text-xs mt-1">TradingView unavailable</p>
              </div>
            </div>
          `;
        }
      }
    };

    loadTradingViewWidget();

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Widget might already be removed
        }
        widgetRef.current = null;
      }
    };
  }, [symbol]);

  return (
    <div className="w-full h-full relative">
      <div 
        id={`tradingview_${symbol}_${Date.now()}`}
        ref={containerRef} 
        className="w-full h-full"
      />
    </div>
  );
}

export default memo(TradingViewChart);