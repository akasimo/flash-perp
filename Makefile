# FlashPerp Makefile

.PHONY: help install build deploy demo clean dev
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "FlashPerp - Perpetual Exchange on Stellar Soroban"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "Installing bot dependencies..."
	cd bots && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

build: ## Build the smart contract
	@echo "Building FlashPerp contract..."
	cargo build --release --target wasm32-unknown-unknown

test: ## Run contract tests
	@echo "Running contract tests..."
	cargo test

deploy: build ## Deploy contract to testnet
	@echo "Deploying to testnet..."
	./scripts/deploy.sh

demo: ## Run demo flow
	@echo "Running demo..."
	./scripts/demo_flow.sh

# Development commands
dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

dev-bots: ## Start bots (in background)
	cd bots && npm run funding &
	cd bots && npm run liquidator &

# Utility commands
clean: ## Clean build artifacts
	cargo clean
	rm -rf bots/node_modules bots/package-lock.json
	rm -rf frontend/node_modules frontend/package-lock.json frontend/.next

format: ## Format Rust code
	cargo fmt

lint: ## Lint Rust code
	cargo clippy

check: ## Check Rust code
	cargo check