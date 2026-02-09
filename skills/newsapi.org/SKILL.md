# News API

News headlines and articles.

**Base URL:** `https://newsapi.org/v2`

**Auth:** API key required

**Status:** ⚠️ Requires API Key

## Endpoints

### GET /top-headlines
Get top headlines
- **Query:** `apiKey` (required), `country`, `category`, `q` (search)

### GET /everything
Search all articles
- **Query:** `apiKey` (required), `q` (search query), `sources`, `from`, `to`, `sortBy`

### GET /sources
Get news sources
- **Query:** `apiKey` (required)
