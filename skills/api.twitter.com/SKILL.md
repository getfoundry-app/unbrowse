# Twitter API

Twitter/X API endpoints.

**Base URL:** `https://api.twitter.com/2`

**Auth:** Bearer token required

**Status:** ⚠️ Requires Auth

## Endpoints

### GET /tweets/{id}
Get tweet by ID
- **Params:** `id` (tweet ID)
- **Auth:** Bearer token required

### GET /users/{id}
Get user by ID
- **Params:** `id` (user ID)
- **Auth:** Bearer token required

### GET /tweets/search/recent
Search recent tweets
- **Query:** `query` (search term)
- **Auth:** Bearer token required

**Note:** Public endpoints are limited. Most functionality requires API key and authentication.
