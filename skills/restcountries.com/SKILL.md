# REST Countries API

Get information about countries.

**Base URL:** `https://restcountries.com/v3.1`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /all
Get all countries
- **Response:** Array of Country objects

### GET /name/{name}
Search by country name
- **Params:** `name` (string)
- **Query:** `fullText` (boolean)
- **Response:** Array of Country objects

### GET /alpha/{code}
Get country by alpha code (USA, FR, etc.)
- **Params:** `code` (2 or 3 letter code)
- **Response:** Array with single Country object

### GET /capital/{capital}
Search by capital city
- **Params:** `capital` (string)
- **Response:** Array of Country objects

### GET /region/{region}
Get countries by region
- **Params:** `region` (africa, americas, asia, europe, oceania)
- **Response:** Array of Country objects
