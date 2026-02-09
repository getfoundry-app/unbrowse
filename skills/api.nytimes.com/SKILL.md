# New York Times API

NYT articles, books, movies, and more.

**Base URL:** `https://api.nytimes.com/svc`

**Auth:** API key required

**Status:** ⚠️ Requires API Key

## Endpoints

### GET /topstories/v2/{section}.json
Get top stories by section
- **Params:** `section` (home, arts, business, etc.)
- **Query:** `api-key` (required)

### GET /search/v2/articlesearch.json
Search articles
- **Query:** `q` (search query), `api-key` (required)

### GET /books/v3/lists/current/hardcover-fiction.json
Get bestseller lists
- **Query:** `api-key` (required)
