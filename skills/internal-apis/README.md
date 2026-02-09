# Internal APIs Collection

This directory contains reverse-engineered documentation of INTERNAL APIs discovered by analyzing website frontend requests.

## ⚠️ IMPORTANT DISCLAIMER

These APIs are:
- **NOT officially documented** by their respective services
- **Discovered through reverse engineering** frontend network requests
- **Subject to change** without notice
- **May violate Terms of Service** - always check before using
- **Not guaranteed to be stable**
- **Provided for educational purposes**

**USE AT YOUR OWN RISK.**

## What Makes These "Internal"?

These are the **actual HTTP endpoints** that websites' frontends call, as opposed to:
- Public, documented REST APIs
- GraphQL endpoints clearly marked as public
- Official SDKs and libraries

Instead, these are:
- Endpoints found by analyzing XHR/fetch requests in browser DevTools
- API calls made by JavaScript bundles
- Internal microservices exposed to frontends
- Undocumented JSON endpoints

## Discovery Methodology

For each API documented here, we:

1. **Load the website** in a browser
2. **Open DevTools** → Network tab
3. **Interact with the site** (browse, search, filter, etc.)
4. **Analyze HTTP requests** to identify API patterns
5. **Document endpoints, parameters, and responses**
6. **Test with curl/fetch** to verify
7. **Reverse engineer** authentication if present

## Why Document Internal APIs?

### Benefits
- **No SDK dependencies** - Direct HTTP calls
- **Faster** - Skip abstractions
- **More features** - Access what frontend uses
- **Real-time data** - Same as the website sees
- **Lightweight** - No heavy SDKs

### Risks
- **Unstable** - Can break anytime
- **Legal concerns** - May violate TOS
- **Rate limiting** - May be more aggressive
- **Lack of support** - No official help
- **Ethical questions** - Reverse engineering concerns

## Documented APIs

### Solana Ecosystem (for Hackathon!)
1. **[Jupiter Aggregator](../jupiter-aggregator/SKILL.md)** - DEX aggregation and routing
2. **[Raydium AMM](../raydium-amm/SKILL.md)** - AMM pool data and liquidity
3. **Magic Eden** - NFT marketplace (to be documented)

### Developer Communities
4. **[Hacker News Firebase](../hackernews-firebase/SKILL.md)** - Stories, comments, users
5. **Dev.to** - Articles and tags API
6. **Reddit JSON** - Subreddit content via .json suffix
7. **Lobste.rs** - Aggregator JSON feeds

### Package Registries
8. **NPM Registry** - Package metadata
9. **PyPI API** - Python package info
10. **Crates.io** - Rust package search

### Other Services
11. **Lichess** - Chess puzzles and games
12. **DexScreener** - DeFi token data
13. **Wikipedia REST** - Page summaries
14. **Stack Exchange** - Q&A data

## Full Catalog

See **[INTERNAL_CATALOG.md](./INTERNAL_CATALOG.md)** for:
- Complete endpoint documentation
- Sample requests and responses
- Authentication requirements
- Rate limiting info
- Discovery notes

## How to Use This Documentation

### 1. Read the Warning
Always check the service's Terms of Service before using internal APIs.

### 2. Understand the Risk
Internal APIs can change without notice. Your app may break.

### 3. Implement Gracefully
```typescript
async function callInternalAPI(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('API may have changed');
      return fallbackData;
    }
    return response.json();
  } catch (error) {
    console.error('Internal API failed:', error);
    return fallbackData;
  }
}
```

### 4. Cache Aggressively
Don't hammer internal APIs. Cache responses:
```typescript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getCached(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  const data = await fetcher();
  cache.set(key, { data, time: Date.now() });
  return data;
}
```

### 5. Have Fallbacks
Always have a backup plan:
- Switch to official API if available
- Implement scraping fallback
- Cache historical data
- Show cached/stale data with warning

## Ethical Guidelines

### DO:
✅ Respect rate limits (self-impose if needed)  
✅ Cache responses appropriately  
✅ Identify your app in User-Agent  
✅ Check Terms of Service  
✅ Use for learning and personal projects  
✅ Attribute data sources  

### DON'T:
❌ Hammer APIs with excessive requests  
❌ Resell data without permission  
❌ Bypass authentication  
❌ Ignore rate limiting  
❌ Claim data as your own  
❌ Use for malicious purposes  

## Contributing

Found a new internal API? Want to document one?

### Documentation Template

Create a new directory: `skills/service-name/`

Include:
- `SKILL.md` - Full API documentation
- `api.ts` - TypeScript client (optional)
- `examples/` - Usage examples

### What to Include

1. **Discovery method** - How you found it
2. **Base URL** - API base endpoint
3. **Authentication** - If required
4. **Endpoints** - All discovered endpoints
5. **Parameters** - Query params and bodies
6. **Response formats** - JSON structures
7. **Rate limits** - If known
8. **Examples** - curl, TS, Python
9. **Warnings** - TOS concerns, stability

## Testing Internal APIs

### Quick Test with curl
```bash
# Test endpoint availability
curl -I "https://api.example.com/endpoint"

# Get response
curl -s "https://api.example.com/endpoint" | jq .

# Check response time
time curl -s "https://api.example.com/endpoint" > /dev/null
```

### Monitor for Changes
Set up monitoring:
```bash
# Cron job to check API
*/30 * * * * curl -s "https://api.example.com/endpoint" | 
  md5sum > /tmp/api-check.txt && 
  diff /tmp/api-check.txt /tmp/api-check-prev.txt || 
  echo "API changed!"
```

## Legal Considerations

### Terms of Service
Many services explicitly prohibit:
- Reverse engineering
- Automated access
- Data scraping
- Bypassing rate limits

**Always read and respect TOS.**

### Fair Use
Consider if your use is:
- **Transformative** - Adding value, not just copying
- **Attribution** - Crediting the source
- **Non-commercial** - Personal/educational use
- **Limited** - Not excessive requests
- **Respectful** - Not harming the service

### When to Avoid
Don't use internal APIs if:
- Official API exists and is reasonable
- TOS explicitly forbids it
- Service is small/struggling
- Use would cause harm
- Commercial/high-stakes project

## Alternatives to Internal APIs

Before using internal APIs, consider:

1. **Official APIs** - Check if one exists
2. **Official SDKs** - May handle auth/limits
3. **RSS/Atom feeds** - Often available
4. **Webhooks** - For real-time updates
5. **Browser extensions** - With user consent
6. **Partnerships** - Request official access

## Unbrowse Philosophy

Unbrowse is about:
- **Speed** - Direct API calls, no SDK overhead
- **Transparency** - Know exactly what's called
- **Control** - No black box abstractions
- **Learning** - Understanding how sites work

But with great power comes great responsibility:
- Use ethically
- Respect services
- Don't abuse access
- Contribute back

## Support & Updates

- **Issues:** Report broken APIs via GitHub
- **Updates:** Watch for API changes
- **Community:** Share discoveries responsibly
- **Unbrowse Discord:** [Link TBD]

## Resources

### Reverse Engineering Tools
- **Browser DevTools** - Network tab
- **Burp Suite** - HTTP proxy
- **mitmproxy** - Transparent proxy
- **Postman** - API testing
- **Insomnia** - REST client

### Learning Resources
- MDN Web Docs - HTTP headers, methods
- OWASP - Security considerations
- RFC 7231 - HTTP/1.1 semantics
- API design patterns

## Changelog

- **2026-02-09:** Initial collection created
- 14 APIs documented
- Focus on Solana ecosystem for hackathon

---

**Remember:** With great power comes great responsibility. Use internal APIs ethically and respect the services that provide them.

**Project:** Unbrowse  
**Hackathon:** Solana Grizzlython x Colosseum  
**Team:** OpenClaw  
**Date:** February 2026
