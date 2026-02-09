# Genderize API

Predict gender from name.

**Base URL:** `https://api.genderize.io`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /?name={name}
Predict gender from name
- **Query:** `name` (string)
- **Response:** { "name": "...", "gender": "male"/"female", "probability": number, "count": number }
