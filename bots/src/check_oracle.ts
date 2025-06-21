import { Contract, Keypair, Networks, TransactionBuilder, BASE_FEE, xdr, rpc, scValToNative } from "@stellar/stellar-sdk";
import dotenv from "dotenv";

dotenv.config();

// ------------------------------------------------------------
// Simple helper that queries Reflector oracle contract for the
// latest price of a base asset (e.g. "XLM", "BTC").
// ------------------------------------------------------------

const RPC_URL = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const ORACLE_ID = "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63"; // Reflector Oracle on testnet

let ORACLE_DECIMALS: number | undefined;

async function fetchOraclePrice(assetSym: string) {
  const server = new rpc.Server(RPC_URL);

  // Temporary throw-away account funded by friendbot (only needed to build a tx)
  const kp = Keypair.random();
  await server.requestAirdrop(kp.publicKey());
  const account = await server.getAccount(kp.publicKey());

  const contract = new Contract(ORACLE_ID);

  // Build Asset::Other(Symbol) param → Vec ["Other", sym]
  const assetParam = xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol("Other"),
    xdr.ScVal.scvSymbol(assetSym),
  ]);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("lastprice", assetParam))
    .setTimeout(30)
    .build();

  const sim: any = await server.simulateTransaction(tx as any);

  if (process.env.DEBUG_ORACLE === "1") {
    console.dir(sim, { depth: null });
  }

  const scval = sim.result?.retval;
  if (!scval) throw new Error("No retval from simulation");

  const native = scValToNative(scval);
  if (!native) throw new Error("None returned for price");

  // Fetch decimals once
  if (ORACLE_DECIMALS === undefined) {
    const decTx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(contract.call("decimals"))
      .setTimeout(30)
      .build();
    const decSim: any = await server.simulateTransaction(decTx as any);
    ORACLE_DECIMALS = Number(scValToNative(decSim.result?.retval));
  }

  const priceFull = BigInt(native.price);
  const divisor = 10n ** BigInt((ORACLE_DECIMALS ?? 14) - 6);
  return priceFull / divisor; // returns 1e6 scaled price
}

(async () => {
  const assets = ["XLM", "BTC", "ETH"];
  for (const a of assets) {
    try {
      const p = await fetchOraclePrice(a);
      console.log(`${a} price: ${Number(p) / 1_000_000}`);
    } catch (e) {
      console.error(`Failed to fetch ${a}:`, e);
    }
  }
})(); 