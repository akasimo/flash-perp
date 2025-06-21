#![no_std]
use soroban_sdk::{
    contract, contractclient, contracterror, contractimpl, contracttype, symbol_short, vec, Address, Env, String, Symbol
};

// Oracle integration
const ORACLE_ID: &str = "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63";

// Constants
const DEC_P: i128 = 1_000_000;                    // price 1e6
const DEC_F: i128 = 1_000_000_000_000_000_000;    // funding 1e18
const KAPPA: i128 = 100_000_000_000;              // 1e-7
const IMR_BP: i128 = 2_000;                       // 20% init margin
const MMR_BP: i128 = 1_000;                       // 10% maint margin
const BONUS_BP: i128 = 200;                       // 2% liquidation bonus
const MAX_DRIFT_BP: i128 = 100;                 // ±1% max premium/discount
const FEE_BP: i128 = 5;                         // 0.05% swap fee (placeholder)

// Market-specific parameters --------------------------------------------------
// IMPORTANT: Oracle assets are registered with their base symbol (e.g. "BTC", "XLM" …) in
// the Reflector Oracle.  Our perp symbols append "USD" (e.g. BTCUSD) for display
// purposes, so remember to strip the suffix when mapping to the oracle.

// Skew scale represents the notional size (in base-asset units) that produces
// a 1 bp change in premium/discount. Expressed in the same base‐units used for
// position.size (6-dec fixed-point for XLM, micro-BTC = 1 e-6 BTC, micro-ETH etc.).

fn default_skew_scale(sym: &Symbol) -> i128 {
    if *sym == symbol_short!("XLMUSD") {
        10_000_000_000      // 10 M XLM (size is 1e6 precision → 10 000 000 XLM)
    } else if *sym == symbol_short!("BTCUSD") {
        1_000_000           // 1 BTC expressed in micro-BTC (1e-6 BTC per unit)
    } else if *sym == symbol_short!("ETHUSD") {
        100_000_000         // 100 ETH expressed in micro-ETH (1e-6 ETH per unit)
    } else {
        panic!("Unsupported symbol for skew scale");
    }
}

#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[contracterror]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InsufficientCollateral = 3,
    PositionTooLarge = 4,
    InvalidAmount = 5,
    BelowMaintenanceMargin = 6,
    PositionNotFound = 7,
    Unauthorized = 8,
    Paused = 9,
    OracleUnavailable = 10,
    OracleStale = 11,
    InvalidSymbol = 12,
    ZeroAmount = 13,
    SelfLiquidation = 14,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Reserve {
    pub base: i128,
    pub quote: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FundingData {
    pub rate: i128,
    pub last_update: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Position {
    pub size: i128,
    pub notional: i128,
    pub margin: i128,
    pub funding_index: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Paused,
    Reserves(Symbol),
    Funding(Symbol),
    Collateral(Address),
    Position(Address, Symbol),
    NetOi(Symbol),       // net open interest (longs – shorts)
    SkewScale(Symbol),   // scale used to normalise skew per market
}

// Oracle types
#[contracttype]
pub enum Asset {
    Other(Symbol),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceData {
    pub price: i128,
    pub timestamp: u64,
}

// ---------- Oracle integration ----------

#[contractclient(name = "Oracle")]
#[allow(dead_code)]
trait OracleIfc {
    fn lastprice(asset: Asset) -> Option<PriceData>;
}

fn fetch_oracle_price(env: &Env, sym: Symbol) -> Result<i128, Error> {
    let oracle_address = Address::from_string(&String::from_str(env, ORACLE_ID));
    let oracle = Oracle::new(env, &oracle_address);
    let pd = oracle.lastprice(&Asset::Other(sym))
        .ok_or(Error::OracleUnavailable)?;
    if env.ledger().timestamp() - pd.timestamp > 900 {
        return Err(Error::OracleStale);
    }
    Ok(pd.price / 100_000_000) // 14-dec → 6-dec
}

#[contract]
pub struct FlashPerp;

#[contractimpl]
impl FlashPerp {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);

        // Initialize reserves for supported symbols
        let symbols = vec![&env, symbol_short!("XLMUSD"), symbol_short!("BTCUSD"), symbol_short!("ETHUSD")];
        for sym in symbols.iter() {
            let reserve = Reserve {
                base: 1_000_000_000,  // 1000 units
                quote: 1_000_000_000_000,  // 1M USDC
            };
            env.storage().persistent().set(&DataKey::Reserves(sym.clone()), &reserve);
            env.storage().persistent().extend_ttl(&DataKey::Reserves(sym.clone()), 10_000, 10_000);

            let funding = FundingData {
                rate: 0,
                last_update: env.ledger().timestamp(),
            };
            env.storage().persistent().set(&DataKey::Funding(sym.clone()), &funding);
            env.storage().persistent().extend_ttl(&DataKey::Funding(sym.clone()), 10_000, 10_000);

            // --- Parcl-style additions ---
            // Set skew scale (can be tweaked later via admin fn)
            let skew_scale = default_skew_scale(&sym);
            env.storage().persistent().set(&DataKey::SkewScale(sym.clone()), &skew_scale);
            env.storage().persistent().extend_ttl(&DataKey::SkewScale(sym.clone()), 10_000, 10_000);

            // Net OI starts at zero for each market
            env.storage().persistent().set(&DataKey::NetOi(sym.clone()), &0i128);
            env.storage().persistent().extend_ttl(&DataKey::NetOi(sym.clone()), 10_000, 10_000);
        }

        Ok(())
    }

    pub fn deposit_collateral(env: Env, trader: Address, amount: i128) -> Result<(), Error> {
        trader.require_auth();
        
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        Self::check_not_paused(&env)?;

        let current_collateral = Self::get_collateral(&env, &trader);
        let new_collateral = current_collateral + amount;

        env.storage().persistent().set(&DataKey::Collateral(trader.clone()), &new_collateral);
        env.storage().persistent().extend_ttl(&DataKey::Collateral(trader.clone()), 10_000, 10_000);

        env.events().publish((symbol_short!("DEPOSIT"), trader), amount);
        Ok(())
    }

    pub fn withdraw_collateral(env: Env, trader: Address, amount: i128) -> Result<(), Error> {
        trader.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        Self::check_not_paused(&env)?;

        let current_collateral = Self::get_collateral(&env, &trader);
        let free_collateral = Self::calculate_free_collateral(&env, &trader)?;

        if amount > free_collateral {
            return Err(Error::InsufficientCollateral);
        }

        let new_collateral = current_collateral - amount;
        env.storage().persistent().set(&DataKey::Collateral(trader.clone()), &new_collateral);
        env.storage().persistent().extend_ttl(&DataKey::Collateral(trader.clone()), 10_000, 10_000);

        env.events().publish((symbol_short!("WITHDRAW"), trader), amount);
        Ok(())
    }

    pub fn open_position(
        env: Env,
        trader: Address,
        symbol: Symbol,
        size: i128,
        margin: i128,
    ) -> Result<(), Error> {
        trader.require_auth();

        if size == 0 || margin <= 0 {
            return Err(Error::InvalidAmount);
        }

        Self::check_not_paused(&env)?;
        Self::validate_symbol(&symbol)?;

        let mark_price = Self::get_mark_price(&env, &symbol)?;
        let notional = (size.abs() * mark_price) / DEC_P;
        let required_margin = (notional * IMR_BP) / 10_000;

        if margin < required_margin {
            return Err(Error::InsufficientCollateral);
        }

        let free_collateral = Self::calculate_free_collateral(&env, &trader)?;
        if margin > free_collateral {
            return Err(Error::InsufficientCollateral);
        }

        // Update AMM reserves
        Self::update_reserves(&env, &symbol, size)?;

        // --- update net OI ---
        let net_key = DataKey::NetOi(symbol.clone());
        let current_oi = env.storage().persistent().get::<DataKey, i128>(&net_key).unwrap_or(0);
        env.storage().persistent().set(&net_key, &(current_oi + size));
        env.storage().persistent().extend_ttl(&net_key, 10_000, 10_000);

        // Get current funding index
        let funding = Self::get_funding_data(&env, &symbol);

        // Create or update position
        let position_key = DataKey::Position(trader.clone(), symbol.clone());
        let existing = env.storage().persistent().get::<DataKey, Position>(&position_key);

        let new_position = match existing {
            Some(mut pos) => {
                pos.size += size;
                pos.notional += notional;
                pos.margin += margin;
                pos.funding_index = funding.rate;
                pos
            }
            None => Position {
                size,
                notional,
                margin,
                funding_index: funding.rate,
            }
        };

        env.storage().persistent().set(&position_key, &new_position);
        env.storage().persistent().extend_ttl(&position_key, 10_000, 10_000);

        env.events().publish(
            (symbol_short!("OPEN"), trader, symbol),
            (size, margin, mark_price)
        );

        Ok(())
    }

    pub fn close_position(
        env: Env,
        trader: Address,
        symbol: Symbol,
        size: i128,
    ) -> Result<(), Error> {
        trader.require_auth();

        if size == 0 {
            return Err(Error::InvalidAmount);
        }

        Self::check_not_paused(&env)?;

        let position_key = DataKey::Position(trader.clone(), symbol.clone());
        let mut position = env.storage().persistent()
            .get::<DataKey, Position>(&position_key)
            .ok_or(Error::PositionNotFound)?;

        // Check if closing size exceeds position
        if size.abs() > position.size.abs() {
            return Err(Error::InvalidAmount);
        }

        let mark_price = Self::get_mark_price(&env, &symbol)?;
        
        // Calculate PnL for the closing portion
        let closing_notional = (size.abs() * mark_price) / DEC_P;
        let original_notional = (position.notional * size.abs()) / position.size.abs();
        
        let pnl = if (size > 0 && position.size > 0) || (size < 0 && position.size < 0) {
            // Closing position (same direction)
            if position.size > 0 {
                closing_notional - original_notional
            } else {
                original_notional - closing_notional
            }
        } else {
            // Flipping position
            return Err(Error::InvalidAmount);
        };

        // Update AMM reserves
        Self::update_reserves(&env, &symbol, -size)?;

        // --- update net OI ---
        let net_key = DataKey::NetOi(symbol.clone());
        let cur_oi = env.storage().persistent().get::<DataKey, i128>(&net_key).unwrap_or(0);
        env.storage().persistent().set(&net_key, &(cur_oi - size));
        env.storage().persistent().extend_ttl(&net_key, 10_000, 10_000);

        // Calculate funding payment
        let funding = Self::get_funding_data(&env, &symbol);
        let funding_payment = Self::calculate_funding_payment(&position, &funding);

        // Update position
        let margin_released = (position.margin * size.abs()) / position.size.abs();
        position.size -= size;
        position.notional -= original_notional;
        position.margin -= margin_released;

        if position.size == 0 {
            env.storage().persistent().remove(&position_key);
        } else {
            position.funding_index = funding.rate;
            env.storage().persistent().set(&position_key, &position);
            env.storage().persistent().extend_ttl(&position_key, 10_000, 10_000);
        }

        // Update collateral with PnL and funding
        let collateral_key = DataKey::Collateral(trader.clone());
        let current_collateral = Self::get_collateral(&env, &trader);
        let new_collateral = current_collateral + margin_released + pnl - funding_payment;
        env.storage().persistent().set(&collateral_key, &new_collateral);
        env.storage().persistent().extend_ttl(&collateral_key, 10_000, 10_000);

        env.events().publish(
            (symbol_short!("CLOSE"), trader, symbol),
            (size, pnl, funding_payment)
        );

        Ok(())
    }

    pub fn liquidate(
        env: Env,
        liquidator: Address,
        trader: Address,
        symbol: Symbol,
    ) -> Result<(), Error> {
        liquidator.require_auth();

        if liquidator == trader {
            return Err(Error::SelfLiquidation);
        }

        Self::check_not_paused(&env)?;

        let position_key = DataKey::Position(trader.clone(), symbol.clone());
        let position = env.storage().persistent()
            .get::<DataKey, Position>(&position_key)
            .ok_or(Error::PositionNotFound)?;

        let mark_price = Self::get_mark_price(&env, &symbol)?;
        
        // Check if position is liquidatable
        let margin_ratio = Self::calculate_margin_ratio(&position, mark_price);
        if margin_ratio >= MMR_BP {
            return Err(Error::BelowMaintenanceMargin);
        }

        // Calculate liquidation values
        let current_notional = (position.size.abs() * mark_price) / DEC_P;
        let liquidation_bonus = (current_notional * BONUS_BP) / 10_000;

        // Update reserves
        Self::update_reserves(&env, &symbol, -position.size)?;

        // --- update net OI ---
        let net_key = DataKey::NetOi(symbol.clone());
        let cur_oi = env.storage().persistent().get::<DataKey, i128>(&net_key).unwrap_or(0);
        env.storage().persistent().set(&net_key, &(cur_oi - position.size));
        env.storage().persistent().extend_ttl(&net_key, 10_000, 10_000);

        // Remove position
        env.storage().persistent().remove(&position_key);

        // Transfer bonus to liquidator
        let liquidator_collateral = Self::get_collateral(&env, &liquidator);
        env.storage().persistent().set(
            &DataKey::Collateral(liquidator.clone()),
            &(liquidator_collateral + liquidation_bonus)
        );
        env.storage().persistent().extend_ttl(&DataKey::Collateral(liquidator.clone()), 10_000, 10_000);

        env.events().publish(
            (symbol_short!("LIQUIDATE"), trader, symbol),
            (position.size, liquidation_bonus, liquidator)
        );

        Ok(())
    }

    pub fn update_funding(
        env: Env,
        symbol: Symbol,
        oracle_price: i128,
    ) -> Result<(), Error> {
        let admin = Self::get_admin(&env)?;
        admin.require_auth();

        Self::check_not_paused(&env)?;

        let mark_price = Self::get_mark_price(&env, &symbol)?;
        let premium = mark_price - oracle_price;
        let funding_rate = (premium * KAPPA) / oracle_price;

        let mut funding = Self::get_funding_data(&env, &symbol);
        funding.rate += funding_rate;
        funding.last_update = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Funding(symbol.clone()), &funding);
        env.storage().persistent().extend_ttl(&DataKey::Funding(symbol.clone()), 10_000, 10_000);

        env.events().publish(
            (symbol_short!("FUNDING"), symbol),
            (funding_rate, oracle_price, mark_price)
        );

        Ok(())
    }

    // View functions
    pub fn get_position(env: Env, trader: Address, symbol: Symbol) -> Option<Position> {
        let position_key = DataKey::Position(trader, symbol);
        env.storage().persistent().get(&position_key)
    }

    pub fn get_free_collateral(env: Env, trader: Address) -> Result<i128, Error> {
        Self::calculate_free_collateral(&env, &trader)
    }

    pub fn get_mark_price_view(env: Env, symbol: Symbol) -> Result<i128, Error> {
        Self::get_mark_price(&env, &symbol)
    }

    pub fn get_oracle_price(env: Env, symbol: Symbol) -> Result<i128, Error> {
        fetch_oracle_price(&env, symbol)
    }

    // Admin functions
    pub fn pause(env: Env) -> Result<(), Error> {
        let admin = Self::get_admin(&env)?;
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &true);
        env.events().publish((symbol_short!("PAUSE"),), admin);
        Ok(())
    }

    pub fn unpause(env: Env) -> Result<(), Error> {
        let admin = Self::get_admin(&env)?;
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &false);
        env.events().publish((symbol_short!("UNPAUSE"),), admin);
        Ok(())
    }

    // Internal helper functions
    fn get_admin(env: &Env) -> Result<Address, Error> {
        env.storage().instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }

    fn check_not_paused(env: &Env) -> Result<(), Error> {
        let paused: bool = env.storage().instance()
            .get(&DataKey::Paused)
            .unwrap_or(false);
        if paused {
            Err(Error::Paused)
        } else {
            Ok(())
        }
    }

    fn validate_symbol(symbol: &Symbol) -> Result<(), Error> {
        let valid_symbols = [
            symbol_short!("XLMUSD"),
            symbol_short!("BTCUSD"),
            symbol_short!("ETHUSD"),
        ];
        
        if valid_symbols.contains(symbol) {
            Ok(())
        } else {
            Err(Error::InvalidSymbol)
        }
    }

    fn get_collateral(env: &Env, trader: &Address) -> i128 {
        env.storage().persistent()
            .get(&DataKey::Collateral(trader.clone()))
            .unwrap_or(0)
    }

    fn get_reserves(env: &Env, symbol: &Symbol) -> Reserve {
        env.storage().persistent()
            .get(&DataKey::Reserves(symbol.clone()))
            .unwrap_or(Reserve { base: 0, quote: 0 })
    }

    fn get_funding_data(env: &Env, symbol: &Symbol) -> FundingData {
        env.storage().persistent()
            .get(&DataKey::Funding(symbol.clone()))
            .unwrap_or(FundingData { rate: 0, last_update: 0 })
    }

    fn get_mark_price(env: &Env, symbol: &Symbol) -> Result<i128, Error> {
        // Prefer mock price (used in unit tests); if unavailable, fall back to oracle.
        #[cfg(test)]
        let oracle_price = Self::_mock_oracle_price(symbol.clone())?;

        #[cfg(not(test))]
        let oracle_price = fetch_oracle_price(env, symbol.clone())?;

        // 2. Fetch net open interest and skew scale
        let net_oi = env.storage().persistent()
            .get::<DataKey, i128>(&DataKey::NetOi(symbol.clone()))
            .unwrap_or(0);
        let skew_scale = env.storage().persistent()
            .get::<DataKey, i128>(&DataKey::SkewScale(symbol.clone()))
            .unwrap_or(1);

        // Avoid division by zero
        if skew_scale == 0 { return Ok(oracle_price); }

        // 3. Premium / discount in basis points
        let pd_bp = (net_oi * 10_000) / skew_scale; // could exceed bounds
        let adj_bp = pd_bp.max(-MAX_DRIFT_BP).min(MAX_DRIFT_BP);

        // 4. Mark price = oracle * (1 + adj_bp / 10_000)
        Ok((oracle_price * (10_000 + adj_bp)) / 10_000)
    }

    fn update_reserves(env: &Env, symbol: &Symbol, size: i128) -> Result<(), Error> {
        let mut reserve = Self::get_reserves(env, symbol);
        
        let k = reserve.base * reserve.quote;
        reserve.base -= size;
        
        if reserve.base <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        reserve.quote = k / reserve.base;
        
        // Fee charged on trade notional, not entire pool
        let trade_notional = (size.abs() * reserve.quote) / reserve.base;
        let fee = (trade_notional * FEE_BP) / 10_000;
        reserve.quote += fee;
        
        env.storage().persistent().set(&DataKey::Reserves(symbol.clone()), &reserve);
        env.storage().persistent().extend_ttl(&DataKey::Reserves(symbol.clone()), 10_000, 10_000);
        
        Ok(())
    }

    fn calculate_free_collateral(env: &Env, trader: &Address) -> Result<i128, Error> {
        let collateral = Self::get_collateral(env, trader);
        let symbols = vec![&env, symbol_short!("XLMUSD"), symbol_short!("BTCUSD"), symbol_short!("ETHUSD")];
        
        let mut total_margin_used = 0i128;
        
        for symbol in symbols {
            let position_key = DataKey::Position( 
                trader.clone(), 
                symbol.clone() 
            );
            
            if let Some(position) = env.storage().persistent().get::<DataKey, Position>(&position_key) {
                total_margin_used += position.margin;
            }
        }
        
        Ok(collateral - total_margin_used)
    }

    fn calculate_margin_ratio(position: &Position, mark_price: i128) -> i128 {
        let current_notional = (position.size.abs() * mark_price) / DEC_P;
        if current_notional == 0 {
            return 10_000; // 100%
        }
        (position.margin * 10_000) / current_notional
    }

    fn calculate_funding_payment(position: &Position, funding: &FundingData) -> i128 {
        let funding_diff = funding.rate - position.funding_index;
        (position.size * funding_diff) / DEC_F
    }

    // Mock prices for testing - remove when using real oracle
    #[cfg(test)]
    fn _mock_oracle_price(symbol: Symbol) -> Result<i128, Error> {
        match symbol {
            s if s == symbol_short!("XLMUSD") => Ok(100_000), // $0.10
            s if s == symbol_short!("BTCUSD") => Ok(100_000_000_000), // $100,000
            s if s == symbol_short!("ETHUSD") => Ok(4_000_000_000), // $4,000
            _ => Err(Error::InvalidSymbol),
        }
    }

    #[cfg(not(test))]
    fn _mock_oracle_price(_symbol: Symbol) -> Result<i128, Error> {
        Err(Error::OracleUnavailable)
    }

    // ---------------- Permissionless funding keeper ----------------
    pub fn poke_funding(env: Env, symbol: Symbol) -> Result<(), Error> {
        Self::check_not_paused(&env)?;
        Self::validate_symbol(&symbol)?;

        const FUNDING_PERIOD: u64 = 1800; // 30 minutes
        const MAX_FUNDING_VEL_BP: i128 = 1_000; // 10% per day

        let mut funding = Self::get_funding_data(&env, &symbol);
        let now = env.ledger().timestamp();
        if now - funding.last_update < FUNDING_PERIOD {
            return Ok(()); // ignore early calls
        }

        #[cfg(test)]
        let oracle_price = Self::_mock_oracle_price(symbol.clone())?;

        #[cfg(not(test))]
        let oracle_price = fetch_oracle_price(&env, symbol.clone())?;

        let mark_price = Self::get_mark_price(&env, &symbol)?;
        let premium_bp = ((mark_price - oracle_price) * 10_000) / oracle_price;
        // funding velocity proportional to premium, clamped to max drift
        let capped_premium_bp = premium_bp.max(-MAX_DRIFT_BP).min(MAX_DRIFT_BP);
        let delta_rate = capped_premium_bp * MAX_FUNDING_VEL_BP / MAX_DRIFT_BP
            * (now - funding.last_update) as i128 / 86_400; // per-day basis

        funding.rate += delta_rate;
        funding.last_update = now;

        env.storage().persistent().set(&DataKey::Funding(symbol.clone()), &funding);
        env.storage().persistent().extend_ttl(&DataKey::Funding(symbol.clone()), 10_000, 10_000);

        env.events().publish((symbol_short!("FUNDING"), symbol), (delta_rate, oracle_price, mark_price));
        Ok(())
    }
}

// Tests
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialization() {
        let env = Env::default();
        let contract_id = env.register(FlashPerp, ());
        let client = FlashPerpClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let result = client.initialize(&admin);
        assert_eq!(result, ());

        // Test double initialization
        let result2 = client.try_initialize(&admin);
        assert_eq!(result2, Err(Ok(Error::AlreadyInitialized)));
    }

    #[test]
    fn test_deposit_withdraw() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(FlashPerp, ());
        let client = FlashPerpClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let trader = Address::generate(&env);

        let _ = client.initialize(&admin);

        // Deposit
        let _ = client.deposit_collateral(&trader, &1_000_000_000);
        assert_eq!(client.get_free_collateral(&trader), 1_000_000_000);

        // Withdraw
        let _ = client.withdraw_collateral(&trader, &300_000_000);
        assert_eq!(client.get_free_collateral(&trader), 700_000_000);
    }

    #[test]
    fn test_open_close_position() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(FlashPerp, ());
        let client = FlashPerpClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let trader = Address::generate(&env);
        let symbol = symbol_short!("XLMUSD");

        let _ = client.initialize(&admin);
        let _ = client.deposit_collateral(&trader, &10_000_000_000); // 10k USDC

        // Open long position
        let _ = client.open_position(&trader, &symbol, &10_000_000, &2_000_000_000); // 10 XLM, 2k USDC margin

        let position = client.get_position(&trader, &symbol).unwrap();
        assert_eq!(position.size, 10_000_000);
        assert_eq!(position.margin, 2_000_000_000);

        // Close half
        let _ = client.close_position(&trader, &symbol, &5_000_000);

        let position = client.get_position(&trader, &symbol).unwrap();
        assert_eq!(position.size, 5_000_000);
    }
}