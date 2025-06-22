// Core Soroban client for contract interactions

import {
  Contract,
  Keypair,
  rpc,
  scValToNative,
  nativeToScVal,
  Networks,
  TransactionBuilder,
  xdr,
  Address,
} from '@stellar/stellar-sdk';
import { NETWORK, DECIMALS, SCALING_FACTORS } from '@/lib/constants/contracts';
import { handleContractError, handleNetworkError } from './error-handler';
import { ContractCallParams } from './types';

// Initialize RPC client
const RPC = new rpc.Server(NETWORK.RPC_URL);

// Cache for temporary accounts
let tempAccount: { keypair: Keypair; account: any } | null = null;

/**
 * Get or create a temporary account for read-only operations
 */
async function getTempAccount() {
  if (!tempAccount) {
    const keypair = Keypair.random();
    try {
      // Request airdrop for temp account
      await RPC.requestAirdrop(keypair.publicKey());
      const account = await RPC.getAccount(keypair.publicKey());
      tempAccount = { keypair, account };
    } catch (error) {
      console.warn('Failed to create temp account, using random keypair:', error);
      // Fallback: use random account (some read operations might work)
      const account = await RPC.getAccount(keypair.publicKey()).catch(() => ({
        accountId: () => keypair.publicKey(),
        sequenceNumber: () => '0',
        incrementSequenceNumber: () => {},
      }));
      tempAccount = { keypair, account };
    }
  }
  return tempAccount;
}

/**
 * Call a read-only contract method (simulation)
 */
export async function callView<T = any>(
  contractId: string,
  method: string,
  ...args: any[]
): Promise<T> {
  try {
    const { keypair, account } = await getTempAccount();
    
    // Convert arguments to ScVal
    const scArgs = args.map(arg => {
      // If caller already provided a raw ScVal, pass through untouched
      if (arg && typeof arg === 'object' && 'switch' in arg && typeof (arg as any).toXDR === 'function') {
        // rudimentary duck-typing for xdr.ScVal instances
        return arg as any;
      }

      if (typeof arg === 'string' && arg.startsWith('G')) {
        // Address
        return nativeToScVal(arg, { type: 'address' });
      } else if (typeof arg === 'string') {
        // Symbol
        return nativeToScVal(arg, { type: 'symbol' });
      } else if (typeof arg === 'bigint') {
        // BigInt
        return nativeToScVal(arg, { type: 'i128' });
      } else if (typeof arg === 'number') {
        // Convert number to i128 bigint
        return nativeToScVal(BigInt(arg), { type: 'i128' });
      } else {
        // Fallback native conversion
        return nativeToScVal(arg);
      }
    });

    const contract = new Contract(contractId);
    const operation = contract.call(method, ...scArgs);
    
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: NETWORK.PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await RPC.simulateTransaction(transaction);
    
    if ('error' in simulation) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }
    
    if (!simulation.result?.retval) {
      throw new Error('No return value from simulation');
    }

    return scValToNative(simulation.result.retval);
  } catch (error) {
    console.error(`Error calling ${contractId}.${method}:`, error);
    throw new Error(handleContractError(error));
  }
}

/**
 * Build a transaction for contract calls
 */
export async function buildTransaction(
  sourceAccount: string,
  operations: any[]
): Promise<string> {
  try {
    const account = await RPC.getAccount(sourceAccount);
    
    const transaction = new TransactionBuilder(account, {
      fee: '200', // Higher fee for write operations
      networkPassphrase: NETWORK.PASSPHRASE,
    });
    
    operations.forEach(op => transaction.addOperation(op));
    
    const built = transaction.setTimeout(60).build();
    return built.toXDR();
  } catch (error) {
    console.error('Error building transaction:', error);
    throw new Error(handleNetworkError(error));
  }
}

/**
 * Submit a signed transaction
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  try {
    const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK.PASSPHRASE);
    const result = await RPC.sendTransaction(transaction);
    
    if (result.status === 'ERROR') {
      throw new Error(`Transaction failed: ${result.errorResult}`);
    }
    
    return result.hash;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw new Error(handleNetworkError(error));
  }
}

/**
 * Scale price values between different decimal places
 */
export function scalePrice(
  value: bigint,
  fromDecimals: number,
  toDecimals: number
): bigint {
  if (fromDecimals === toDecimals) {
    return value;
  }
  
  if (fromDecimals > toDecimals) {
    const divisor = 10n ** BigInt(fromDecimals - toDecimals);
    return value / divisor;
  } else {
    const multiplier = 10n ** BigInt(toDecimals - fromDecimals);
    return value * multiplier;
  }
}

/**
 * Convert raw token amount to display number
 */
export function formatTokenAmount(amount: bigint, decimals = DECIMALS.TOKEN): number {
  const divisor = 10n ** BigInt(decimals);
  return Number(amount) / Number(divisor);
}

/**
 * Convert display number to raw token amount
 */
export function parseTokenAmount(amount: number, decimals = DECIMALS.TOKEN): bigint {
  const multiplier = 10n ** BigInt(decimals);
  return BigInt(Math.floor(amount * Number(multiplier)));
}

/**
 * Format price for display (handle different decimal places for different assets)
 */
export function formatPrice(price: bigint | number, symbol: string): string {
  const numPrice = typeof price === 'bigint' ? formatTokenAmount(price) : price;
  
  if (symbol === 'XLMUSD') {
    return numPrice.toFixed(4);
  } else {
    return numPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

/**
 * Create contract operation helpers
 */
export function createContractCall(
  contractId: string,
  method: string,
  args: Record<string, any>
) {
  const contract = new Contract(contractId);
  
  // Convert arguments to proper ScVal types
  const scArgs = Object.entries(args).map(([key, value]) => {
    if (key.includes('address') || (typeof value === 'string' && value.startsWith('G'))) {
      return nativeToScVal(value, { type: 'address' });
    } else if (key.includes('symbol') || key === 'symbol') {
      return nativeToScVal(value, { type: 'symbol' });
    } else if (key.includes('amount') || key.includes('price') || key.includes('size')) {
      return nativeToScVal(BigInt(value), { type: 'i128' });
    } else if (typeof value === 'number') {
      return nativeToScVal(value, { type: 'u32' });
    } else {
      return nativeToScVal(value);
    }
  });
  
  return contract.call(method, ...scArgs);
}

/**
 * Get contract events
 */
export async function getContractEvents(
  contractId: string,
  startLedger: number = 0,
  limit: number = 100
): Promise<any[]> {
  try {
    const events = await RPC.getEvents({
      startLedger: startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit,
    });
    
    return events.events.map(event => ({
      ...event,
      topics: event.topic.map(topic => scValToNative(topic)),
      value: scValToNative(event.value),
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Helper to validate contract addresses
 */
export function isValidContractAddress(address: string): boolean {
  try {
    Address.contract(Buffer.from(address, 'hex'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to validate account addresses
 */
export function isValidAccountAddress(address: string): boolean {
  try {
    Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}