# 🔓 Reverse-Engineered: DexScreener API

**Status**: ✅ Verified  
**Domain**: `api.dexscreener.com`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for DexScreener, a popular DEX aggregator. Provides multi-chain DEX data including prices, volume, liquidity, and market info.

## Discovered Endpoints

### GET /latest/dex/tokens/:address
Get DEX pairs for a specific token address

**Example Request**:
```bash
curl -s "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112"
```

**Response** (truncated):
```json
{
  "schemaVersion": "1.0.0",
  "pairs": [
    {
      "chainId": "solana",
      "dexId": "raydium",
      "url": "https://dexscreener.com/solana/3nmfwzxwy1s1m5s8vyahqd4wgs4isxxe4lroummyqegf",
      "pairAddress": "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF",
      "labels": ["CLMM"],
      "baseToken": {
        "address": "So11111111111111111111111111111111111111112",
        "name": "Wrapped SOL",
        "symbol": "SOL"
      },
      "quoteToken": {
        "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        "name": "USDT",
        "symbol": "USDT"
      },
      "priceNative": "84.1844",
      "priceUsd": "84.18",
      "txns": {
        "m5": { "buys": 207, "sells": 187 },
        "h1": { "buys": 2506, "sells": 2766 },
        "h6": { "buys": 21225, "sells": 25097 },
        "h24": { "buys": 97127, "sells": 105718 }
      },
      "volume": {
        "h24": 42560456.15,
        "h6": 5964046.56,
        "h1": 775481.01,
        "m5": 54471
      },
      "priceChange": {
        "m5": 0.03,
        "h1": 0.12,
        "h6": -1.84,
        "h24": -4.69
      },
      "liquidity": {
        "usd": 1794218.6,
        "base": 16055,
        "quote": 442581
      },
      "pairCreatedAt": 1723699294000,
      "info": {
        "imageUrl": "https://cdn.dexscreener.com/cms/images/...",
        "websites": [{"url": "https://solana.com", "label": "Website"}],
        "socials": [{"url": "https://x.com/solana", "type": "twitter"}]
      }
    }
  ]
}
```

**Key Fields**:
- `chainId`: Blockchain (e.g., "solana", "ethereum")
- `dexId`: DEX name (e.g., "raydium", "orca", "meteora")
- `pairAddress`: On-chain pair address
- `priceNative`: Price in quote token
- `priceUsd`: Price in USD
- `txns`: Buy/sell transaction counts by timeframe (m5, h1, h6, h24)
- `volume`: Trading volume by timeframe
- `priceChange`: Price change percentages
- `liquidity`: Liquidity in USD and tokens
- `labels`: Pool labels (e.g., "CLMM", "wp", "DYN")

## Notes

This API aggregates data from multiple Solana DEXes (Raydium, Orca, Meteora, Phoenix, etc.). Great for price discovery and market monitoring.
