# FlashPerp v1 Implementation Checklist

## Quick Summary of Changes
Transform the current 3-column layout (OrderBook|Chart|Trading) into a cleaner 2-column layout (Chart|Trading) with real charting and UI fixes.

## Pre-Implementation Setup
- [ ] Create feature branch: `git checkout -b feature/v1-trading-improvements`
- [ ] Install required dependencies:
  ```bash
  npm install lightweight-charts
  # or if using TradingView, no install needed
  ```

## Task List (Priority Order)

### 1. Layout Refactor (2 hours)
- [ ] **File**: `frontend/app/app/page.tsx`
  - [ ] Remove OrderBookPanel import
  - [ ] Change grid from `grid-cols-12` with 3-3-6 split to 9-3 or 8-4 split
  - [ ] Update grid classes:
    ```tsx
    <div className="flex-1 grid grid-cols-12 overflow-hidden">
      {/* Chart column - expanded */}
      <div className="col-span-8 lg:col-span-9">
        <ChartPanel selectedMarket={selectedMarket} />
      </div>
      
      {/* Trading column - same size */}
      <div className="col-span-4 lg:col-span-3">
        <TradingPanel />
      </div>
    </div>
    ```

### 2. Wallet Display Fix (30 minutes)
- [ ] **File**: `frontend/components/wallet/WalletButton.tsx`
  - [ ] Fix text color for connected state
  - [ ] Add address truncation
  - [ ] Update button styling:
    ```tsx
    // When connected
    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors">
      <div className="w-2 h-2 bg-green-400 rounded-full" />
      <span className="text-white text-sm font-mono truncate max-w-[120px]">
        {address.slice(0, 4)}...{address.slice(-4)}
      </span>
    </button>
    ```

### 3. Market Selector Fixes (1 hour)
- [ ] **File**: `frontend/components/trading/MarketSelector.tsx`
  - [ ] Fix active state background color
  - [ ] Ensure all options are clickable
  - [ ] Update Combobox.Option className:
    ```tsx
    className={({ active }) =>
      `relative cursor-pointer select-none px-4 py-3 ${
        active ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-800'
      }`
    }
    ```
  - [ ] Verify onMarketChange prop is properly connected in parent

### 4. Trading Panel Updates (1 hour)
- [ ] **File**: `frontend/components/trading/TradingPanel.tsx`
  - [ ] Add disabled state for limit orders
  - [ ] Add "Coming in v2" text under Limit tab
  - [ ] Update submit button logic:
    ```tsx
    <button
      disabled={orderType === 'limit' || !size || isSubmitting}
      className={`w-full py-3 rounded font-medium text-sm transition-colors ${
        orderType === 'limit' 
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
          : orderSide === 'buy'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
      }`}
    >
      {orderType === 'limit' ? 'Limit Orders Coming Soon' : `${orderSide} / Market`}
    </button>
    ```

### 5. Chart Implementation (4-6 hours)

#### Option A: TradingView Widget (Recommended)
- [ ] **Create**: `frontend/components/trading/TradingViewChart.tsx`
- [ ] Implement widget initialization
- [ ] Add symbol mapping (BTCUSD → BINANCE:BTCUSDT)
- [ ] Handle cleanup on unmount

#### Option B: Lightweight Charts
- [ ] **Create**: `frontend/lib/marketFeed/binanceWebSocket.ts`
- [ ] **Create**: `frontend/components/trading/LightweightChart.tsx`
- [ ] Implement WebSocket connection
- [ ] Add historical data loading
- [ ] Handle real-time updates

- [ ] **Update**: `frontend/components/trading/ChartPanel.tsx`
  - [ ] Replace placeholder with actual chart component
  - [ ] Add error boundary
  - [ ] Add loading state

### 6. Favicon Implementation (30 minutes)
- [ ] **Add files to**: `frontend/public/`
  - [ ] favicon.ico (32x32)
  - [ ] apple-touch-icon.png (180x180)
  - [ ] favicon-16x16.png
  - [ ] favicon-32x32.png
- [ ] **Update**: `frontend/app/layout.tsx`
  ```tsx
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  ```

### 7. Optional: Position Display Enhancement
- [ ] Consider if position should stay in trading panel or move to bottom
- [ ] If moving, create `PositionDrawer.tsx` component
- [ ] For v1, recommendation is to keep in trading panel

## Testing Checklist

### Functionality Tests
- [ ] Wallet connects and displays address properly
- [ ] Market selector dropdown works (can select all markets)
- [ ] Chart loads and displays real-time data
- [ ] Market orders can be placed
- [ ] Limit orders show disabled state
- [ ] Position information displays correctly
- [ ] Favicon appears in browser tab

### Visual Tests
- [ ] Dark theme consistent throughout
- [ ] No text readability issues (contrast)
- [ ] Responsive layout on different screen sizes
- [ ] Smooth transitions and hover states

### Performance Tests
- [ ] Chart doesn't lag with real-time updates
- [ ] WebSocket reconnects on disconnect
- [ ] No memory leaks on component unmount

## Code Review Checklist
- [ ] All TypeScript types properly defined
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] WebSocket cleanup on unmount
- [ ] Memoization where appropriate
- [ ] Accessibility basics (button labels, ARIA where needed)

## Deployment Notes
1. Test on staging environment first
2. Monitor WebSocket connections in production
3. Check chart performance on lower-end devices
4. Verify all environment variables are set

## Rollback Plan
If issues arise:
1. Git revert to previous commit
2. Fallback chart can use static image if WebSocket fails
3. OrderBook can be quickly re-enabled by uncommenting

## Time Estimate
- **Total**: 10-12 hours
- **Critical Path**: Layout + Chart (6-8 hours)
- **Nice to Have**: All UI polish (2-4 hours)

## Success Metrics
- [ ] Chart loads within 2 seconds
- [ ] No console errors
- [ ] All user actions feel responsive
- [ ] Clean, professional appearance matching HyperLiquid style