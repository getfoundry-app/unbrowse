# 🔓 Reverse-Engineered: Orca Whirlpool API

**Status**: ✅ Verified  
**Domain**: `api.mainnet.orca.so`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for Orca, a leading Solana DEX. Provides whirlpool (AMM pool) data including tokens, TVL, volume, and APR metrics.

## Discovered Endpoints

### GET /v1/whirlpool/list
List all whirlpool pools with full market data

**Example Request**:
```bash
curl -s "https://api.mainnet.orca.so/v1/whirlpool/list"
```

**Response** (truncated):
```json
[
  {
    "address": "E1bTSQfgico9urVC6uQVShpT3tRfCbhPmwjVX6gjKNTK",
    "tokenA": {
      "mint": "So11111111111111111111111111111111111111112",
      "symbol": "SOL",
      "name": "Solana",
      "decimals": 9,
      "logoURI": "https://coin-images.coingecko.com/coins/images/21629/large/solana.jpg",
      "coingeckoId": "solana",
      "whitelisted": true,
      "poolToken": false,
      "token2022": false
    },
    "tokenB": {
      "mint": "FNo4cbCRo3ypda89ZUneF3QvVer8i3BXYtz8V",
      "symbol": "dog",
      "name": "Dogydog",
      "decimals": 9,
      "whitelisted": false,
      "poolToken": false,
      "token2022": false
    },
    "whitelisted": false,
    "token2022": false,
    "tickSpacing": 128,
    "price": 35714285.71428572,
    "lpFeeRate": 0.01,
    "protocolFeeRate": 0.13,
    "whirlpoolsConfig": "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
    "modifiedTimeMs": 1742938567559,
    "tvl": 0,
    "volume": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "volumeDenominatedA": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "volumeDenominatedB": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "feeApr": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "reward0Apr": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "reward1Apr": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "reward2Apr": {
      "day": 0,
      "week": 0,
      "month": 0
    },
    "totalApr": {
      "day": 0,
      "week": 0,
      "month": 0
    }
  }
]
```

**Key Fields**:
- `address`: Whirlpool pool address
- `tokenA/tokenB`: Token pair info (mint, symbol, name, decimals)
- `price`: Current price of tokenA in tokenB
- `tvl`: Total value locked in USD
- `volume`: Trading volume by timeframe (day/week/month)
- `feeApr/totalApr`: Fee and total APR percentages
- `lpFeeRate`: Liquidity provider fee rate
- `whitelisted`: Whether pool is whitelisted

## Notes

This endpoint returns all Orca whirlpool pools (thousands). Use for discovering trading pairs, TVL tracking, and yield farming opportunities.
