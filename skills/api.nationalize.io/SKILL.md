# Nationalize API

Predict nationality from name.

**Base URL:** `https://api.nationalize.io`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /?name={name}
Predict nationality from name
- **Query:** `name` (string)
- **Response:** { "name": "...", "country": [{ "country_id": "US", "probability": 0.5 }] }
