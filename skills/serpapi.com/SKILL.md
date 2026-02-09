# SerpAPI

Google Search API.

**Base URL:** `https://serpapi.com`

**Auth:** API key required

**Status:** ⚠️ Requires API Key

## Endpoints

### GET /search
Google search results
- **Query:** `q` (search query), `api_key` (required), `engine` (google, bing, etc.)

### GET /search.json
JSON format search results
- **Query:** `q`, `api_key`, `location`, `hl` (language)

**Note:** SerpAPI provides scraped search results from various search engines.
