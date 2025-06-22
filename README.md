# FlashPerp

_Perpetual futures exchange on Stellar Soroban_

FlashPerp is a full-stack demo showing how to build a perpetual-swap DEX on Soroban test-net.  It consists of:

* **`contracts/`** – Rust smart-contracts (perp engine & ERC-20-style token)
* **`frontend/`** – Next.js 14 trading UI (React + Tailwind)
* **`bots/`** – Node/TypeScript off-chain keepers (funding & liquidations)
* **`scripts/`** – One-shot deployment helper

---
## Quick start
```bash
# 1. clone & install
pnpm i  # or npm ci

# 2. deploy everything to test-net (uses identity alias 'ata')
chmod +x scripts/deploy_all.sh
./scripts/deploy_all.sh        # builds, deploys, mints, writes frontend/.env.local

# 3. run the web app
cd frontend && pnpm dev        # reads contract IDs from .env.local
```
The script prints the contract IDs and writes them to `frontend/.env.local`:
```
NEXT_PUBLIC_PERP_CONTRACT=CD…
NEXT_PUBLIC_TOKEN_CONTRACT=CD…
NEXT_PUBLIC_ORACLE_CONTRACT=CCYOZJ…
```
Restart the dev server after every redeploy.

---
## Typical dev workflow
| Step | Command |
|------|---------|
| Build / unit-test contracts | `cargo test -p flashperp` |
| Build WASM only             | `stellar contract build` |
| Redeploy to test-net        | `./scripts/deploy_all.sh` |
| Front-end dev server        | `pnpm dev` inside `frontend/` |
| Funding keeper              | `pnpm ts-node bots/src/funding_bot.ts` |
| Liquidator bot              | `pnpm ts-node bots/src/liquidator_bot.ts` |

---
## Documentation
* `docs/frontend_integration.md` – exhaustive guide for wiring UI to chain.
* `contracts/perp/src/lib.rs`   – main contract source & inline docs.

---
## Requirements
* **Rust 1.80+** with `wasm32v1-unknown-unknown` target
* **Node 18+ & pnpm** (or npm)
* **stellar-cli** (`cargo install -f stellar`) logged-in identity alias `ata`

---
_Star it if you find it useful.  PRs welcome!_