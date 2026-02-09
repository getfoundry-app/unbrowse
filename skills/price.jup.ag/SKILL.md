# Jupiter Price API

Solana token prices from Jupiter.

**Base URL:** `https://price.jup.ag/v6`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /price
Get token prices
- **Query:** `ids` (comma-separated token addresses)

### POST /quote
Get swap quote
- **Query:** `inputMint`, `outputMint`, `amount`
