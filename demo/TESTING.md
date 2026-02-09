# CLI Testing Guide

This document describes how to test the Unbrowse CLI functionality.

## Manual Testing Checklist

### ✅ Basic Commands

1. **Help Command**
   ```bash
   npx tsx packages/extension/src/cli.ts --help
   ```
   Expected: Shows full help text with all commands

2. **Learn Command with Sample HAR**
   ```bash
   npx tsx packages/extension/src/cli.ts learn demo/sample.har
   ```
   Expected:
   - Parses HAR successfully
   - Shows "Found 8 API requests"
   - Shows "Domain: jsonplaceholder.typicode.com"
   - Shows "Auth method: none"
   - Creates files in `skills/jsonplaceholder.typicode.com/`
   - Generates SKILL.md and api.ts

3. **Skills Command**
   ```bash
   npx tsx packages/extension/src/cli.ts skills
   ```
   Expected:
   - Lists all local skills
   - Shows checkmarks for SKILL.md and api.ts
   - Shows endpoint count and auth method

4. **Stats Command** (requires server running)
   ```bash
   npx tsx packages/extension/src/cli.ts stats
   ```
   Expected:
   - Shows marketplace statistics
   - Shows server status as online
   - Displays total skills, downloads, executions

5. **Capture Command** (fallback mode)
   ```bash
   npx tsx packages/extension/src/cli.ts capture https://jsonplaceholder.typicode.com/posts/1
   ```
   Expected:
   - Attempts CDP connection
   - Falls back to direct fetch
   - Shows response status and content-type
   - Displays instructions for Chrome debugging

### ✅ Generated Output Verification

**Check SKILL.md:**
```bash
cat skills/jsonplaceholder.typicode.com/SKILL.md
```

Should contain:
- Domain name as header
- Authentication method section
- List of endpoints with methods (GET, POST, PUT, DELETE)
- Original paths and fingerprints

**Check api.ts:**
```bash
cat skills/jsonplaceholder.typicode.com/api.ts
```

Should contain:
- BASE_URL constant
- RequestOptions interface
- Auth helper function
- Exported async functions for each endpoint
- Proper parameter handling for IDs

### ✅ Error Handling

1. **Non-existent HAR file**
   ```bash
   npx tsx packages/extension/src/cli.ts learn nonexistent.har
   ```
   Expected: Error message "HAR file not found"

2. **Missing arguments**
   ```bash
   npx tsx packages/extension/src/cli.ts learn
   ```
   Expected: Error "Missing HAR file argument"

3. **Unknown command**
   ```bash
   npx tsx packages/extension/src/cli.ts foobar
   ```
   Expected: Error "Unknown command: foobar"

4. **Server unavailable**
   ```bash
   # Stop the server first
   npx tsx packages/extension/src/cli.ts search "test"
   ```
   Expected: Error with helpful message about starting server

## Integration Tests

The `cli.test.ts` file contains comprehensive integration tests:

```bash
# Run all CLI tests
cd packages/extension
npm test cli.test.ts
```

Test coverage includes:
- ✅ HAR parsing and skill generation
- ✅ Multiple authentication methods (bearer, apikey, none)
- ✅ Skills listing functionality
- ✅ Help command and documentation
- ✅ Error handling for all edge cases
- ✅ Output file verification
- ✅ Capture fallback mode

## Advanced Testing

### Testing with Chrome DevTools Protocol

1. **Start Chrome with debugging**
   ```bash
   google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug &
   ```

2. **Open a page with API traffic**
   - Navigate to https://jsonplaceholder.typicode.com
   - Open DevTools console
   - Run: `fetch('/posts').then(r => r.json()).then(console.log)`

3. **Capture with CLI**
   ```bash
   npx tsx packages/extension/src/cli.ts capture https://jsonplaceholder.typicode.com/posts
   ```
   Expected:
   - Successfully connects to CDP
   - Captures XHR/Fetch requests
   - Filters out analytics and static assets
   - Saves HAR file to demo/ directory

### Testing Authentication Detection

**Create test HAR files for different auth methods:**

**Bearer Token:**
```json
{
  "log": {
    "entries": [{
      "request": {
        "url": "https://api.example.com/data",
        "headers": [
          {"name": "Authorization", "value": "Bearer eyJhbGc..."}
        ]
      },
      "response": {"status": 200, "content": {"mimeType": "application/json"}},
      "_resourceType": "xhr"
    }]
  }
}
```

**API Key:**
```json
{
  "log": {
    "entries": [{
      "request": {
        "url": "https://api.example.com/data",
        "headers": [
          {"name": "X-Api-Key", "value": "sk-abc123"}
        ]
      },
      "response": {"status": 200, "content": {"mimeType": "application/json"}},
      "_resourceType": "fetch"
    }]
  }
}
```

**Session Cookie:**
```json
{
  "log": {
    "entries": [{
      "request": {
        "url": "https://api.example.com/data",
        "headers": [
          {"name": "Cookie", "value": "session_id=xyz789; path=/"}
        ]
      },
      "response": {"status": 200, "content": {"mimeType": "application/json"}},
      "_resourceType": "xhr"
    }]
  }
}
```

### Testing Endpoint Normalization

The CLI should properly normalize paths with IDs:

Input paths:
- `/users/123` → `/users/{id}`
- `/posts/456/comments` → `/posts/{id}/comments`
- `/api/v1/items/789` → `/api/v1/items/{id}`

Verify in generated SKILL.md that paths are normalized correctly.

## Performance Testing

Test with large HAR files:

```bash
# Create a HAR with 100+ requests
# Export from a complex single-page app

time npx tsx packages/extension/src/cli.ts learn large-app.har
```

Should complete in < 5 seconds for 100 requests.

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: CLI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test cli.test.ts
      - run: npx tsx packages/extension/src/cli.ts learn demo/sample.har
      - run: npx tsx packages/extension/src/cli.ts skills
```

## Known Issues & Edge Cases

### Issue: Duplicate function names in api.ts
When multiple endpoints have the same normalized path (e.g., `GET /posts` and `GET /posts/{id}`), 
function names may collide. Current behavior generates `getPosts` twice.

**Workaround:** Manual editing of generated api.ts or add suffix like `getPostsById`.

### Issue: CDP timeout on slow connections
The capture command may timeout if the target site is slow or requires interaction.

**Workaround:** Increase waitMs in capture options or manually export HAR from DevTools.

### Edge Case: Nested path parameters
Paths like `/api/{v}/users/{id}` are currently normalized to `/api/{id}/users/{id}`.

**Expected behavior:** Should preserve multiple ID placeholders distinctly.

## Test Results

Last tested: 2026-02-09

| Test | Status | Notes |
|------|--------|-------|
| Help command | ✅ Pass | Shows all commands with colors |
| Learn from sample.har | ✅ Pass | Generates 8 endpoints correctly |
| Skills listing | ✅ Pass | Shows skill metadata |
| Stats (server running) | ✅ Pass | Displays marketplace stats |
| Capture fallback | ✅ Pass | Falls back to fetch gracefully |
| Error handling | ✅ Pass | Clear error messages |
| Auth detection | ✅ Pass | Detects bearer, apikey, none |
| Path normalization | ✅ Pass | Converts numeric IDs to {id} |

## Contributing

When adding new CLI features:

1. Update this testing guide
2. Add integration tests in `cli.test.ts`
3. Update `demo/CLI_USAGE.md` documentation
4. Run full test suite before committing
5. Test manually with `demo/sample.har`

## Debugging

Enable verbose output:
```bash
DEBUG=unbrowse:* npx tsx packages/extension/src/cli.ts learn demo/sample.har
```

View generated files:
```bash
tree skills/
```

Check for syntax errors in generated code:
```bash
npx tsc --noEmit skills/*/api.ts
```
