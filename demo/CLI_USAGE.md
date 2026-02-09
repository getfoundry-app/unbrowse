# Unbrowse CLI - Quick Start

The Unbrowse CLI is a tool for capturing, learning, and managing API skills.

## Installation

No installation needed! Run directly with tsx:

```bash
npx tsx packages/extension/src/cli.ts <command>
```

## Quick Demo

```bash
# Learn from the sample HAR file
npx tsx packages/extension/src/cli.ts learn demo/sample.har

# List local skills
npx tsx packages/extension/src/cli.ts skills

# Show server stats
npx tsx packages/extension/src/cli.ts stats
```

## Commands

### `learn <har-file>`
Parse a HAR file and generate a skill with SKILL.md + api.ts

**Example:**
```bash
npx tsx packages/extension/src/cli.ts learn demo/sample.har
```

This will:
- Parse the HAR file
- Extract API endpoints
- Detect authentication method
- Generate TypeScript client code
- Save to `./skills/<domain>/`

### `capture <url>`
Capture API traffic from a URL

**Example:**
```bash
npx tsx packages/extension/src/cli.ts capture https://api.example.com
```

**For full capture with Chrome DevTools Protocol:**
```bash
# 1. Start Chrome with debugging port
chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug

# 2. Run capture
npx tsx packages/extension/src/cli.ts capture https://example.com
```

### `skills`
List all local skills

**Example:**
```bash
npx tsx packages/extension/src/cli.ts skills
```

Shows:
- Domain name
- Number of endpoints
- Authentication method
- File status (✓ or ✗)

### `stats`
Show marketplace and server statistics

**Example:**
```bash
npx tsx packages/extension/src/cli.ts stats
```

Requires the API server running on localhost:4111

### `search <query>`
Search the marketplace for skills

**Example:**
```bash
npx tsx packages/extension/src/cli.ts search "weather"
```

### `replay <ability-id>`
Execute an ability by ID

**Example:**
```bash
npx tsx packages/extension/src/cli.ts replay abc123
```

## Creating HAR Files

### Method 1: Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Click "Export HAR" button
4. Save as `demo/mysite.har`
5. Run `npx tsx packages/extension/src/cli.ts learn demo/mysite.har`

### Method 2: CDP Capture
1. Start Chrome with debugging:
   ```bash
   chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
   ```
2. Visit your target site and interact with it
3. Run capture:
   ```bash
   npx tsx packages/extension/src/cli.ts capture https://yoursite.com
   ```

## Generated Skill Structure

```
skills/
└── example.com/
    ├── SKILL.md       # Human-readable documentation
    └── api.ts         # TypeScript API client
```

### SKILL.md
Contains:
- Domain name
- Authentication method
- List of endpoints with descriptions
- Original paths and fingerprints

### api.ts
Contains:
- TypeScript client functions
- Request/response types
- Authentication helpers
- Ready-to-use API methods

## Example Workflow

```bash
# 1. Capture traffic from a site
npx tsx packages/extension/src/cli.ts capture https://jsonplaceholder.typicode.com/posts

# 2. Learn from the captured HAR
npx tsx packages/extension/src/cli.ts learn demo/capture-*.har

# 3. View generated skills
npx tsx packages/extension/src/cli.ts skills

# 4. Use the generated API client
cd skills/jsonplaceholder.typicode.com
cat api.ts  # See the generated code
```

## Tips

- **Filtering:** HAR parser automatically filters out analytics, static assets, and non-JSON responses
- **Authentication:** CLI detects Bearer tokens, API keys, and session cookies automatically
- **Normalization:** Paths with IDs (like `/posts/123`) are normalized to `/posts/{id}`
- **Deduplication:** Similar endpoints are merged using fingerprinting

## Troubleshooting

### "HAR file not found"
Make sure the path is correct relative to your current directory.

### "No API requests found"
The HAR file might contain only static assets. Try:
- Recording XHR/Fetch requests only in DevTools
- Interacting more with the site before exporting
- Checking that responses are JSON

### "CDP capture failed"
Chrome DevTools Protocol requires Chrome running with `--remote-debugging-port=9222`. 
If not available, the CLI will fall back to a simple fetch.

### "Make sure the API server is running"
The `stats`, `search`, and `replay` commands require the backend server running on localhost:4111.
Start it with: `cd packages/backend && npm run dev`

## Advanced Usage

### Custom Chrome debugging port
```bash
export CDP_ENDPOINT=ws://localhost:9223
npx tsx packages/extension/src/cli.ts capture https://example.com
```

### Batch learning
```bash
for har in demo/*.har; do
  npx tsx packages/extension/src/cli.ts learn "$har"
done
```

### Integration with CI/CD
```bash
# Run as part of API documentation generation
npx tsx packages/extension/src/cli.ts learn api-traffic.har
git add skills/
git commit -m "Update API skills"
```
