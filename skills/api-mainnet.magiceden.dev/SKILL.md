# 🔓 Reverse-Engineered: Magic Eden NFT API

**Status**: ✅ Verified (partial)  
**Domain**: `api-mainnet.magiceden.dev`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for Magic Eden, Solana's largest NFT marketplace. Provides collection listings and NFT market data.

## Discovered Endpoints

### GET /v2/collections
List NFT collections with pagination

**Parameters**:
- `offset`: Starting offset (must be multiple of 20)
- `limit`: Number of results (must be multiple of 20)

**Example Request**:
```bash
curl -s "https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=20"
```

**Response** (sample):
```json
[
  {
    "symbol": "dreamer_",
    "name": "Dreamer",
    "description": "agent reads the skill doc → calls the API → signs the transaction → gets its cNFT",
    "image": "https://ap-assets.pinit.io/2KAsfougU4x7USMmVLXTCWy6b166ueswqggszWLmynbr/cee9d7f1-e207-461d-8ec2-7cc55b2c0e5f/0",
    "twitter": "",
    "discord": "",
    "website": "",
    "categories": ["pfps"],
    "isBadged": false,
    "hasCNFTs": false,
    "isOcp": false,
    "splTokens": []
  }
]
```

**Key Fields**:
- `symbol`: Collection symbol
- `name`: Collection name
- `description`: Collection description
- `image`: Collection image URL
- `categories`: Collection categories (e.g., "pfps", "art", "games")
- `isBadged`: Whether collection is verified
- `hasCNFTs`: Uses compressed NFTs
- `twitter/discord/website`: Social links

## Notes

- Pagination requires both `offset` and `limit` to be multiples of 20
- Returns NFT collections available on Magic Eden Solana
- API may have rate limiting
