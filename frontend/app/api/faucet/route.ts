// Faucet API for minting test USDC tokens

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isValidAccountAddress } from '@/lib/stellar/soroban-client';

const execAsync = promisify(exec);

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const FAUCET_AMOUNT = 100_000_000; // 100 USDC in 6 decimals

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    
    // Validate input
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    // Validate Stellar address format
    if (!isValidAccountAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }
    
    // Check rate limiting
    const now = Date.now();
    const lastRequest = rateLimitMap.get(address);
    
    if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastRequest)) / 1000 / 60);
      return NextResponse.json(
        { 
          error: `Rate limited. Please wait ${remainingTime} minutes before requesting again.`,
          remainingMinutes: remainingTime
        },
        { status: 429 }
      );
    }
    
    // Get environment variables
    const tokenContract = process.env.NEXT_PUBLIC_TOKEN_CONTRACT;
    const adminSecret = process.env.FAUCET_SK;
    
    if (!tokenContract || tokenContract.includes('PLACEHOLDER')) {
      return NextResponse.json(
        { error: 'Token contract not configured' },
        { status: 500 }
      );
    }
    
    if (!adminSecret || adminSecret.includes('PLACEHOLDER')) {
      return NextResponse.json(
        { error: 'Faucet not configured' },
        { status: 500 }
      );
    }
    
    // Build CLI command
    const command = [
      'stellar',
      'contract',
      'invoke',
      '--id',
      tokenContract,
      '--source',
      adminSecret,
      '--network',
      'testnet',
      '--',
      'mint',
      '--to',
      address,
      '--amount',
      FAUCET_AMOUNT.toString()
    ].join(' ');
    
    console.log('Executing faucet command for address:', address);
    
    // Execute command
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.error('Faucet command stderr:', stderr);
      return NextResponse.json(
        { error: 'Failed to mint tokens' },
        { status: 500 }
      );
    }
    
    // Update rate limiting
    rateLimitMap.set(address, now);
    
    // Clean up old entries (simple cleanup)
    if (rateLimitMap.size > 1000) {
      for (const [addr, timestamp] of rateLimitMap.entries()) {
        if (now - timestamp > RATE_LIMIT_WINDOW) {
          rateLimitMap.delete(addr);
        }
      }
    }
    
    // Extract transaction hash from output
    const lines = stdout.split('\n').filter(line => line.trim());
    const lastLine = lines[lines.length - 1];
    
    console.log('Faucet success for address:', address, 'TX:', lastLine);
    
    return NextResponse.json({
      success: true,
      amount: FAUCET_AMOUNT / 1_000_000, // Convert to display amount
      hash: lastLine,
      message: `Successfully minted ${FAUCET_AMOUNT / 1_000_000} USDC to ${address}`,
    });
    
  } catch (error: any) {
    console.error('Faucet error:', error);
    
    // Handle specific errors
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    
    if (error.message?.includes('insufficient')) {
      return NextResponse.json(
        { error: 'Faucet has insufficient funds. Please contact support.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return faucet info
  return NextResponse.json({
    faucetAmount: FAUCET_AMOUNT / 1_000_000,
    rateLimitMinutes: RATE_LIMIT_WINDOW / 1000 / 60,
    tokenSymbol: 'USDC',
    network: 'testnet',
  });
}