# 🔓 Reverse-Engineered: GeckoTerminal API

**Status**: ✅ Verified  
**Domain**: `api.geckoterminal.com`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for GeckoTerminal by CoinGecko. Provides real-time DEX token data across multiple networks including Solana.

## Discovered Endpoints

### GET /api/v2/networks/:network/tokens/:address
Get token information including price, market cap, volume, and top pools

**Example Request**:
```bash
curl -s "https://api.geckoterminal.com/api/v2/networks/solana/tokens/So11111111111111111111111111111111111111112"
```

**Response**:
```json
{
  "data": {
    "id": "solana_So11111111111111111111111111111111111111112",
    "type": "token",
    "attributes": {
      "address": "So11111111111111111111111111111111111111112",
      "name": "Wrapped SOL",
      "symbol": "SOL",
      "decimals": 9,
      "image_url": "https://coin-images.coingecko.com/coins/images/21629/large/solana.jpg",
      "coingecko_coin_id": "wrapped-solana",
      "total_supply": "12190977949165548.0",
      "normalized_total_supply": "12190977.9491655",
      "price_usd": "84.3192349045",
      "fdv_usd": "1027933933.41099",
      "total_reserve_in_usd": "13817389682.55",
      "volume_usd": {
        "h24": "3374834626.1862"
      },
      "market_cap_usd": "1026340288.77271"
    },
    "relationships": {
      "top_pools": {
        "data": [
          {
            "id": "solana_Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE",
            "type": "pool"
          }
        ]
      }
    }
  }
}
```

**Key Fields**:
- `address`: Token mint address
- `name/symbol`: Token name and symbol
- `price_usd`: Current USD price
- `fdv_usd`: Fully diluted valuation
- `market_cap_usd`: Market capitalization
- `volume_usd.h24`: 24-hour trading volume
- `total_reserve_in_usd`: Total liquidity in USD
- `coingecko_coin_id`: CoinGecko ID for cross-reference
- `top_pools`: Related liquidity pools

**Supported Networks**:
- `solana`
- `ethereum`
- `base`
- `arbitrum`
- `polygon`
- And 100+ more chains

## Notes

This is an undocumented internal API that powers GeckoTerminal's DEX tracking. Great for real-time price discovery and liquidity analysis.
