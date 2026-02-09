# 🔓 Reverse-Engineered: Raydium V3 API

**Status**: ✅ Verified  
**Domain**: `api-v3.raydium.io`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for Raydium, Solana's leading automated market maker (AMM). Provides pool data, liquidity metrics, and trading statistics.

## Discovered Endpoints

### GET /main/info
Get main platform statistics

**Example Request**:
```bash
curl -s "https://api-v3.raydium.io/main/info"
```

**Response**:
```json
{
  "id": "1ef8cdb1-d8bd-447a-9137-0f0277e3800e",
  "success": true,
  "data": {
    "volume24": 248482753.9406727,
    "tvl": 1398376755.1391418
  }
}
```

### GET /pools/info/list
List pools with pagination and filtering

**Parameters**:
- `poolType`: Pool type (e.g., "all", "Concentrated", "Standard")
- `poolSortField`: Sort field (e.g., "default", "tvl", "volume")
- `sortType`: "desc" or "asc"
- `pageSize`: Number of results (e.g., 5, 10, 20)
- `page`: Page number (1-indexed)

**Example Request**:
```bash
curl -s "https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=default&sortType=desc&pageSize=5&page=1"
```

**Response** (truncated):
```json
{
  "id": "2e1ad481-c85c-45ac-a758-7f329645eec0",
  "success": true,
  "data": {
    "count": 5,
    "data": [
      {
        "type": "Concentrated",
        "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        "id": "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF",
        "mintA": {
          "address": "So11111111111111111111111111111111111111112",
          "symbol": "WSOL",
          "name": "Wrapped SOL",
          "decimals": 9,
          "logoURI": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png"
        },
        "mintB": {
          "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
          "symbol": "USDT",
          "name": "USDT",
          "decimals": 6
        },
        "price": 84.15291603026338,
        "mintAmountA": 16035.868558623,
        "mintAmountB": 443624.481667,
        "feeRate": 0.0001,
        "openTime": "0",
        "tvl": 1796202.69,
        "day": {
          "volume": 36521212.467083246,
          "volumeQuote": 36600906.348444685,
          "volumeFee": 3652.121246708328,
          "apr": 74.89,
          "feeApr": 74.21,
          "priceMin": 82.86492076387594,
          "priceMax": 89.05301414141414,
          "rewardApr": [0.68]
        },
        "week": {
          "volume": 443896859.6713282,
          "volumeFee": 44389.68596713285,
          "apr": 74.82,
          "feeApr": 74.14
        },
        "month": {
          "volume": 1483036004.191177,
          "volumeFee": 148303.6004191177,
          "apr": 99.76,
          "feeApr": 99.08
        },
        "pooltype": ["RAY Rewards", "Clmm"],
        "farmUpcomingCount": 0,
        "farmOngoingCount": 1,
        "farmFinishedCount": 0,
        "burnPercent": 0.17
      }
    ],
    "hasNextPage": true
  }
}
```

**Key Fields**:
- `type`: Pool type ("Concentrated", "Standard")
- `mintA/mintB`: Token pair information
- `price`: Current price
- `tvl`: Total value locked
- `day/week/month`: Volume and APR metrics by timeframe
- `feeRate`: Trading fee rate
- `burnPercent`: LP token burn percentage

### GET /pools/info/ids
Get specific pool info by ID

**Parameters**:
- `ids`: Comma-separated pool IDs

**Example Request**:
```bash
curl -s "https://api-v3.raydium.io/pools/info/ids?ids=CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
```

## Notes

This API provides comprehensive pool data for all Raydium AMM pools, including concentrated liquidity (CLMM) and standard AMM pools.
