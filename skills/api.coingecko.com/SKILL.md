# CoinGecko API

Cryptocurrency price, market data, and more.

**Base URL:** `https://api.coingecko.com/api/v3`

**Auth:** None required (API key optional for higher limits)

**Status:** ✅ Verified

## Endpoints

### GET /simple/price
Get current price of cryptocurrencies
- **Query:** `ids` (comma-separated coin ids), `vs_currencies` (comma-separated currencies)
- **Response:** Object with prices

### GET /coins/markets
Get market data for coins
- **Query:** `vs_currency`, `ids`, `order`, `per_page`, `page`, `sparkline`
- **Response:** Array of market data

### GET /coins/{id}
Get full data for a coin
- **Params:** `id` (coin id, e.g., 'bitcoin')
- **Query:** `localization`, `tickers`, `market_data`, `community_data`, `developer_data`
- **Response:** Detailed coin object

### GET /coins/list
List all supported coins
- **Response:** Array of coin objects with id, symbol, name

### GET /search/trending
Get trending search coins
- **Response:** Trending coins data
