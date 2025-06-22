#!/usr/bin/env bash
# Deploy FlashPerp + USDC token to Soroban testnet and push contract IDs to the frontend
# -----------------------------------------------------------------------------
# Prerequisites:
#   • `stellar` CLI installed and logged-in identity (default `ata`)
#   • ENV var ORACLE_ID (Reflector oracle) – defaults to main testnet oracle
# -----------------------------------------------------------------------------
set -euo pipefail

NETWORK="testnet"
IDENTITY=${1:-ata}             # default signer alias
ORACLE_ID=${ORACLE_ID:-"CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63"}
RPC_URL="https://soroban-testnet.stellar.org"

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

echo "📦 Building token & perp contracts …"
stellar contract build -q # root build builds workspace (perp) first
(cd contracts/token && stellar contract build -q)

TOKEN_WASM="target/wasm32v1-none/release/soroban_token_contract.wasm"
PERP_WASM="target/wasm32v1-none/release/flashperp.wasm"

echo "🚀 Deploying USDC token …"
TOKEN_ID=$(stellar contract deploy --wasm "$TOKEN_WASM" --network "$NETWORK" --source "$IDENTITY" --alias usdc \
  -- --admin "$IDENTITY" --decimal 6 --name '"USDC"' --symbol '"USDC"' | tail -n1)

echo "→ Token ID: $TOKEN_ID"

echo "🚀 Deploying FlashPerp …"
PERP_ID=$(stellar contract deploy --wasm "$PERP_WASM" --network "$NETWORK" --source "$IDENTITY" --alias flashperp --ignore-checks | tail -n1)

echo "→ Perp ID: $PERP_ID"

echo "🔧 Initialising FlashPerp with token address …"
stellar contract invoke --id flashperp --network "$NETWORK" --source "$IDENTITY" -- initialize \
  --admin "$IDENTITY" --token_addr usdc >/dev/null

echo "💰 Minting 100k USDC to deployer + approving 10k to FlashPerp …"
stellar contract invoke --id usdc --network "$NETWORK" --source "$IDENTITY" -- mint \
  --to "$IDENTITY" --amount 100000000000 >/dev/null
stellar contract invoke --id usdc --network "$NETWORK" --source "$IDENTITY" -- approve \
  --from "$IDENTITY" --spender flashperp --amount 10000000000 --expiration_ledger 999999 >/dev/null

echo "🏦 Depositing 10k USDC collateral …"
stellar contract invoke --id flashperp --network "$NETWORK" --source "$IDENTITY" -- deposit_collateral \
  --trader "$IDENTITY" --amount 10000000000 >/dev/null || true

# -----------------------------------------------------------------------------
# Write .env.local for Next.js frontend
# -----------------------------------------------------------------------------
ENV_FILE="frontend/.env.local"
cat > "$ENV_FILE" <<EOF
NEXT_PUBLIC_PERP_CONTRACT=$PERP_ID
NEXT_PUBLIC_TOKEN_CONTRACT=$TOKEN_ID
NEXT_PUBLIC_ORACLE_CONTRACT=$ORACLE_ID
EOF

echo "📝 Wrote contract IDs to $ENV_FILE"

echo "✅ Deployment complete. Contracts live on testnet:" 
echo "   • USDC : $TOKEN_ID (alias usdc)" 
echo "   • Perp : $PERP_ID (alias flashperp)" 