# Internal API Catalog

This catalog documents INTERNAL, reverse-engineered APIs discovered by analyzing HTTP requests made by website frontends. These are NOT public APIs documented by the service providers.

## Discovery Date
February 9, 2026

## Important Note
⚠️ **These are internal APIs discovered through reverse engineering. They are:**
- Not officially documented
- Not guaranteed to be stable
- Subject to change without notice
- May have rate limiting
- May require authentication

Use at your own risk. Always check terms of service before using internal APIs.

---

## 1. Hacker News (Firebase API)

**Base URL:** `https://hacker-news.firebaseio.com/v0`

### Discovered Endpoints

#### Get Top Stories
```
GET /v0/topstories.json
```
Returns array of item IDs for top stories

**Sample Response:**
```json
[46943568, 46944555, 46938511, ...]
```

#### Get Item Details
```
GET /v0/item/{id}.json
```
Returns details for a specific item (story, comment, etc.)

**Sample Response:**
```json
{
  "by": "d3Xt3r",
  "id": 42663924,
  "parent": 42647824,
  "text": "Agreed, in fact this is...",
  "time": 1736579112,
  "type": "comment"
}
```

#### Other Story Endpoints
- `/v0/beststories.json` - Best stories
- `/v0/askstories.json` - Ask HN stories
- `/v0/showstories.json` - Show HN stories
- `/v0/newstories.json` - Newest stories

**Auth:** None required (public)
**Rate Limiting:** Unknown
**Discovery Method:** Frontend analysis

---

## 2. Reddit (JSON API)

**Base URL:** `https://www.reddit.com`

### Discovered Endpoints

#### Get Subreddit Posts
```
GET /r/{subreddit}.json?limit={n}
GET /r/{subreddit}/hot.json?limit={n}
GET /r/{subreddit}/new.json?limit={n}
```

Returns JSON data for subreddit posts by appending `.json` to any Reddit URL

**Sample Response:**
```json
{
  "kind": "Listing",
  "data": {
    "children": [
      {
        "kind": "t3",
        "data": {
          "title": "Post title",
          "author": "username",
          ...
        }
      }
    ]
  }
}
```

**Note:** Reddit returns HTML when no Accept header, but JSON API is available by appending `.json`

**Auth:** None for public content
**Rate Limiting:** Yes, aggressive
**Discovery Method:** URL pattern analysis

---

## 3. Dev.to API

**Base URL:** `https://dev.to/api`

### Discovered Endpoints

#### Get Articles
```
GET /api/articles?per_page={n}
```

**Sample Response:**
```json
[
  {
    "type_of": "article",
    "id": 3239700,
    "title": "Build an Accessible Audio Controller",
    "description": "...",
    "readable_publish_date": "Feb 8",
    "slug": "build-an-accessible-audio-controller-4me7",
    "url": "https://dev.to/...",
    "comments_count": 12,
    "public_reactions_count": 27,
    "user": {...},
    "tags": "community, learning, programming, webdev"
  }
]
```

#### Get Tags
```
GET /api/tags?per_page={n}
```

**Auth:** None for read operations (API key for writes)
**Rate Limiting:** Yes
**Discovery Method:** Frontend API calls

---

## 4. NPM Registry API

**Base URL:** `https://registry.npmjs.org`

### Discovered Endpoints

#### Get Package Info
```
GET /{package-name}
```

**Sample Response:**
```json
{
  "_id": "react",
  "name": "react",
  "dist-tags": {
    "latest": "19.2.4",
    "beta": "19.0.0-beta-...",
    ...
  },
  "versions": {...}
}
```

#### Search Packages (NPMS.io)
```
GET https://api.npms.io/v2/search?q={query}&size={n}
```

**Auth:** None for public packages
**Rate Limiting:** Yes
**Discovery Method:** Package manager internals

---

## 5. PyPI API

**Base URL:** `https://pypi.org/pypi`

### Discovered Endpoints

#### Get Package Info
```
GET /pypi/{package}/json
```

**Sample Response:**
```json
{
  "info": {
    "author": "Kenneth Reitz",
    "author_email": "me@kennethreitz.org",
    "name": "requests",
    "version": "2.31.0",
    "description": "...",
    ...
  },
  "releases": {...}
}
```

**Auth:** None for public packages
**Rate Limiting:** Yes
**Discovery Method:** pip internals

---

## 6. Crates.io API

**Base URL:** `https://crates.io/api/v1`

### Discovered Endpoints

#### Search Crates
```
GET /api/v1/crates?q={query}&per_page={n}
```

**Sample Response:**
```json
{
  "crates": [
    {
      "id": "tokio",
      "name": "tokio",
      "downloads": 519666345,
      "description": "An event-driven, non-blocking I/O platform...",
      "max_version": "1.49.0",
      ...
    }
  ],
  "meta": {
    "total": 13919,
    "next_page": "..."
  }
}
```

#### Get Crate Details
```
GET /api/v1/crates/{crate}
```

**Auth:** None for read operations
**Rate Limiting:** Yes
**Discovery Method:** Cargo internals

---

## 7. Lobste.rs JSON API

**Base URL:** `https://lobste.rs`

### Discovered Endpoints

#### Get Hottest Stories
```
GET /hottest.json
```

**Sample Response:**
```json
[
  {
    "short_id": "n4ddir",
    "created_at": "2026-02-08T14:12:27.000-06:00",
    "title": "Don't Get Distracted (2017)",
    "url": "https://...",
    "score": 96,
    "comment_count": 10,
    "tags": ["philosophy"],
    "comments_url": "https://lobste.rs/s/n4ddir/..."
  }
]
```

#### Other Story Endpoints
- `/newest.json` - Newest stories
- `/recent.json` - Recently active

**Auth:** None
**Rate Limiting:** Unknown
**Discovery Method:** URL pattern analysis

---

## 8. Lichess API

**Base URL:** `https://lichess.org/api`

### Discovered Endpoints

#### Get Daily Puzzle
```
GET /api/puzzle/daily
```

**Sample Response:**
```json
{
  "game": {
    "id": "VUTkk7ap",
    "perf": {"key": "rapid", "name": "Rapid"},
    "pgn": "c4 e5 g3 Nf6...",
    "clock": "10+5"
  },
  "puzzle": {
    "id": "Ff2My",
    "rating": 1985,
    "solution": ["f1e1", "e8g8", "d1e2"],
    "themes": ["middlegame", "short", "intermezzo", "advantage"]
  }
}
```

#### Get User Info
```
GET /api/user/{username}
```

**Auth:** None for public data
**Rate Limiting:** Yes
**Discovery Method:** Frontend API calls

---

## 9. DexScreener API (Solana)

**Base URL:** `https://api.dexscreener.com/latest/dex`

### Discovered Endpoints

#### Get Token Data
```
GET /latest/dex/tokens/{token_address}
```

**Sample Response:**
```json
{
  "schemaVersion": "1.0.0",
  "pairs": [
    {
      "chainId": "solana",
      "dexId": "raydium",
      "pairAddress": "3nMFwZ...",
      "baseToken": {
        "address": "So111...",
        "name": "Wrapped SOL",
        "symbol": "WSOL"
      },
      "priceUsd": "0.02191",
      "volume": {"h24": 289288.37},
      "liquidity": {"usd": 575745.41}
    }
  ]
}
```

#### Search Pairs
```
GET /latest/dex/search?q={query}
```

**Auth:** None
**Rate Limiting:** Yes
**Discovery Method:** Frontend network analysis

---

## 10. Wikipedia REST API

**Base URL:** `https://en.wikipedia.org/api/rest_v1`

### Discovered Endpoints

#### Get Page Summary
```
GET /api/rest_v1/page/summary/{title}
```

**Sample Response:**
```json
{
  "type": "standard",
  "title": "Solana (blockchain platform)",
  "pageid": 68695418,
  "thumbnail": {
    "source": "https://upload.wikimedia.org/...",
    "width": 316,
    "height": 316
  },
  "extract": "...",
  "content_urls": {...}
}
```

#### Traditional API
```
GET /w/api.php?action=query&titles={title}&format=json
```

**Auth:** None
**Rate Limiting:** Yes
**Discovery Method:** Frontend MediaWiki API

---

## 11. Stack Exchange API

**Base URL:** `https://api.stackexchange.com/2.3`

### Discovered Endpoints

#### Get Hot Questions
```
GET /2.3/questions?order=desc&sort=hot&site=stackoverflow&pagesize={n}
```

**Sample Response:**
```json
{
  "items": [
    {
      "tags": ["typescript"],
      "owner": {
        "reputation": 18196,
        "user_id": 544947,
        "display_name": "knocte"
      },
      "is_answered": false,
      "view_count": 23,
      "answer_count": 0,
      "score": -1,
      "title": "How to use `instanceof`...",
      "link": "https://stackoverflow.com/questions/79885876/..."
    }
  ]
}
```

**Auth:** Optional (API key for higher limits)
**Rate Limiting:** Yes, strict
**Discovery Method:** Official but internal usage patterns

---

## 12. Jupiter Aggregator API (Solana)

**Base URL:** `https://quote-api.jup.ag/v6`

### Discovered Endpoints

#### Get Swap Quote
```
GET /v6/quote?inputMint={mint1}&outputMint={mint2}&amount={amount}
```

Returns swap routing and pricing information

#### Get Token List
```
GET https://token.jup.ag/strict
```

Returns strict token list used by Jupiter

**Auth:** None
**Rate Limiting:** Yes
**Discovery Method:** Solana DEX frontend analysis

---

## 13. Raydium API (Solana)

**Base URL:** `https://api-v3.raydium.io`

### Discovered Endpoints

#### Get Pool List
```
GET /pools/info/list?poolType=all&poolSortField=default&sortType=desc&pageSize={n}&page={p}
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "data": [
      {
        "type": "Concentrated",
        "id": "3nMFwZ...",
        "mintA": {...},
        "mintB": {...},
        "price": 84.47,
        "tvl": 1789343.65,
        "volume": {...}
      }
    ]
  }
}
```

**Auth:** None
**Rate Limiting:** Yes
**Discovery Method:** Solana AMM frontend analysis

---

## 14. Magic Eden API (Solana)

**Base URL:** `https://api-mainnet.magiceden.dev/v2`

### Discovered Endpoints

#### Get Collections
```
GET /v2/collections?offset={offset}&limit={limit}
```

**Note:** offset and limit must be multiples of 20

**Sample Response:**
```json
[
  {
    "symbol": "dreamer_",
    "name": "Dreamer",
    "description": "...",
    "image": "https://...",
    "categories": ["pfps"],
    "isBadged": false,
    "hasCNFTs": false
  }
]
```

**Auth:** None for basic endpoints
**Rate Limiting:** Yes
**Discovery Method:** Solana NFT marketplace frontend

---

## Summary Statistics

- **Total APIs Documented:** 14
- **Solana-Specific:** 3 (Jupiter, Raydium, Magic Eden)
- **Authentication Required:** 2 (optional)
- **No Auth Required:** 12
- **Known Rate Limiting:** 11
- **Discovery Method:** Frontend reverse engineering

## Ethical Considerations

1. **Terms of Service:** Always check TOS before using internal APIs
2. **Rate Limiting:** Respect rate limits even if not enforced
3. **Caching:** Cache responses when possible to reduce load
4. **Attribution:** Credit the service when using their data
5. **Commercial Use:** May require permission or payment

## Usage Recommendations

1. **Wrap in try-catch:** Internal APIs can change without notice
2. **Monitor for changes:** Set up alerts for API failures
3. **Have fallbacks:** Don't rely solely on internal APIs
4. **User-Agent:** Identify yourself in requests
5. **Throttle:** Self-impose rate limits

## Future Work

Additional APIs to explore:
- Twitter/X internal GraphQL API
- GitHub internal API patterns
- ProductHunt GraphQL endpoints
- Birdeye Solana API
- CoinGecko internal endpoints
- Phantom wallet API

---

**Last Updated:** February 9, 2026
**Maintainer:** Unbrowse Project
**License:** Documentation only - API usage governed by respective service TOS
