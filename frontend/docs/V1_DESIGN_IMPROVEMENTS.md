# FlashPerp v1 Design Improvements Plan

## Overview
This document outlines the design changes for FlashPerp v1 to create a cleaner, more functional trading interface without order books and with proper charting integration.

## 1. Layout Restructure

### Current Layout
```
[OrderBook (3 cols)] | [Chart (6 cols)] | [Trading (3 cols)]
```

### New Layout
```
[Chart (8-9 cols)] | [Trading (3-4 cols)]
```

### Implementation Details:
- **Remove OrderBookPanel.tsx** from the grid layout
- **Expand ChartPanel** to take up 8-9 columns (col-span-8 or col-span-9)
- **Keep TradingPanel** at 3-4 columns (col-span-3 or col-span-4)
- Total grid remains 12 columns for proper responsiveness

## 2. TradingView Chart Integration

### Option A: TradingView Widget (Recommended)
```typescript
// frontend/components/trading/TradingViewWidget.tsx
import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'dark' | 'light';
}

// Uses lightweight-chart library with Binance WebSocket feed
// Symbol mapping: BTCUSD → BTCUSDT for Binance
```

### Option B: Lightweight Charts (Fallback)
```typescript
// frontend/lib/charts/lightweight-charts-integration.ts
import { createChart } from 'lightweight-charts';

// Direct Binance WebSocket integration
// More control but requires more implementation
```

### Binance Data Feed Architecture:
```typescript
// frontend/lib/marketFeed/binance.ts
class BinanceWebSocketFeed {
  private ws: WebSocket;
  private subscribers: Map<string, (data: KlineData) => void>;
  
  connect(symbol: string) {
    // wss://stream.binance.com:9443/ws/btcusdt@kline_1m
  }
  
  subscribeBars(symbol: string, onBar: (bar: Bar) => void) {
    // Convert Binance kline format to OHLCV
  }
}
```

## 3. Wallet Display Fix

### Current Issue
- Wallet address text color matches dark background
- Address too long causes overflow

### Solution
```tsx
// frontend/components/wallet/WalletButton.tsx
<button className="flex items-center gap-2 px-3 py-1.5 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors">
  <div className="w-2 h-2 bg-green-400 rounded-full" />
  <span className="text-white text-sm font-mono truncate max-w-[120px]">
    {formatAddress(address)}
  </span>
</button>
```

## 4. Order Entry Improvements

### Limit Order Handling
```tsx
// In TradingPanel.tsx
{orderType === 'limit' && (
  <div className="text-xs text-gray-500 italic mt-1">
    Limit orders coming in v2
  </div>
)}

// Disable submit button when limit selected
disabled={orderType === 'limit' || isSubmitting}
```

## 5. Market Selector Fixes

### Current Issues:
1. Active market has same color as background (unreadable)
2. Other markets not selectable

### Solutions:
```tsx
// frontend/components/trading/MarketSelector.tsx
<Combobox.Option
  className={({ active }) =>
    `relative cursor-pointer select-none px-4 py-3 ${
      active ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
    }`
  }
>
  // Ensure proper contrast for active state
  // Fix: Change from 'bg-gray-800' to 'bg-blue-600'
</Combobox.Option>
```

## 6. Position Display Options

### Option A: Keep in Right Panel (Current)
- Pros: Traditional layout, easy to see while trading
- Cons: Right panel might feel crowded

### Option B: Move to Bottom Drawer
```tsx
// New component: frontend/components/trading/PositionDrawer.tsx
<div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800">
  <div className="max-w-7xl mx-auto p-4">
    {/* Collapsible position details */}
  </div>
</div>
```

**Recommendation**: Keep in right panel for v1, consider bottom drawer for v2 when we have multiple positions.

## 7. Favicon Implementation

### Files to Add:
```
frontend/public/
├── favicon.ico (32x32)
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png (180x180)
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

### Update app/layout.tsx:
```tsx
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

## 8. Final Layout Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│ [FP] FlashPerp  TESTNET              Collateral    [0xAbC...123] │ 40px
├─────────────────────────────────────────────────────────────────┤
│ [▼ BTCUSD - $65,432.10 (+2.45%)]                                │ 48px
├─────────────────────────────────────────────────────────────────┤
│                                      │                           │
│                                      │   Place Order             │
│                                      │   ┌─────────┬─────────┐  │
│                                      │   │ Market  │  Limit  │  │
│          TradingView Chart           │   └─────────┴─────────┘  │
│            (Real-time)               │   [Buy] [Sell]           │
│                                      │                           │
│         Binance Data Feed            │   Size: [_____]          │
│                                      │   Leverage: [====] 10x   │
│                                      │                           │
│                                      │   [Submit Order]         │
│                                      │                           │
│                                      │   ─── Position ───       │
│                                      │   BTCUSD LONG            │
│                                      │   Size: 0.5              │
│                                      │   Entry: $65,200         │
│                                      │   PnL: +$116 (+2.31%)    │
│                                      │   [Close Position]       │
└─────────────────────────────────────────────────────────────────┘
```

## 9. Implementation Priority

1. **High Priority**
   - Remove OrderBook, expand Chart
   - Fix wallet display bug
   - Fix market selector colors/selection
   - Add favicon

2. **Medium Priority**
   - Implement TradingView/charting
   - Add limit order disabled state

3. **Low Priority**
   - Consider position drawer (defer to v2)

## 10. Technical Decisions

### Chart Library Choice
**Recommendation**: Start with TradingView Widget for fastest implementation
- Pros: Professional, feature-rich, minimal code
- Cons: Less customization, potential licensing
- Fallback: lightweight-charts with custom Binance integration

### WebSocket Management
- Single connection per symbol
- Reconnection logic with exponential backoff
- Proper cleanup on component unmount

### Symbol Mapping
```typescript
const SYMBOL_MAP = {
  'BTCUSD': 'BTCUSDT',
  'ETHUSD': 'ETHUSDT',
  'XLMUSD': 'XLMUSDT'
};
```

## Estimated Timeline
- Layout changes: 2 hours
- Chart integration: 4-6 hours
- UI fixes: 2 hours
- Testing: 2 hours
- **Total: 10-12 hours**