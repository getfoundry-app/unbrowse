# Binance API

Crypto exchange data.

**Base URL:** `https://api.binance.com/api/v3`

**Auth:** API key for trading (not needed for market data)

**Status:** ✅ Verified

## Endpoints

### GET /ticker/price
Get current prices
- **Query:** `symbol` (optional, e.g., BTCUSDT)

### GET /ticker/24hr
Get 24hr ticker statistics

### GET /depth
Get order book depth
- **Query:** `symbol` (required), `limit` (optional)

### GET /klines
Get candlestick data
- **Query:** `symbol`, `interval` (e.g., 1m, 1h, 1d)
