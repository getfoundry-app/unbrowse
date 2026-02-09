# OpenWeatherMap API

Weather data API.

**Base URL:** `https://api.openweathermap.org/data/2.5`

**Auth:** API key required

**Status:** ⚠️ Requires API Key

## Endpoints

### GET /weather
Get current weather
- **Query:** `q` (city name), `appid` (API key), `units` (metric/imperial)

### GET /forecast
Get 5-day forecast
- **Query:** `q` (city name), `appid` (API key), `units` (metric/imperial)

### GET /weather?lat={lat}&lon={lon}
Get weather by coordinates
- **Query:** `lat`, `lon`, `appid`, `units`
