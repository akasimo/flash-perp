# FlashPerp - Perpetual Exchange on Stellar Soroban

A simple perpetual swap exchange built on Stellar Soroban for weekend hackathon.

## Features
- **Isolated Margin Trading**: Each position has independent margin
- **5x Leverage**: Maximum leverage with proper risk management  
- **AMM Pricing**: Constant product (x*y=k) price discovery
- **Auto-liquidation**: Positions below 10% margin are liquidated
- **Hourly Funding**: Rates updated from oracle prices
- **Multi-asset**: Support for XLM, BTC, ETH perpetuals

## Quick Start

### Prerequisites
- Rust with `wasm32-unknown-unknown` target
- Stellar CLI
- Node.js 18+ (for bots and frontend)
- Make (optional, for convenience)

### Installation
```bash
# Install all dependencies
make install

# Or manually:
cd bots && npm install
cd frontend && npm install
```

### Deploy to Testnet
```bash
make deploy
# Or: ./scripts/deploy.sh
```

### Start Development
```bash
# Start frontend
make dev-frontend

# Start bots (in another terminal)  
make dev-bots

# Run demo
make demo
```

## Project Structure

```
flashperp/
├── contracts/perp/          # Soroban smart contract (Rust)
├── bots/                    # Trading bots (TypeScript)
│   ├── src/
│   │   ├── funding_bot.ts   # Hourly funding updates
│   │   └── liquidator_bot.ts # Position liquidations
│   └── package.json
├── frontend/                # Trading interface (Next.js)
│   ├── app/                 # Next.js 14 app router
│   ├── components/          # React components
│   └── package.json
├── scripts/                 # Deployment & demo scripts
├── docs/                    # Documentation
└── Makefile                 # Build orchestration
```

## Configuration

1. **Deploy contract** to get contract ID
2. **Update environment files**:
   ```bash
   # Root .env (for bots)
   SECRET_KEY=<admin_secret>
   LIQUIDATOR_SECRET_KEY=<liquidator_secret>
   PERP_CONTRACT=<contract_id>
   
   # frontend/.env.local  
   NEXT_PUBLIC_PERP_CONTRACT=<contract_id>
   ```

## Development Commands

```bash
make help           # Show all commands
make build          # Build smart contract
make test           # Run contract tests  
make deploy         # Deploy to testnet
make demo           # Run demo flow
make dev-frontend   # Start frontend dev server
make dev-bots       # Start funding + liquidator bots
make clean          # Clean all build artifacts
```

## Architecture

- **Smart Contract**: Handles positions, margin, liquidations
- **Funding Bot**: Updates hourly funding rates from oracle
- **Liquidator Bot**: Monitors and liquidates underwater positions  
- **Frontend**: Web interface for trading with Freighter wallet

## Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [Development Journal](journal.md) - Development progress
- [Design Doc](docs/perp_design.md) - Technical specifications