# 🔓 Reverse-Engineered: CoinGecko Simple Price API

**Status**: ✅ Verified  
**Domain**: `api.coingecko.com`  
**Auth**: None required (public endpoints)  
**Type**: REST JSON

## Overview

CoinGecko's public API for cryptocurrency price data. Supports both coin IDs and token contract addresses across multiple chains.

## Discovered Endpoints

### GET /api/v3/simple/price
Get current price for coins by ID

**Parameters**:
- `ids`: Comma-separated coin IDs (e.g., "solana,bitcoin")
- `vs_currencies`: Comma-separated fiat currencies (e.g., "usd,eur")

**Example Request**:
```bash
curl -s "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
```

**Response**:
```json
{
  "solana": {
    "usd": 84.22
  }
}
```

### GET /api/v3/simple/token_price/:platform
Get token prices by contract address

**Parameters**:
- `contract_addresses`: Comma-separated contract addresses
- `vs_currencies`: Comma-separated fiat currencies

**Supported Platforms**:
- `solana`
- `ethereum`
- `binance-smart-chain`
- `polygon-pos`
- `base`
- `arbitrum-one`
- And 100+ more chains

**Example Request**:
```bash
curl -s "https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=So11111111111111111111111111111111111111112&vs_currencies=usd"
```

**Response**:
```json
{
  "So11111111111111111111111111111111111111112": {
    "usd": 84.07
  }
}
```

### GET /api/v3/coins/list
List all supported coins with platform information

**Parameters**:
- `include_platform`: Include platform/contract data (default: false)

**Example Request**:
```bash
curl -s "https://api.coingecko.com/api/v3/coins/list?include_platform=true" | head -50
```

**Response** (sample):
```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "platforms": {}
  },
  {
    "id": "wrapped-solana",
    "symbol": "sol",
    "name": "Wrapped SOL",
    "platforms": {
      "solana": "So11111111111111111111111111111111111111112"
    }
  }
]
```

## Notes

- Free tier has rate limits (~50 calls/minute)
- Response times vary (can be slow during high traffic)
- Most reliable public crypto price API
- Use `token_price` for Solana SPL tokens
- Use `price` for major cryptocurrencies by ID
