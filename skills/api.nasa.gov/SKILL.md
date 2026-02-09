# NASA API

NASA data APIs.

**Base URL:** `https://api.nasa.gov`

**Auth:** API key recommended (use DEMO_KEY for testing)

**Status:** ✅ Verified

## Endpoints

### GET /planetary/apod
Astronomy Picture of the Day
- **Query:** `api_key`, `date` (optional)

### GET /mars-photos/api/v1/rovers/curiosity/photos
Mars Rover Photos
- **Query:** `api_key`, `sol` or `earth_date`, `camera` (optional)
