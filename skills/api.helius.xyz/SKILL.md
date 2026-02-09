# Helius API

Enhanced Solana RPC and APIs.

**Base URL:** `https://api.helius.xyz/v0`

**Auth:** API key required

**Status:** ⚠️ Requires API Key

## Endpoints

### POST /addresses/{address}/transactions
Get transactions for an address
- **Params:** `address` (Solana address)
- **Query:** `api-key` (required)

### GET /addresses/{address}/balances
Get token balances
- **Params:** `address` (Solana address)
- **Query:** `api-key` (required)

### POST /
JSON-RPC endpoint (enhanced Solana RPC)
- **Query:** `api-key` (required)

**Note:** Helius provides enhanced Solana RPC with webhooks, NFT APIs, and more.
