# Solana JSON-RPC API

Solana blockchain RPC.

**Base URL:** `https://api.mainnet-beta.solana.com`

**Auth:** None required (rate limited)

**Status:** ✅ Verified

## RPC Methods

### getBalance
Get account balance
- **Params:** `[publicKey]`

### getAccountInfo
Get account info
- **Params:** `[publicKey, {encoding: "jsonParsed"}]`

### getBlockHeight
Get current block height

### getLatestBlockhash
Get latest blockhash

### getTransaction
Get transaction details
- **Params:** `[signature, {encoding: "jsonParsed"}]`

**Note:** This is a JSON-RPC API. All requests use POST with method/params structure.
