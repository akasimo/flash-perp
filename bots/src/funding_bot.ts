import { Keypair, Networks, TransactionBuilder, xdr, scValToNative, nativeToScVal, Contract } from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

interface OraclePriceData {
  price: bigint;
  timestamp: bigint;
}

class FundingBot {
  private server: rpc.Server;
  private keypair: Keypair;
  private perpContract: string;
  private oracleContract: string;
  private symbols: string[] = ['XLM', 'BTC', 'ETH'];

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
    this.server = new rpc.Server(rpcUrl);
    
    if (!process.env.SECRET_KEY) {
      throw new Error('SECRET_KEY environment variable is required');
    }
    this.keypair = Keypair.fromSecret(process.env.SECRET_KEY);
    
    this.perpContract = process.env.PERP_CONTRACT || '';
    this.oracleContract = process.env.ORACLE_CONTRACT || 'CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63';
    
    if (!this.perpContract) {
      throw new Error('PERP_CONTRACT environment variable is required');
    }
  }

  async fetchOraclePrice(symbol: string): Promise<OraclePriceData | null> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());
      
      // Build transaction to call oracle lastprice
      const contract = new Contract(this.oracleContract);
      
      // Build Asset::Other(Symbol) argument
      const assetArg = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Other'),
        xdr.ScVal.scvSymbol(symbol) // base symbol, e.g., "XLM"
      ]);

      const operation = contract.call('lastprice', assetArg);

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      // Simulate to get the result
      const simResult = await this.server.simulateTransaction(transaction);
      
      if ('error' in simResult) {
        console.error(`Oracle simulation error for ${symbol}:`, simResult.error);
        return null;
      }

      if (simResult.result?.retval) {
        const result = scValToNative(simResult.result.retval) as any;
        if (result && 'price' in result && 'timestamp' in result) {
          // Fetch decimals once
          const decOp = contract.call('decimals');
          const decTx = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.TESTNET })
            .addOperation(decOp)
            .setTimeout(30)
            .build();
          const decSim: any = await this.server.simulateTransaction(decTx);
          const decimals = Number(scValToNative(decSim.result?.retval) ?? 14);
          const divisor = 10n ** BigInt(decimals - 6);
          return {
            price: BigInt(result.price) / divisor,
            timestamp: BigInt(result.timestamp)
          } as OraclePriceData;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching oracle price for ${symbol}:`, error);
      return null;
    }
  }

  async updateFunding(symbol: string, oraclePrice: bigint): Promise<boolean> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());
      
      // Build transaction to update funding
      const contract = new Contract(this.perpContract);
      const operation = contract.call(
        'poke_funding',
        nativeToScVal(symbol, { type: 'symbol' })
      );

      let transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      // Simulate transaction
      const simResult = await this.server.simulateTransaction(transaction);
      
      if ('error' in simResult) {
        console.error(`Funding update simulation error for ${symbol}:`, simResult.error);
        return false;
      }

      // Prepare transaction with simulation results
      const preparedTx = await this.server.prepareTransaction(transaction);
      preparedTx.sign(this.keypair);
      
      // Submit transaction
      const submitResult = await this.server.sendTransaction(preparedTx);
      console.log(`Funding poke submitted for ${symbol}:`, submitResult.hash);
      
      // Wait for confirmation
      const finalResult = await this.server.getTransaction(submitResult.hash);
      
      return finalResult.status === 'SUCCESS';
    } catch (error) {
      console.error(`Error updating funding for ${symbol}:`, error);
      return false;
    }
  }

  async tick(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Running funding update...`);
    
    for (const symbol of this.symbols) {
      try {
        // Fetch oracle price
        const priceData = await this.fetchOraclePrice(symbol);
        
        if (!priceData) {
          console.warn(`No oracle price available for ${symbol}`);
          continue;
        }

        // Check staleness (15 minutes)
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (now - priceData.timestamp > 900n) {
          console.warn(`Oracle price for ${symbol} is stale`);
          continue;
        }

        // Convert from 14 decimals to 6 decimals
        const price6Decimals = priceData.price; // already scaled
        
        console.log(`${symbol} oracle price: ${price6Decimals.toString()} (1e6)`);
        
        // Update funding rate
        const success = await this.updateFunding(symbol, price6Decimals);
        
        if (success) {
          console.log(`✓ Funding poked for ${symbol}`);
        } else {
          console.error(`✗ Failed to update funding for ${symbol}`);
        }
        
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
      }
    }
  }

  async start(): Promise<void> {
    console.log('Starting FlashPerp funding bot...');
    console.log(`Oracle contract: ${this.oracleContract}`);
    console.log(`Perp contract: ${this.perpContract}`);
    console.log(`Update interval: 1 hour`);
    
    // Run immediately
    await this.tick();
    
    // Schedule hourly updates
    setInterval(() => this.tick(), 3600 * 1000); // 1 hour
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down funding bot...');
  process.exit(0);
});

// Start the bot
const bot = new FundingBot();
bot.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});