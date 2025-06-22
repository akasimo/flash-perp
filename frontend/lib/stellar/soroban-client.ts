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

      if (typeof arg === 'string' && arg.length === 56) {
        // Stellar account (G...) or contract (C...) 56-char strings.
        // Use 'address' for both G and C addresses
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
    console.log('Building transaction for:', sourceAccount);
    console.log('Operations count:', operations.length);
    
    const account = await RPC.getAccount(sourceAccount);
    console.log('Got account, sequence:', account.sequenceNumber());
    
    const transaction = new TransactionBuilder(account, {
      fee: '200', // Higher fee for write operations
      networkPassphrase: NETWORK.PASSPHRASE,
    });
    
    operations.forEach((op, i) => {
      console.log(`Adding operation ${i}:`, op);
      transaction.addOperation(op);
    });
    
    const built = transaction.setTimeout(60).build();
    console.log('Built initial transaction, now preparing for Soroban...');
    
    // CRITICAL: Prepare transaction for Soroban - this step was missing!
    const preparedTransaction = await RPC.prepareTransaction(built);
    console.log('Prepared transaction for Soroban');
    
    const xdr = preparedTransaction.toXDR();
    console.log('Final prepared transaction XDR length:', xdr.length);
    
    return xdr;
  } catch (error) {
    console.error('Error building/preparing transaction - Full error:', error);
    console.error('Error building/preparing transaction - Stack:', error?.stack);
    throw new Error(handleNetworkError(error));
  }
}

/**
 * Submit a signed transaction
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  try {
    console.log('Submitting transaction, XDR length:', signedXdr.length);
    
    const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK.PASSPHRASE);
    console.log('Parsed transaction, operations:', transaction.operations.length);
    
    const result = await RPC.sendTransaction(transaction);
    console.log('RPC sendTransaction result:', result);
    
    if (result.status === 'ERROR') {
      console.error('Transaction failed with error result:', result.errorResult);
      console.error('Full error result object:', JSON.stringify(result.errorResult, null, 2));
      throw new Error(`Transaction failed: ${JSON.stringify(result.errorResult)}`);
    }
    
    console.log('Transaction submitted successfully, hash:', result.hash);
    return result.hash;
  } catch (error) {
    console.error('Error submitting transaction - Full error:', error);
    console.error('Error submitting transaction - Stack:', error?.stack);
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
  // Use string-based conversion to avoid BigInt/Number mixing
  const amountStr = amount.toString();
  const divisorStr = (10n ** BigInt(decimals)).toString();
  
  // Manual decimal point insertion
  const decimalPlaces = divisorStr.length - 1;
  if (amountStr.length <= decimalPlaces) {
    // Value is less than 1, add leading zeros
    const leadingZeros = "0".repeat(decimalPlaces - amountStr.length);
    return parseFloat("0." + leadingZeros + amountStr);
  } else {
    // Split into integer and fractional parts
    const integerPart = amountStr.slice(0, -decimalPlaces);
    const fractionalPart = amountStr.slice(-decimalPlaces);
    return parseFloat(integerPart + "." + fractionalPart);
  }
}

/**
 * Convert display number to raw token amount
 */
export function parseTokenAmount(amount: number, decimals = DECIMALS.TOKEN): bigint {
  const multiplier = 10n ** BigInt(decimals);
  return BigInt(Math.floor(amount * Number(multiplier)));
}

/**
 * Helper to convert UI symbol to contract symbol
 */
export function symbolToContractSymbol(uiSymbol: string): string {
  // Strip USD suffix if present
  return uiSymbol.replace('USD', '');
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
  try {
    console.log(`Creating contract call: ${contractId}.${method}`);
    console.log('Contract call arguments:', args);
    
    const contract = new Contract(contractId);
    
    // Convert arguments to proper ScVal types
    const scArgs = Object.entries(args).map(([key, value]) => {
      console.log(`Converting arg ${key}:`, value, typeof value);
      
      // Address handling - both G (accounts) and C (contracts) use 'address' type
      if (key.includes('address') || key === 'from' || key === 'spender' || key === 'trader' || 
          (typeof value === 'string' && value.length === 56 && (value.startsWith('G') || value.startsWith('C')))) {
        console.log(`  -> Converting to address: ${value}`);
        return nativeToScVal(value, { type: 'address' });
      } 
      // Symbol handling
      else if (key.includes('symbol') || key === 'symbol') {
        console.log(`  -> Converting to symbol: ${value}`);
        return nativeToScVal(value, { type: 'symbol' });
      } 
      // Amount/price/size - use i128 for large numbers
      else if (key.includes('amount') || key.includes('price') || key.includes('size')) {
        const bigIntValue = BigInt(value);
        console.log(`  -> Converting to i128: ${bigIntValue}`);
        return nativeToScVal(bigIntValue, { type: 'i128' });
      } 
      // Expiration ledger numbers
      else if (key.includes('expiration') || key.includes('ledger')) {
        console.log(`  -> Converting to u32: ${value}`);
        return nativeToScVal(Number(value), { type: 'u32' });
      } 
      // Regular numbers
      else if (typeof value === 'number') {
        console.log(`  -> Converting number to u32: ${value}`);
        return nativeToScVal(value, { type: 'u32' });
      } 
      // Fallback to native conversion
      else {
        console.log(`  -> Converting with native: ${value}`);
        return nativeToScVal(value);
      }
    });
    
    console.log(`Contract call created with ${scArgs.length} arguments`);
    return contract.call(method, ...scArgs);
  } catch (error) {
    console.error(`Error creating contract call ${contractId}.${method}:`, error);
    throw error;
  }
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

/**
 * Poll Soroban RPC until the given transaction hash is confirmed or timeout.
 */
export async function waitForTx(hash: string, timeoutMs = 20000, pollMs = 1000): Promise<boolean> {
  if (!hash) {
    throw new Error('Transaction hash is required');
  }
  
  console.log(`Waiting for transaction ${hash} to confirm...`);
  const started = Date.now();
  
  while (Date.now() - started < timeoutMs) {
    try {
      console.log(`Polling transaction status... (${Math.round((Date.now() - started) / 1000)}s elapsed)`);
      const tx = await RPC.getTransaction(hash);
      
      if (tx && tx.status === 'SUCCESS') {
        console.log(`Transaction ${hash} confirmed successfully`);
        return true;
      }
      
      if (tx && tx.status === 'FAILED') {
        console.error(`Transaction ${hash} failed:`, tx);
        throw new Error(`Transaction failed: ${JSON.stringify(tx.resultXdr || 'Unknown error')}`);
      }
      
      // If NOT_FOUND, continue polling
      if (tx && tx.status === 'NOT_FOUND') {
        console.log('Transaction not found yet, continuing to poll...');
      }
      
    } catch (e: any) {
      console.warn(`Error polling transaction ${hash}:`, e.message);
      // Continue polling unless it's a definitive failure
      if (e.message?.includes('Transaction failed')) {
        throw e;
      }
    }
    
    await new Promise(res => setTimeout(res, pollMs));
  }
  
  console.error(`Transaction ${hash} confirmation timed out after ${timeoutMs}ms`);
  throw new Error(`Timeout waiting for transaction confirmation after ${timeoutMs / 1000}s`);
}