# httpbin API

HTTP testing service.

**Base URL:** `https://httpbin.org`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /get
Returns GET request data
- **Response:** JSON with args, headers, origin, url

### POST /post
Returns POST request data
- **Response:** JSON with data, form, json, args, headers, origin, url

### GET /ip
Returns origin IP
- **Response:** { "origin": "ip" }

### GET /user-agent
Returns user-agent
- **Response:** { "user-agent": "..." }

### GET /headers
Returns request headers
- **Response:** { "headers": {...} }

### GET /status/{code}
Returns given HTTP status code
- **Params:** `code` (number)
- **Response:** Status code response

### GET /delay/{delay}
Delayed response
- **Params:** `delay` (seconds, max 10)
- **Response:** Delayed GET response

### GET /uuid
Returns UUID4
- **Response:** { "uuid": "..." }
