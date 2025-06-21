# Chart Implementation Guide for FlashPerp v1

## Overview
This guide provides detailed implementation options for integrating real-time charts with Binance data.

## Option 1: TradingView Widget (Recommended for v1)

### Pros
- Professional appearance
- Minimal implementation time (2-3 hours)
- Built-in indicators and drawing tools
- Mobile responsive out of the box

### Implementation
```typescript
// frontend/components/trading/TradingViewChart.tsx
import { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Map our symbols to TradingView format
    const tvSymbol = symbol === 'BTCUSD' ? 'BINANCE:BTCUSDT' : 
                     symbol === 'ETHUSD' ? 'BINANCE:ETHUSDT' : 
                     'BINANCE:XLMUSDT';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof TradingView !== 'undefined' && containerRef.current) {
        new TradingView.widget({
          container_id: containerRef.current.id,
          symbol: tvSymbol,
          interval: '5',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0b0e11',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          details: false,
          hotlist: false,
          calendar: false,
          studies: ['MACD@tv-basicstudies', 'RSI@tv-basicstudies'],
          width: '100%',
          height: '100%'
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return <div id="tradingview_widget" ref={containerRef} className="h-full" />;
}

export default memo(TradingViewChart);
```

## Option 2: Lightweight Charts with Binance WebSocket

### Pros
- Full control over appearance
- No external dependencies
- Can customize exactly to our needs
- Free and open source

### Implementation

#### Step 1: Install Dependencies
```bash
npm install lightweight-charts
```

#### Step 2: Create Binance WebSocket Service
```typescript
// frontend/lib/marketFeed/binanceWebSocket.ts
export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class BinanceWebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, (data: KlineData) => void> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private symbol: string = '';

  connect(symbol: string): void {
    this.symbol = symbol;
    
    // Map our symbols to Binance format
    const binanceSymbol = this.mapSymbol(symbol).toLowerCase();
    const url = `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_1m`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Binance WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.k) {
        const kline = message.k;
        const bar: KlineData = {
          time: Math.floor(kline.t / 1000),
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v)
        };
        
        this.subscribers.forEach(callback => callback(bar));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.reconnect();
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.reconnect();
    };
  }

  private mapSymbol(symbol: string): string {
    const symbolMap: Record<string, string> = {
      'BTCUSD': 'BTCUSDT',
      'ETHUSD': 'ETHUSDT',
      'XLMUSD': 'XLMUSDT'
    };
    return symbolMap[symbol] || symbol;
  }

  private reconnect(): void {
    if (this.reconnectTimeout) return;
    
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect(this.symbol);
      this.reconnectTimeout = null;
    }, 5000);
  }

  subscribe(id: string, callback: (data: KlineData) => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscribers.clear();
  }
}
```

#### Step 3: Create Chart Component
```typescript
// frontend/components/trading/LightweightChart.tsx
import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { BinanceWebSocketService, KlineData } from '@/lib/marketFeed/binanceWebSocket';

interface LightweightChartProps {
  symbol: string;
}

export default function LightweightChart({ symbol }: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsServiceRef = useRef<BinanceWebSocketService | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#0b0e11' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1e222d',
      },
      timeScale: {
        borderColor: '#1e222d',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Load initial data
    loadHistoricalData(symbol, candlestickSeries);

    // Connect WebSocket
    const wsService = new BinanceWebSocketService();
    wsServiceRef.current = wsService;
    
    wsService.connect(symbol);
    wsService.subscribe('chart', (data: KlineData) => {
      candlestickSeries.update(data);
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
      chart.remove();
    };
  }, [symbol]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}

async function loadHistoricalData(
  symbol: string, 
  series: ISeriesApi<'Candlestick'>
): Promise<void> {
  try {
    // Fetch last 300 candles from Binance REST API
    const binanceSymbol = mapSymbol(symbol);
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=300`
    );
    
    const data = await response.json();
    
    const candles = data.map((k: any) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
    }));
    
    series.setData(candles);
  } catch (error) {
    console.error('Failed to load historical data:', error);
  }
}

function mapSymbol(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BTCUSD': 'BTCUSDT',
    'ETHUSD': 'ETHUSDT',
    'XLMUSD': 'XLMUSDT'
  };
  return symbolMap[symbol] || symbol;
}
```

## Option 3: React Financial Charts (Alternative)

### Pros
- React-native implementation
- Good for custom financial indicators
- TypeScript support

### Implementation
```bash
npm install @react-financial-charts/core @react-financial-charts/charts @react-financial-charts/indicators
```

## Comparison Matrix

| Feature | TradingView Widget | Lightweight Charts | React Financial Charts |
|---------|-------------------|-------------------|----------------------|
| Implementation Time | 2-3 hours | 6-8 hours | 8-10 hours |
| Customization | Limited | High | Very High |
| Performance | Excellent | Excellent | Good |
| Mobile Support | Built-in | Manual | Manual |
| Indicators | 100+ built-in | Manual implementation | Some built-in |
| Drawing Tools | Yes | No | Limited |
| Cost | Free (with watermark) | Free | Free |
| Bundle Size | External | ~250KB | ~400KB |

## Recommendation for v1

**Use TradingView Widget** for the fastest path to production with professional appearance.

### Fallback Strategy
```typescript
// frontend/components/trading/ChartPanel.tsx
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Try TradingView first
const TradingViewChart = dynamic(
  () => import('./TradingViewChart'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Fallback to Lightweight Charts
const LightweightChart = dynamic(
  () => import('./LightweightChart'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

export default function ChartPanel({ selectedMarket }: ChartPanelProps) {
  const [chartError, setChartError] = useState(false);

  return (
    <div className="bg-gray-950 flex flex-col h-full">
      <ChartHeader selectedMarket={selectedMarket} />
      
      <div className="flex-1 p-2">
        {!chartError ? (
          <ErrorBoundary onError={() => setChartError(true)}>
            <TradingViewChart symbol={selectedMarket} />
          </ErrorBoundary>
        ) : (
          <LightweightChart symbol={selectedMarket} />
        )}
      </div>
    </div>
  );
}
```

This approach ensures users always see a chart, even if TradingView fails to load.