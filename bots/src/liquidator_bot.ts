import { Keypair, Networks, Operation, TransactionBuilder, StrKey, xdr, scValToNative, nativeToScVal, Contract } from '@stellar/stellar-sdk';
import { SorobanRpc } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

interface Position {
  size: bigint;
  notional: bigint;
  margin: bigint;
  funding_index: bigint;
}

interface EventData {
  trader: string;
  symbol: string;
  size?: bigint;
  margin?: bigint;
}

class LiquidatorBot {
  private server: SorobanRpc.Server;
  private keypair: Keypair;
  private perpContract: string;
  private oracleContract: string;
  private symbols: string[] = ['XLMUSD', 'BTCUSD', 'ETHUSD'];
  private lastCheckedLedger: number = 0;
  private MMR_BP = 1000n; // 10% maintenance margin

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
    this.server = new SorobanRpc.Server(rpcUrl);
    
    if (!process.env.LIQUIDATOR_SECRET_KEY) {
      throw new Error('LIQUIDATOR_SECRET_KEY environment variable is required');
    }
    this.keypair = Keypair.fromSecret(process.env.LIQUIDATOR_SECRET_KEY);
    
    this.perpContract = process.env.PERP_CONTRACT || '';
    this.oracleContract = process.env.ORACLE_CONTRACT || 'CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63';
    
    if (!this.perpContract) {
      throw new Error('PERP_CONTRACT environment variable is required');
    }
  }

  async getPosition(trader: string, symbol: string): Promise<Position | null> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());
      
      const contract = new Contract(this.perpContract);
      const operation = contract.call(
        'get_position',
        nativeToScVal(trader, { type: 'address' }),
        nativeToScVal(symbol, { type: 'symbol' })
      );

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simResult = await this.server.simulateTransaction(transaction);
      
      if ('error' in simResult || !simResult.result?.retval) {
        return null;
      }

      const result = scValToNative(simResult.result.retval);
      if (result && typeof result === 'object') {
        return {
          size: BigInt(result.size || 0),
          notional: BigInt(result.notional || 0),
          margin: BigInt(result.margin || 0),
          funding_index: BigInt(result.funding_index || 0)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching position for ${trader}/${symbol}:`, error);
      return null;
    }
  }

  async getMarkPrice(symbol: string): Promise<bigint | null> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());
      
      const contract = new Contract(this.perpContract);
      const operation = contract.call(
        'get_mark_price_view',
        nativeToScVal(symbol, { type: 'symbol' })
      );

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simResult = await this.server.simulateTransaction(transaction);
      
      if ('error' in simResult || !simResult.result?.retval) {
        return null;
      }

      const result = scValToNative(simResult.result.retval);
      return result ? BigInt(result) : null;
    } catch (error) {
      console.error(`Error fetching mark price for ${symbol}:`, error);
      return null;
    }
  }

  calculateMarginRatio(position: Position, markPrice: bigint): bigint {
    const currentNotional = (position.size * markPrice) / 1_000_000n; // DEC_P
    if (currentNotional === 0n) {
      return 10_000n; // 100%
    }
    return (position.margin * 10_000n) / currentNotional;
  }

  async liquidatePosition(trader: string, symbol: string): Promise<boolean> {
    try {
      const account = await this.server.getAccount(this.keypair.publicKey());
      
      const contract = new Contract(this.perpContract);
      const operation = contract.call(
        'liquidate',
        nativeToScVal(this.keypair.publicKey(), { type: 'address' }),
        nativeToScVal(trader, { type: 'address' }),
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
        console.error(`Liquidation simulation error for ${trader}/${symbol}:`, simResult.error);
        return false;
      }

      // Prepare and submit transaction
      const preparedTx = await this.server.prepareTransaction(transaction);
      preparedTx.sign(this.keypair);
      
      const submitResult = await this.server.sendTransaction(preparedTx);
      console.log(`Liquidation submitted for ${trader}/${symbol}:`, submitResult.id);
      
      // Wait for confirmation
      const finalResult = await this.server.getTransaction(submitResult.id);
      
      return finalResult.status === 'SUCCESS';
    } catch (error) {
      console.error(`Error liquidating position ${trader}/${symbol}:`, error);
      return false;
    }
  }

  async checkPositionHealth(trader: string, symbol: string): Promise<void> {
    const position = await this.getPosition(trader, symbol);
    if (!position || position.size === 0n) {
      return;
    }

    const markPrice = await this.getMarkPrice(symbol);
    if (!markPrice) {
      console.warn(`Could not fetch mark price for ${symbol}`);
      return;
    }

    const marginRatio = this.calculateMarginRatio(position, markPrice);
    console.log(`Position ${trader}/${symbol} - Margin ratio: ${marginRatio}/10000`);

    if (marginRatio < this.MMR_BP) {
      console.log(`⚠️ Position ${trader}/${symbol} is below maintenance margin!`);
      
      const success = await this.liquidatePosition(trader, symbol);
      if (success) {
        console.log(`✓ Successfully liquidated position ${trader}/${symbol}`);
      } else {
        console.error(`✗ Failed to liquidate position ${trader}/${symbol}`);
      }
    }
  }

  async scanEvents(): Promise<void> {
    try {
      // Get current ledger
      const ledgerInfo = await this.server.getLatestLedger();
      const currentLedger = ledgerInfo.sequence;
      
      if (this.lastCheckedLedger === 0) {
        this.lastCheckedLedger = currentLedger - 100; // Start from 100 ledgers ago
      }

      // Query events
      const events = await this.server.getEvents({
        startLedger: this.lastCheckedLedger,
        filters: [
          {
            type: 'contract',
            contractIds: [this.perpContract],
            topics: [['PositionUpdated', 'OPEN', 'CLOSE'].map(t => xdr.ScVal.scvSymbol(t).toXDR('base64'))],
          },
        ],
      });

      for (const event of events.events) {
        try {
          const eventData = this.parseEvent(event);
          if (eventData?.trader && eventData?.symbol) {
            console.log(`Checking position after event: ${eventData.trader}/${eventData.symbol}`);
            await this.checkPositionHealth(eventData.trader, eventData.symbol);
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      }

      this.lastCheckedLedger = currentLedger;
    } catch (error) {
      console.error('Error scanning events:', error);
    }
  }

  parseEvent(event: any): EventData | null {
    try {
      // Parse event topics and data
      const topic = event.topic[0] ? scValToNative(xdr.ScVal.fromXDR(event.topic[0], 'base64')) : null;
      
      if (topic === 'PositionUpdated' || topic === 'OPEN' || topic === 'CLOSE') {
        const trader = event.topic[1] ? scValToNative(xdr.ScVal.fromXDR(event.topic[1], 'base64')) : null;
        const symbol = event.topic[2] ? scValToNative(xdr.ScVal.fromXDR(event.topic[2], 'base64')) : null;
        
        return {
          trader: trader as string,
          symbol: symbol as string,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing event:', error);
      return null;
    }
  }

  async scanAllPositions(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Scanning all positions...`);
    
    // In production, you would query all active traders from events or maintain a registry
    // For now, we'll scan known test addresses from environment
    const testTraders = process.env.TEST_TRADERS?.split(',') || [];
    
    for (const trader of testTraders) {
      for (const symbol of this.symbols) {
        await this.checkPositionHealth(trader, symbol);
      }
    }
  }

  async start(): Promise<void> {
    console.log('Starting FlashPerp liquidator bot...');
    console.log(`Perp contract: ${this.perpContract}`);
    console.log(`Liquidator address: ${this.keypair.publicKey()}`);
    
    // Run initial scan
    await this.scanAllPositions();
    
    // Schedule periodic scans
    setInterval(() => this.scanEvents(), 10 * 1000); // Check events every 10 seconds
    setInterval(() => this.scanAllPositions(), 60 * 1000); // Full scan every minute
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down liquidator bot...');
  process.exit(0);
});

// Start the bot
const bot = new LiquidatorBot();
bot.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});