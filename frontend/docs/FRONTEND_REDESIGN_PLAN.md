# FlashPerp Frontend Redesign Plan

## Overview
Complete redesign of the FlashPerp frontend to create a professional-grade perpetual trading interface with proper wallet integration and clean separation between marketing and trading functionality.

## Contract Analysis Summary
The updated FlashPerp contract includes:
- **Enhanced pricing model** with skew scales and net open interest tracking
- **Improved funding mechanism** with `poke_funding()` for permissionless updates  
- **Better AMM mechanics** with trade fees
- **Comprehensive position management** with isolated margin
- **Admin functions** for pause/unpause

## Architecture Overview

### Route Structure
```
/ (Landing Page)
├── Hero section with branding and key stats
├── Features overview
├── Supported markets display
├── How it works section
└── Footer with links

/app (Trading Application)
├── Header with wallet connection
├── Account dashboard
├── Trading interface
├── Market data displays
└── Position management
```

## Design System

### Color Palette
```css
:root {
  /* Dark theme for trading app */
  --bg-primary: #0a0a0b;
  --bg-secondary: #1a1a1b; 
  --bg-tertiary: #2d2d30;
  
  /* Accent colors */
  --accent-green: #00d4aa;    /* Long positions */
  --accent-red: #ff5353;      /* Short positions */
  --accent-blue: #2563eb;     /* Primary actions */
  --accent-purple: #8b5cf6;   /* Highlights */
  
  /* Text colors */
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  
  /* Landing page - lighter theme */
  --landing-bg: #fafafa;
  --landing-card: #ffffff;
  --landing-accent: #2563eb;
}
```

### Typography
- **Headings:** Inter font family, bold weights
- **Body text:** Inter font family, regular/medium weights
- **Monospace:** JetBrains Mono for addresses and numbers

## File Structure Plan

```
frontend/
├── app/
│   ├── (landing)/
│   │   ├── page.tsx                 # Landing page
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx  
│   │   │   ├── Markets.tsx
│   │   │   └── HowItWorks.tsx
│   │   └── layout.tsx               # Landing layout
│   ├── app/
│   │   ├── page.tsx                 # Trading app main
│   │   ├── positions/page.tsx       # Detailed positions
│   │   ├── history/page.tsx         # Transaction history
│   │   ├── components/
│   │   │   ├── TradingInterface/
│   │   │   │   ├── MarketSelector.tsx
│   │   │   │   ├── OrderPanel.tsx
│   │   │   │   ├── PositionTable.tsx
│   │   │   │   └── PriceChart.tsx
│   │   │   ├── Portfolio/
│   │   │   │   ├── AccountSummary.tsx
│   │   │   │   ├── CollateralManager.tsx
│   │   │   │   └── PnLBreakdown.tsx
│   │   │   └── Modals/
│   │   │       ├── DepositModal.tsx
│   │   │       ├── WithdrawModal.tsx
│   │   │       └── SettingsModal.tsx
│   │   └── layout.tsx               # App layout with wallet
│   ├── globals.css
│   └── layout.tsx                   # Root layout
├── components/
│   ├── wallet/
│   │   ├── WalletButton.tsx
│   │   ├── WalletModal.tsx
│   │   └── NetworkBadge.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── LoadingSpinner.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── wallet/
│   │   ├── freighter.ts            # Freighter integration
│   │   ├── manager.ts              # Wallet state management
│   │   └── types.ts                # Wallet type definitions
│   ├── stellar/
│   │   ├── client.ts               # Smart contract client
│   │   ├── server.ts               # Horizon server config
│   │   └── utils.ts                # Stellar utilities
│   ├── hooks/
│   │   ├── useWallet.ts            # Wallet state hook
│   │   ├── useContract.ts          # Contract interaction hook
│   │   ├── useMarketData.ts        # Market data fetching
│   │   └── usePositions.ts         # Position management
│   └── utils/
│       ├── formatting.ts           # Number/currency formatting
│       ├── calculations.ts         # PnL/margin calculations
│       └── constants.ts            # App constants
├── types/
│   ├── contract.ts                 # Smart contract types
│   ├── market.ts                   # Market data types
│   └── wallet.ts                   # Wallet types
└── styles/
    ├── components.css              # Component-specific styles
    └── trading.css                 # Trading interface styles
```

## Freighter Wallet Integration

### Core Wallet Functions
```typescript
interface WalletManager {
  // Connection management
  connect(): Promise<string | null>
  disconnect(): void
  isConnected(): boolean
  getAddress(): string | null
  
  // Transaction signing
  signTransaction(xdr: string): Promise<string>
  
  // Network management
  getNetwork(): 'testnet' | 'mainnet'
  switchNetwork(network: string): Promise<void>
  
  // Event handling
  onAccountChange(callback: (address: string) => void): void
  onNetworkChange(callback: (network: string) => void): void
}
```

### Integration Steps
1. **Detection & Installation Check**
2. **Connection Flow** with network validation
3. **Transaction Submission** with proper error handling
4. **State Management** with React Context

## State Management Strategy

### Context Providers
- **WalletContext:** Connection state, address, network
- **ContractContext:** Smart contract client instance
- **MarketContext:** Selected market, prices, funding rates

### Data Fetching
- **SWR/TanStack Query** for server state
- **Polling intervals:** Prices (5s), Positions (10s), Funding (30s)
- **Optimistic updates** for better UX

## Security Considerations

1. **Input Validation**
   - Sanitize all numeric inputs
   - Validate market symbols against whitelist
   - Check transaction amounts against reasonable limits

2. **Transaction Safety**
   - Display clear transaction previews
   - Show gas estimates and fees
   - Implement transaction timeouts

3. **Error Handling**
   - Network disconnection recovery
   - Failed transaction retry logic
   - Clear error messages for users

## Responsive Design

### Breakpoints
- **Mobile:** 320px - 768px (vertical stack)
- **Tablet:** 768px - 1024px (simplified interface)  
- **Desktop:** 1024px+ (full feature set)

### Mobile Optimizations
- Collapsible sidebar navigation
- Swipeable trading panels
- Touch-friendly button sizes
- Bottom sheet modals

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up routing structure (landing vs app)
2. Implement Freighter wallet integration
3. Create wallet context and hooks
4. Build basic UI components

### Phase 2: Trading Interface
1. Market selector and price display
2. Order entry and position management
3. Contract client integration
4. Transaction submission flow

### Phase 3: Polish & Features
1. Landing page design and content
2. Advanced portfolio features
3. Mobile responsive optimization
4. Error handling and loading states

### Phase 4: Testing & Deployment
1. Comprehensive testing suite
2. Performance optimization
3. Security audit
4. Production deployment setup

## Key Features

### Landing Page
- Clean, professional design
- Key statistics display
- Feature highlights
- Clear call-to-action

### Trading App
- Real-time price feeds
- Intuitive order placement
- Position management
- Portfolio overview
- Transaction history

## Technical Requirements

### Dependencies
- Next.js 14+ with App Router
- React 18+
- TypeScript
- Tailwind CSS
- Stellar SDK
- SWR or TanStack Query
- Framer Motion (animations)

### Environment Variables
```env
NEXT_PUBLIC_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_PERP_CONTRACT=CONTRACT_ADDRESS
NEXT_PUBLIC_ORACLE_CONTRACT=ORACLE_ADDRESS
```

## Success Metrics

1. **User Experience**
   - Wallet connection success rate > 95%
   - Transaction completion rate > 90%
   - Page load times < 2s

2. **Technical Performance**
   - Responsive design on all devices
   - Error rate < 1%
   - Uptime > 99.9%

3. **Business Metrics**
   - User engagement time
   - Position opening frequency
   - Feature adoption rates

---

This plan provides a comprehensive roadmap for building a professional-grade perpetual trading interface that meets the needs of both newcomers and experienced traders while maintaining security and performance standards.