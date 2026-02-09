# Unbrowse OpenClaw Plugin

**Internal APIs Are All You Need** — capture, generate, and replay web APIs at 100x the speed of browser automation.

## Overview

This OpenClaw plugin provides 5 agent tools that enable AI agents to discover, learn, and interact with web APIs directly without browser automation:

## Tools

### 1. `unbrowse_capture`
Visit a URL and capture the internal API calls the website makes.

**Parameters:**
- `url` (required): URL to visit and capture API traffic from
- `waitMs` (optional): Extra milliseconds to wait for API calls (default: 2000)

**Returns:** Discovered endpoints, headers, response preview

### 2. `unbrowse_learn`
Parse captured API traffic (HAR format or endpoint list) and generate a typed SKILL.md + api.ts client.

**Parameters:**
- `domain` (required): The domain to generate a skill for
- `endpoints` (optional): Array of observed endpoints with method and path
- `harContent` (optional): Raw HAR JSON content
- `authMethod` (optional): Auth method (bearer, apikey, session, none)

**Returns:** Generated skill files saved to `skills/{domain}/`

### 3. `unbrowse_replay`
Execute a web API call directly without browser automation. 100x faster than Puppeteer/Playwright.

**Parameters:**
- `url` (required): Full URL to call
- `method` (optional): HTTP method (default: GET)
- `headers` (optional): Request headers object
- `body` (optional): Request body for POST/PUT

**Returns:** Status, latency, and response data

### 4. `unbrowse_search`
Search the Unbrowse skill marketplace for pre-built API skills.

**Parameters:**
- `query` (required): Search query (domain name, keyword, or tag)
- `serverUrl` (optional): Marketplace server URL (default: http://localhost:4111)

**Returns:** Matching skills from the marketplace

### 5. `unbrowse_skills`
List all locally generated API skills.

**Parameters:** None

**Returns:** List of skills with domain, endpoint count, and API client status

## Installation

1. Link or copy this plugin to your OpenClaw plugins directory
2. OpenClaw will automatically discover and register the tools
3. Configure the plugin via `openclaw.plugin.json` config schema

## Configuration

```json
{
  "skillsDir": "path/to/skills",
  "serverUrl": "http://localhost:4111",
  "autoDiscover": true,
  "creatorWallet": "your-solana-wallet-address"
}
```

## Usage Example

```typescript
// Capture API traffic
await unbrowse_capture({ url: "https://api.example.com/users" });

// Generate a skill from endpoints
await unbrowse_learn({
  domain: "api.example.com",
  endpoints: [
    { method: "GET", path: "/users" },
    { method: "POST", path: "/users" }
  ],
  authMethod: "bearer"
});

// Replay an API call
await unbrowse_replay({
  url: "https://api.example.com/users/123",
  method: "GET",
  headers: { "Authorization": "Bearer token" }
});

// List generated skills
await unbrowse_skills();
```

## License

MIT
