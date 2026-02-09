# Raydium AMM Internal API

## Overview
**Domain:** api-v3.raydium.io  
**Type:** INTERNAL API (Reverse Engineered)  
**Protocol:** REST/HTTP  
**Chain:** Solana  
**Purpose:** AMM pool data and liquidity information

**⚠️ WARNING:** This is an internal API discovered through reverse engineering. Not officially documented. Use at your own risk.

## Discovery Method
- Analyzed Raydium frontend network requests
- Observed API calls during pool browsing
- Documented response formats from actual calls

## Base URL
```
https://api-v3.raydium.io
```

## Authentication
- **None required** for read operations
- Rate limiting is enforced

## Discovered Endpoints

### 1. Get Pool Info List

#### Endpoint
```
GET /pools/info/list
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| poolType | string | No | Filter by pool type (all, standard, concentrated) |
| poolSortField | string | No | Sort field (default, liquidity, volume24h, apr) |
| sortType | string | No | Sort direction (asc, desc) |
| pageSize | number | No | Number of results per page |
| page | number | No | Page number (1-indexed) |

#### Example Request
```bash
curl "https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=default&sortType=desc&pageSize=3&page=1"
```

#### Response Format
```json
{
  "id": "2f6613cb-feec-41f0-8b43-5e13f5e1d0ec",
  "success": true,
  "data": {
    "count": 3,
    "data": [
      {
        "type": "Concentrated",
        "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        "id": "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF",
        "mintA": {
          "chainId": 101,
          "address": "So11111111111111111111111111111111111111112",
          "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "logoURI": "https://img-v1.raydium.io/icon/...",
          "symbol": "WSOL",
          "name": "Wrapped SOL",
          "decimals": 9,
          "tags": [],
          "extensions": {}
        },
        "mintB": {
          "chainId": 101,
          "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
          "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "logoURI": "https://img-v1.raydium.io/icon/...",
          "symbol": "USDT",
          "name": "USDT",
          "decimals": 6,
          "tags": ["hasFreeze"],
          "extensions": {}
        },
        "price": 84.47078530884136,
        "mintAmountA": 15876.340560256,
        "mintAmountB": 455179.704941,
        "feeRate": 0.0001,
        "openTime": "0",
        "tvl": 1789343.65,
        "day": {
          "volume": 36819488.591067225,
          "volumeQuote": 36900040.34771758,
          "volumeFee": 3681.948859106727,
          "apr": 75.7,
          "feeApr": 75.7,
          "priceMin": 82.1,
          "priceMax": 86.5
        },
        "rewardDefaultInfos": [
          {
            "mint": {
              "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
              "symbol": "RAY",
              "name": "Raydium",
              "decimals": 6
            },
            "perSecond": "661",
            "startTime": "1767638100",
            "endTime": "1770662100"
          }
        ]
      }
    ]
  }
}
```

#### Response Fields
- `type`: Pool type (Standard, Concentrated, Stable)
- `price`: Current price of token A in terms of token B
- `tvl`: Total Value Locked in USD
- `day.volume`: 24h trading volume
- `day.apr`: 24h APR
- `feeRate`: Pool fee rate (0.0001 = 0.01%)
- `rewardDefaultInfos`: Liquidity mining rewards info

### 2. Get Pool Details (Inferred)

#### Endpoint
```
GET /pools/info/{poolId}
```

#### Description
Get detailed information about a specific pool by ID.

**Note:** Specific endpoint not fully documented. Inferred from frontend behavior.

### 3. Pool Types

The API supports different pool types:

1. **Standard:** Traditional AMM pools (constant product formula)
2. **Concentrated:** Concentrated liquidity pools (like Uniswap v3)
3. **Stable:** Stableswap pools (optimized for stable pairs)

## Sort Fields

Available `poolSortField` values:
- `default`: Default sorting
- `liquidity`: Sort by TVL
- `volume24h`: Sort by 24h volume
- `apr`: Sort by APR
- `fee24h`: Sort by 24h fees

## Rate Limiting
- Rate limits are enforced but exact limits unknown
- Recommended: Max 5 requests/second
- Cache responses for 30-60 seconds

## Error Handling

### Common Errors
```json
{
  "success": false,
  "error": "Invalid pool type"
}
```

```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```

### Best Practices
1. Always check `success` field
2. Handle missing data gracefully
3. Implement retry logic with backoff
4. Cache pool data appropriately

## Integration Tips

### TypeScript Example
```typescript
interface RaydiumPool {
  type: 'Standard' | 'Concentrated' | 'Stable';
  id: string;
  mintA: TokenInfo;
  mintB: TokenInfo;
  price: number;
  tvl: number;
  day: {
    volume: number;
    apr: number;
  };
}

async function getRaydiumPools(
  poolType: string = 'all',
  pageSize: number = 10
): Promise<RaydiumPool[]> {
  const url = new URL('https://api-v3.raydium.io/pools/info/list');
  url.searchParams.set('poolType', poolType);
  url.searchParams.set('poolSortField', 'default');
  url.searchParams.set('sortType', 'desc');
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('page', '1');
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Raydium API error: ${response.status}`);
  }
  
  const json = await response.json();
  if (!json.success) {
    throw new Error(`Raydium API error: ${json.error}`);
  }
  
  return json.data.data;
}
```

### Python Example
```python
import requests
from typing import List, Dict, Any

def get_raydium_pools(
    pool_type: str = "all",
    page_size: int = 10
) -> List[Dict[str, Any]]:
    url = "https://api-v3.raydium.io/pools/info/list"
    params = {
        "poolType": pool_type,
        "poolSortField": "default",
        "sortType": "desc",
        "pageSize": page_size,
        "page": 1
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    data = response.json()
    if not data.get("success"):
        raise Exception(f"API error: {data.get('error')}")
    
    return data["data"]["data"]
```

## Use Cases

1. **Pool Discovery:** Find pools for specific token pairs
2. **TVL Tracking:** Monitor total value locked
3. **APR Comparison:** Compare yields across pools
4. **Volume Analysis:** Track trading activity
5. **Price Feeds:** Get current exchange rates

## Known Limitations

1. **No Historical Data:** Only current state available
2. **No WebSocket:** Must poll for updates
3. **Pagination:** May be limited
4. **Pool Creation:** Not available via API
5. **Position Management:** Requires on-chain transactions

## Data Refresh Rate
- Pool prices: Updates every ~1 second (on-chain)
- TVL: Updates every ~5 seconds
- Volume/APR: Updates every ~1 minute
- **API Cache:** ~30 seconds typical

## Alternative Data Sources

If this API becomes unavailable:
1. Query Solana blockchain directly
2. Use Raydium SDK (if available)
3. Use DexScreener API
4. Parse on-chain program accounts

## Comparison with Other DEXes

| Feature | Raydium | Orca | Jupiter |
|---------|---------|------|---------|
| Pool Types | 3 types | 2 types | Aggregated |
| API Version | v3 | v2 | v6 |
| Response Time | Fast | Fast | Medium |
| Data Richness | High | Medium | Routing-focused |

## Changelog

- **2026-02-09:** Initial reverse-engineered documentation
- Endpoint discovery through frontend analysis
- Response formats observed from live calls

## Legal & Ethical

**IMPORTANT:**
- This API is NOT officially documented by Raydium
- Reverse engineered through frontend analysis
- May violate Terms of Service
- No guarantee of stability
- Use at your own risk
- Check Raydium's official documentation for public APIs

## References

- **Frontend:** https://raydium.io/
- **Swap Interface:** https://raydium.io/swap/
- **Solana Docs:** https://docs.solana.com/

---

**Status:** ⚠️ Internal/Unofficial  
**Stability:** Unknown  
**Support:** None  
**Last Verified:** February 9, 2026
