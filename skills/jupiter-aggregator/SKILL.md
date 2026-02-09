# Jupiter Aggregator Internal API

## Overview
**Domain:** quote-api.jup.ag  
**Type:** INTERNAL API (Reverse Engineered)  
**Protocol:** REST/HTTP  
**Chain:** Solana  
**Purpose:** DEX aggregation and swap routing

**⚠️ WARNING:** This is an internal API discovered through reverse engineering. Not officially documented. Use at your own risk.

## Discovery Method
- Analyzed Jupiter frontend network requests
- Observed API calls during swap operations
- Documented response formats

## Base URLs
- **Quote API:** `https://quote-api.jup.ag/v6`
- **Token List:** `https://token.jup.ag`

## Authentication
- **None required** for read operations
- Rate limiting is enforced

## Discovered Endpoints

### 1. Get Swap Quote

#### Endpoint
```
GET /v6/quote
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inputMint | string | Yes | Input token mint address |
| outputMint | string | Yes | Output token mint address |
| amount | number | Yes | Amount in smallest unit (lamports) |
| slippageBps | number | No | Slippage in basis points (default: 50) |
| onlyDirectRoutes | boolean | No | Only use direct routes |
| asLegacyTransaction | boolean | No | Return legacy transaction format |

#### Example Request
```bash
curl "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000&slippageBps=50"
```

#### Response Format
```json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "inAmount": "1000000000",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "outAmount": "195420000",
  "otherAmountThreshold": "195224200",
  "swapMode": "ExactIn",
  "slippageBps": 50,
  "platformFee": null,
  "priceImpactPct": "0.0025",
  "routePlan": [
    {
      "swapInfo": {
        "ammKey": "...",
        "label": "Raydium",
        "inputMint": "...",
        "outputMint": "...",
        "inAmount": "1000000000",
        "outAmount": "195420000",
        "feeAmount": "2500",
        "feeMint": "..."
      },
      "percent": 100
    }
  ]
}
```

#### Response Fields
- `routePlan`: Array of swap routes
- `priceImpactPct`: Price impact percentage
- `otherAmountThreshold`: Minimum output with slippage
- `platformFee`: Platform fee if applicable

### 2. Get Token List

#### Endpoint
```
GET https://token.jup.ag/strict
```

#### Description
Returns the strict token list used by Jupiter aggregator.

#### Example Request
```bash
curl "https://token.jup.ag/strict"
```

#### Response Format
```json
[
  {
    "address": "So11111111111111111111111111111111111111112",
    "chainId": 101,
    "decimals": 9,
    "name": "Wrapped SOL",
    "symbol": "SOL",
    "logoURI": "https://...",
    "tags": ["verified"],
    "extensions": {
      "coingeckoId": "solana"
    }
  }
]
```

### 3. Post Swap Transaction (Requires Auth)

#### Endpoint
```
POST /v6/swap
```

#### Description
Submit a swap transaction to be processed.

#### Note
This endpoint requires additional authentication and transaction signing. Not fully documented in this reverse-engineered spec.

## Common Token Addresses

### Solana Mainnet
- **SOL (Wrapped):** `So11111111111111111111111111111111111111112`
- **USDC:** `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT:** `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

## Rate Limiting
- Rate limits are enforced but exact limits unknown
- Recommended: Max 10 requests/second
- Consider caching token list (updates infrequently)

## Error Handling

### Common Errors
```json
{
  "error": "Token not found",
  "statusCode": 404
}
```

```json
{
  "error": "Rate limit exceeded",
  "statusCode": 429
}
```

### Best Practices
1. Implement exponential backoff
2. Cache quote responses for 10-30 seconds
3. Handle network timeouts gracefully
4. Validate token addresses before requesting

## Integration Tips

### TypeScript Example
```typescript
async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50
) {
  const url = new URL('https://quote-api.jup.ag/v6/quote');
  url.searchParams.set('inputMint', inputMint);
  url.searchParams.set('outputMint', outputMint);
  url.searchParams.set('amount', amount.toString());
  url.searchParams.set('slippageBps', slippageBps.toString());
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Jupiter API error: ${response.status}`);
  }
  
  return response.json();
}
```

### Python Example
```python
import requests

def get_jupiter_quote(input_mint: str, output_mint: str, amount: int):
    url = "https://quote-api.jup.ag/v6/quote"
    params = {
        "inputMint": input_mint,
        "outputMint": output_mint,
        "amount": amount,
        "slippageBps": 50
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
```

## Known Limitations

1. **No Historical Data:** Only current quotes available
2. **No WebSocket:** Polling required for real-time updates
3. **Transaction Submission:** Requires wallet integration
4. **Slippage:** User must handle slippage protection
5. **MEV:** No built-in MEV protection

## Alternative Approaches

If this internal API becomes unavailable:
1. Use Raydium API directly
2. Use Orca API directly
3. Implement your own routing logic
4. Use official Jupiter SDK (if available)

## Changelog

- **2026-02-09:** Initial reverse-engineered documentation
- Endpoint discovery through frontend analysis
- Response formats observed from actual calls

## Legal & Ethical

**IMPORTANT:**
- This API is NOT officially documented by Jupiter
- Reverse engineered through frontend analysis
- May violate Terms of Service
- No guarantee of stability
- Use at your own risk
- Check Jupiter's official documentation for public APIs

## References

- **Frontend:** https://jup.ag/
- **Token List:** https://token.jup.ag/
- **Solana Docs:** https://docs.solana.com/

---

**Status:** ⚠️ Internal/Unofficial  
**Stability:** Unknown  
**Support:** None  
**Last Verified:** February 9, 2026
