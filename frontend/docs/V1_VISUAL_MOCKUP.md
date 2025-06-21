# FlashPerp v1 Visual Design Mockup

## Before vs After Comparison

### BEFORE (Current State)
```
┌────────────────────────────────────────────────────────────────────────┐
│ FlashPerp    TESTNET   live   FP              Collateral   [Wallet]    │ <- Cluttered header
├────────────────────────────────────────────────────────────────────────┤
│ [▼ BTCUSD Market Selector Dropdown ]                                    │
├────────────────────────────────────────────────────────────────────────┤
│ OrderBook │        Chart Placeholder         │   Trading Panel         │
│           │                                  │                         │
│ Bids/Asks │   "TradingView Coming Soon"     │   [Market] [Limit]     │
│           │                                  │   [Buy] [Sell]         │
│ (unused)  │                                  │   Size: [___]          │
│           │                                  │   Leverage: [==] 2x    │
│           │                                  │                         │
│           │                                  │   Position:            │
│           │                                  │   No position          │
└────────────────────────────────────────────────────────────────────────┘

Issues:
❌ OrderBook takes space but not used
❌ Chart is just placeholder
❌ Wallet address invisible (dark on dark)
❌ Market selector: selected item unreadable
❌ Can't select other markets
❌ No favicon
```

### AFTER (v1 Design)
```
┌────────────────────────────────────────────────────────────────────────┐
│ [FP] FlashPerp  🟡 TESTNET            Collateral    0xAbC...123 ●      │ <- Clean, minimal
├────────────────────────────────────────────────────────────────────────┤
│ [▼ BTCUSD   $65,432.10  +2.45% ▼]                                     │ <- Fixed dropdown
├────────────────────────────────────────────────────────────────────────┤
│                                                │  Place Order          │
│                                                │ ┌─────────┬─────────┐ │
│                                                │ │ Market  │ Limit*  │ │
│              📊 LIVE TRADING CHART             │ └─────────┴─────────┘ │
│                                                │  *Coming in v2        │
│         ┌─────────────────────────┐           │                       │
│         │                         │           │ ┌─────┐ ┌─────┐      │
│         │    Candlestick Chart    │           │ │ BUY │ │SELL │      │
│         │    with Binance Data    │           │ └─────┘ └─────┘      │
│         │                         │           │                       │
│         │    [1m][5m][15m][1h]    │           │ Size                 │
│         └─────────────────────────┘           │ [___________] USD    │
│                                                │                       │
│          Volume bars below                     │ Leverage: 10x        │
│                                                │ [=========|===]      │
│                                                │                       │
│                                                │ [🟢 LONG Market]      │
│                                                ├──────────────────────┤
│                                                │ 📍 Position          │
│                                                │ BTCUSD • LONG        │
│                                                │ Size: 0.5 BTC        │
│                                                │ Entry: $65,200       │
│                                                │ Mark: $65,432        │
│                                                │ PnL: +$116 (+2.31%)  │
│                                                │ [Close Position]     │
└────────────────────────────────────────────────────────────────────────┘

Improvements:
✅ No orderbook - more space for chart
✅ Real TradingView/Binance chart integration
✅ Wallet address visible (white text)
✅ Market selector with proper contrast (blue highlight)
✅ All markets selectable
✅ Favicon in browser tab
✅ Limit order clearly marked as "Coming in v2"
```

## Key Visual Changes

### 1. Color Scheme Fixes
```css
/* Market Selector Active State */
.market-selector-active {
  background: #2563eb; /* blue-600 */
  color: white;
}

/* Wallet Address */
.wallet-address {
  color: white;
  font-family: monospace;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 2. Grid Layout Change
```tsx
// From:
<div className="grid grid-cols-12">
  <div className="col-span-3">OrderBook</div>
  <div className="col-span-6">Chart</div>
  <div className="col-span-3">Trading</div>
</div>

// To:
<div className="grid grid-cols-12">
  <div className="col-span-8 lg:col-span-9">Chart</div>
  <div className="col-span-4 lg:col-span-3">Trading</div>
</div>
```

### 3. Chart Integration Options

#### Option A: TradingView Widget (Recommended)
```
┌─────────────────────────────────┐
│  ╔═══════════════════════════╗  │
│  ║  Professional TV Chart     ║  │
│  ║  • All indicators          ║  │
│  ║  • Drawing tools           ║  │
│  ║  • Multiple timeframes     ║  │
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

#### Option B: Lightweight Charts
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │  Simple Candlestick Chart  │  │
│  │  • Basic indicators        │  │
│  │  • Volume bars             │  │
│  │  • Crosshair               │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 4. Mobile Responsive Design (Future)
```
Mobile (320px - 768px):
┌─────────────────┐
│ Top Bar         │
├─────────────────┤
│ Market Selector │
├─────────────────┤
│                 │
│     Chart       │
│                 │
├─────────────────┤
│ Trading Panel   │
│ (Collapsible)   │
└─────────────────┘
```

## Component State Indicators

### Market Selector States
```
Default:     [▼ BTCUSD  $65,432  +2.45%]  (gray border)
Hover:       [▼ BTCUSD  $65,432  +2.45%]  (blue border)
Open:        [▼ BTCUSD  $65,432  +2.45%]  (blue border)
             ┌─────────────────────────┐
             │ BTCUSD  $65,432  +2.45% │  (blue bg)
             │ ETHUSD  $3,456   -1.23% │  (hover: gray bg)
             │ XLMUSD  $0.123   +5.67% │
             └─────────────────────────┘
```

### Order Button States
```
Market Buy:   [🟢 BUY / MARKET]   (green, enabled)
Market Sell:  [🔴 SELL / MARKET]  (red, enabled)
Limit Buy:    [⬜ BUY / LIMIT]    (gray, disabled)
Limit Sell:   [⬜ SELL / LIMIT]   (gray, disabled)
```

### Position Status Colors
```
Long Position:  🟢 LONG  (green badge)
Short Position: 🔴 SHORT (red badge)
Profit:         +$116 (+2.31%)  (green text)
Loss:           -$84 (-1.28%)   (red text)
```