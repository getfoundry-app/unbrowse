# 🔓 Reverse-Engineered: DexScreener Orders API

**Status**: ✅ Verified  
**Domain**: `api.dexscreener.com/orders`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for DexScreener's paid promotions system. Shows token advertising orders, boosts, and promotional data across chains.

## Discovered Endpoints

### GET /orders/v1/:chain/:tokenAddress
Get promotional orders for a specific token

**Example Request**:
```bash
curl -s "https://api.dexscreener.com/orders/v1/solana/So11111111111111111111111111111111111111112"
```

**Response** (sample):
```json
{
  "orders": [
    {
      "chainId": "solana",
      "tokenAddress": "So11111111111111111111111111111111111111112",
      "type": "tokenAd",
      "status": "on-hold",
      "paymentTimestamp": 1767714338784
    },
    {
      "chainId": "solana",
      "tokenAddress": "So11111111111111111111111111111111111111112",
      "type": "tokenProfile",
      "status": "approved",
      "paymentTimestamp": 1734108738379
    }
  ],
  "boosts": [
    {
      "chainId": "solana",
      "tokenAddress": "So11111111111111111111111111111111111111112",
      "id": "AnC6VBRyKuj87OwlXieg",
      "amount": 10,
      "paymentTimestamp": 1763531526741
    }
  ]
}
```

**Order Types**:
- `tokenAd`: Token advertisement
- `tokenProfile`: Token profile page
- `communityTakeover`: Community takeover feature

**Status Values**:
- `on-hold`: Pending approval
- `approved`: Active/approved
- `cancelled`: Cancelled order

### GET /token-profiles/latest/v1
Get latest token profiles with paid promotional content

**Example Request**:
```bash
curl -s "https://api.dexscreener.com/token-profiles/latest/v1"
```

**Response** (sample):
```json
[
  {
    "url": "https://dexscreener.com/ethereum/0xb342871276f3dfa65a8bfe4cbcc448ddff469433",
    "chainId": "ethereum",
    "tokenAddress": "0xb342871276f3DFa65a8bFe4cBcc448DdFF469433",
    "icon": "https://cdn.dexscreener.com/cms/images/...",
    "header": "https://cdn.dexscreener.com/cms/images/...",
    "openGraph": "https://cdn.dexscreener.com/token-images/og/...",
    "description": "Token description...",
    "links": [
      {"label": "Website", "url": "https://..."},
      {"type": "twitter", "url": "https://x.com/..."},
      {"type": "telegram", "url": "https://t.me/..."}
    ],
    "cto": false
  }
]
```

**Key Fields**:
- `url`: DexScreener page URL
- `chainId`: Blockchain
- `tokenAddress`: Token contract address
- `icon/header/openGraph`: Image URLs for branding
- `description`: Token description
- `links`: Social media and website links
- `cto`: Community takeover status

## Notes

This API reveals which tokens have paid for promotional features on DexScreener - useful for discovering trending/marketed tokens.
