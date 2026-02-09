# SpaceX API

SpaceX launch, rocket, and crew data.

**Base URL:** `https://api.spacexdata.com/v5`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /launches/latest
Get latest launch
- **Response:** Launch object

### GET /launches
Get all launches
- **Response:** Array of Launch objects

### GET /launches/{id}
Get specific launch
- **Params:** `id` (string)
- **Response:** Launch object

### GET /rockets
Get all rockets
- **Response:** Array of Rocket objects

### GET /crew
Get all crew members
- **Response:** Array of Crew objects
