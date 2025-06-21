import { Keypair, Networks, TransactionBuilder, Contract, SorobanRpc, scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

export class FlashPerpClient {
  private server: SorobanRpc.Server;
  private contractId: string;
  private networkPassphrase: string;

  constructor(contractId: string, rpcUrl: string = 'https://soroban-testnet.stellar.org') {
    this.server = new SorobanRpc.Server(rpcUrl);
    this.contractId = contractId;
    this.networkPassphrase = Networks.TESTNET;
  }

  async connectWallet(): Promise<string | null> {
    const connected = await isConnected();
    if (!connected) {
      alert('Please install Freighter wallet extension');
      return null;
    }

    try {
      const publicKey = await getPublicKey();
      return publicKey;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async getCollateral(address: string): Promise<bigint> {
    try {
      const account = await this.server.getAccount(address);
      const contract = new Contract(this.contractId);
      const operation = contract.call(
        'get_free_collateral',
        nativeToScVal(address, { type: 'address' })
      );

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simResult = await this.server.simulateTransaction(transaction);
      
      if ('error' in simResult || !simResult.result?.retval) {
        return 0n;
      }

      const result = scValToNative(simResult.result.retval);
      return BigInt(result || 0);
    } catch (error) {
      console.error('Error fetching collateral:', error);
      return 0n;
    }
  }

  async depositCollateral(amount: bigint): Promise<boolean> {
    try {
      const publicKey = await getPublicKey();
      const account = await this.server.getAccount(publicKey);
      
      const contract = new Contract(this.contractId);
      const operation = contract.call(
        'deposit_collateral',
        nativeToScVal(publicKey, { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' })
      );

      let transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      // Simulate and prepare
      const preparedTx = await this.server.prepareTransaction(transaction);
      const signedXDR = await signTransaction(preparedTx.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const signedTx = TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
      const result = await this.server.sendTransaction(signedTx);
      
      // Wait for confirmation
      const hash = result.id;
      let status = result.status;
      
      while (status === 'PENDING') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const txResult = await this.server.getTransaction(hash);
        status = txResult.status;
      }

      return status === 'SUCCESS';
    } catch (error) {
      console.error('Error depositing collateral:', error);
      return false;
    }
  }

  async openPosition(symbol: string, size: bigint, margin: bigint): Promise<boolean> {
    try {
      const publicKey = await getPublicKey();
      const account = await this.server.getAccount(publicKey);
      
      const contract = new Contract(this.contractId);
      const operation = contract.call(
        'open_position',
        nativeToScVal(publicKey, { type: 'address' }),
        nativeToScVal(symbol, { type: 'symbol' }),
        nativeToScVal(size, { type: 'i128' }),
        nativeToScVal(margin, { type: 'i128' })
      );

      let transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      // Simulate and prepare
      const preparedTx = await this.server.prepareTransaction(transaction);
      const signedXDR = await signTransaction(preparedTx.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const signedTx = TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
      const result = await this.server.sendTransaction(signedTx);
      
      return result.status === 'SUCCESS';
    } catch (error) {
      console.error('Error opening position:', error);
      return false;
    }
  }

  async getMarkPrice(symbol: string): Promise<bigint> {
    try {
      // Use a dummy account for read-only operations
      const dummyKeypair = Keypair.random();
      const account = await this.server.getAccount(dummyKeypair.publicKey()).catch(() => ({
        accountId: dummyKeypair.publicKey(),
        sequence: '0',
      }));
      
      const contract = new Contract(this.contractId);
      const operation = contract.call(
        'get_mark_price_view',
        nativeToScVal(symbol, { type: 'symbol' })
      );

      const transaction = new TransactionBuilder(account as any, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simResult = await this.server.simulateTransaction(transaction);
      
      if ('error' in simResult || !simResult.result?.retval) {
        return 0n;
      }

      const result = scValToNative(simResult.result.retval);
      return BigInt(result || 0);
    } catch (error) {
      console.error('Error fetching mark price:', error);
      return 0n;
    }
  }
}