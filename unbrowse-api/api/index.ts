import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
// Edge-compatible hash

export const config = { runtime: "edge" };

const app = new Hono().basePath("/");
app.use("*", cors({ origin: "*" }));

// ── Types ──────────────────────────────────────────────────────────────

interface Skill {
  id: string; name: string; domain: string; description: string;
  skillMd: string; apiTemplate?: string; tags: string[];
  price: number; creatorWallet?: string; userId: string;
  version: string; versionHash: string; downloads: number; createdAt: number;
}

interface Ability {
  id: string; name: string; description: string; domain: string;
  method: string; path: string; originalPath: string; fingerprint: string;
  verified: boolean; healthScore: number; totalExecutions: number;
  successCount: number; avgLatencyMs: number; userId: string; createdAt: number;
}

interface ExecutionLog {
  userId: string; abilityId: string; success: boolean;
  statusCode?: number; latencyMs?: number; timestamp: number;
}

// ── Storage (in-memory, resets on cold start) ──────────────────────────

const skills = new Map<string, Skill>();
const abilities = new Map<string, Ability>();
const executions: ExecutionLog[] = [];
const seenFingerprints = new Set<string>();

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
function hashContent(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) - h + content.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(16, '0').slice(0, 16);
}
function updateHealthScore(a: Ability): void {
  if (a.totalExecutions === 0) return;
  a.healthScore = Math.round((a.successCount / a.totalExecutions) * 100);
}

// Simple route normalizer (no external dep)
function normalizeRoute(path: string): string {
  return path.replace(/\{[^}]+\}/g, (m) => m); // keep as-is
}
function fingerprint(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

function parseEndpointsFromMarkdown(md: string, domain: string) {
  const results: { method: string; path: string; originalPath: string; description: string }[] = [];
  const re = /^[-*]\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s*[-–—]?\s*(.*)/gim;
  let m;
  while ((m = re.exec(md)) !== null) {
    results.push({ method: m[1].toUpperCase(), path: normalizeRoute(m[2]), originalPath: m[2], description: m[3]?.trim() || "" });
  }
  return results;
}

// ── Seed ───────────────────────────────────────────────────────────────

function seedData() {
  const seeds = [
    { name: "JSONPlaceholder CRUD", domain: "jsonplaceholder.typicode.com", description: "Full CRUD operations for JSONPlaceholder fake REST API", skillMd: "# JSONPlaceholder CRUD\n\n## Endpoints\n\n- GET /posts - List all posts\n- GET /posts/{id} - Get a single post\n- POST /posts - Create a post\n- PUT /posts/{id} - Update a post\n- DELETE /posts/{id} - Delete a post\n- GET /posts/{id}/comments - Get comments for a post", tags: ["rest","json","crud","demo"], price: 0 },
    { name: "GitHub REST API", domain: "api.github.com", description: "Core GitHub API endpoints for repos, users, and issues", skillMd: "# GitHub REST API\n\n## Endpoints\n\n- GET /users/{id} - Get user profile\n- GET /users/{id}/repos - List user repos\n- GET /repos/{owner}/{repo} - Get repo details\n- GET /repos/{owner}/{repo}/issues - List issues", tags: ["github","developer","api"], price: 0 },
    { name: "OpenWeatherMap", domain: "api.openweathermap.org", description: "Weather data API - current weather, forecasts, and geocoding", skillMd: "# OpenWeatherMap\n\n## Endpoints\n\n- GET /data/2.5/weather - Current weather by city\n- GET /data/2.5/forecast - 5-day forecast\n- GET /geo/1.0/direct - Geocode city name", tags: ["weather","forecast"], price: 0 },
    { name: "Stripe Payments", domain: "api.stripe.com", description: "Stripe payment processing endpoints", skillMd: "# Stripe Payments\n\n## Endpoints\n\n- POST /v1/charges - Create a charge\n- GET /v1/charges/{id} - Retrieve a charge\n- POST /v1/customers - Create a customer\n- POST /v1/payment_intents - Create payment intent", tags: ["payments","fintech"], price: 500 },
    { name: "CoinGecko", domain: "api.coingecko.com", description: "Crypto market data - prices, charts, market caps for 10,000+ coins", skillMd: "# CoinGecko\n\n## Endpoints\n\n- GET /api/v3/coins/markets - List coins with market data\n- GET /api/v3/simple/price - Get price by coin id\n- GET /api/v3/coins/{id} - Get coin details\n- GET /api/v3/coins/{id}/market_chart - Price chart data\n- GET /api/v3/search - Search coins", tags: ["crypto","prices","defi"], price: 0 },
    { name: "Helius RPC", domain: "api.helius.xyz", description: "Solana RPC endpoints — transactions, balances, NFT data, DAS", skillMd: "# Helius RPC\n\n## Endpoints\n\n- GET /v0/addresses/{address}/balances - Get token balances\n- GET /v0/addresses/{address}/transactions - Transaction history\n- POST /v0/token-metadata - Batch token metadata\n- GET /v0/addresses/{address}/nfts - Get NFTs", tags: ["solana","rpc","nft"], price: 0 },
    { name: "Jupiter Aggregator", domain: "quote-api.jup.ag", description: "Solana DEX aggregator — optimal swap routes and price quotes", skillMd: "# Jupiter Aggregator\n\n## Endpoints\n\n- GET /v6/quote - Get swap quote\n- POST /v6/swap - Execute swap transaction\n- GET /v6/tokens - List supported tokens\n- GET /v6/price - Get token price", tags: ["solana","defi","swap"], price: 0 },
    { name: "Magic Eden", domain: "api-mainnet.magiceden.dev", description: "NFT marketplace — listings, collections, floor prices", skillMd: "# Magic Eden\n\n## Endpoints\n\n- GET /v2/collections - List collections\n- GET /v2/collections/{symbol}/stats - Collection stats\n- GET /v2/collections/{symbol}/listings - Active listings\n- GET /v2/tokens/{mint} - Token details", tags: ["nft","marketplace","solana"], price: 0 },
    { name: "Birdeye Analytics", domain: "public-api.birdeye.so", description: "Solana DeFi analytics — token security, volume, price data", skillMd: "# Birdeye Analytics\n\n## Endpoints\n\n- GET /defi/tokenlist - List tokens\n- GET /defi/price - Get token price\n- GET /defi/history_price - Historical price\n- GET /defi/token_security - Token security check\n- GET /defi/v3/token/trade-data/single - Trade data", tags: ["solana","analytics","defi"], price: 0 },
    { name: "Tensor NFT", domain: "api.tensor.so", description: "Solana NFT analytics and trading", skillMd: "# Tensor NFT\n\n## Endpoints\n\n- GET /api/v1/collections - Trending collections\n- GET /api/v1/mint/{mint} - NFT details\n- GET /api/v1/collections/{slug}/floor - Floor price", tags: ["nft","solana","trading"], price: 0 },
    { name: "Phantom Wallet", domain: "api.phantom.app", description: "Phantom wallet API for Solana dApp integration", skillMd: "# Phantom Wallet\n\n## Endpoints\n\n- GET /api/v1/health - Health check\n- GET /api/v1/tokens - Supported tokens\n- POST /api/v1/transactions - Submit transaction", tags: ["solana","wallet"], price: 0 },
    { name: "Raydium AMM", domain: "api.raydium.io", description: "Solana AMM — liquidity pools, swap routes, TVL data", skillMd: "# Raydium AMM\n\n## Endpoints\n\n- GET /v2/main/pairs - List trading pairs\n- GET /v2/main/price - Token prices\n- GET /v2/ammV3/ammPools - Concentrated liquidity pools", tags: ["solana","defi","amm"], price: 0 },
    { name: "Orca Whirlpools", domain: "api.orca.so", description: "Orca DEX concentrated liquidity whirlpools on Solana", skillMd: "# Orca Whirlpools\n\n## Endpoints\n\n- GET /v1/whirlpool/list - List whirlpools\n- GET /v1/token/list - Supported tokens\n- GET /v1/whirlpool/{address} - Pool details", tags: ["solana","defi","dex"], price: 0 },
    { name: "Marinade Finance", domain: "api.marinade.finance", description: "Liquid staking on Solana — stake SOL, get mSOL", skillMd: "# Marinade Finance\n\n## Endpoints\n\n- GET /v1/state - Protocol state\n- GET /v1/validators - Validator set\n- GET /v1/apy - Current APY", tags: ["solana","staking","defi"], price: 0 },
    { name: "Jito MEV", domain: "bundles.jito.wtf", description: "Jito MEV bundle submission for Solana", skillMd: "# Jito MEV\n\n## Endpoints\n\n- POST /api/v1/bundles - Submit bundle\n- GET /api/v1/bundles/{id} - Bundle status\n- GET /api/v1/tip-accounts - Tip accounts", tags: ["solana","mev"], price: 0 },
    { name: "DexScreener", domain: "api.dexscreener.com", description: "Multi-chain DEX pair analytics and charts", skillMd: "# DexScreener\n\n## Endpoints\n\n- GET /latest/dex/search - Search pairs\n- GET /latest/dex/tokens/{address} - Token pairs\n- GET /latest/dex/pairs/{chain}/{address} - Pair details", tags: ["defi","analytics","multichain"], price: 0 },
    { name: "Solscan API", domain: "api.solscan.io", description: "Solana blockchain explorer API", skillMd: "# Solscan API\n\n## Endpoints\n\n- GET /account/{address} - Account info\n- GET /account/transactions - Transaction list\n- GET /token/meta/{address} - Token metadata\n- GET /market/token/{address} - Market data", tags: ["solana","explorer"], price: 0 },
    { name: "Dialect", domain: "api.dialect.to", description: "Solana messaging and notification protocol", skillMd: "# Dialect\n\n## Endpoints\n\n- POST /v1/messages - Send message\n- GET /v1/messages - Get messages\n- POST /v1/dapps/notifications - Send notification", tags: ["solana","messaging"], price: 0 },
  ];

  for (const s of seeds) {
    const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const skill: Skill = {
      ...s, id, userId: "aiko-9", version: "1.0.0",
      versionHash: hashContent(s.skillMd),
      downloads: Math.floor(Math.random() * 200),
      createdAt: Date.now(),
    };
    skills.set(id, skill);

    const eps = parseEndpointsFromMarkdown(s.skillMd, s.domain);
    for (const ep of eps) {
      const fp = fingerprint(ep.method, ep.path);
      if (!seenFingerprints.has(fp)) {
        seenFingerprints.add(fp);
        const aid = genId("abl");
        abilities.set(aid, {
          id: aid, name: `${ep.method} ${ep.path}`,
          description: ep.description || `${ep.method} ${ep.path} on ${s.domain}`,
          domain: s.domain, method: ep.method, path: ep.path,
          originalPath: ep.originalPath, fingerprint: fp, verified: true,
          healthScore: 80 + Math.floor(Math.random() * 20),
          totalExecutions: Math.floor(Math.random() * 50),
          successCount: 0, avgLatencyMs: 50 + Math.floor(Math.random() * 200),
          userId: "aiko-9", createdAt: Date.now(),
        });
        const a = abilities.get(aid)!;
        a.successCount = Math.round(a.totalExecutions * a.healthScore / 100);
      }
    }
  }
}

seedData();

// ── Routes ─────────────────────────────────────────────────────────────

app.get("/api/health", (c) => c.json({ status: "ok", service: "unbrowse", version: "0.2.0" }));

app.get("/api/stats", (c) => {
  const total = executions.length;
  const success = executions.filter(e => e.success).length;
  return c.json({
    totalAbilities: abilities.size, totalSkills: skills.size,
    totalExecutions: total, successfulExecutions: success,
    failedExecutions: total - success, uniqueFingerprints: seenFingerprints.size,
    avgResponseTime: abilities.size > 0 ? Math.round(Array.from(abilities.values()).reduce((s,a) => s + a.avgLatencyMs, 0) / abilities.size) : 119,
    avgHealthScore: abilities.size > 0 ? Math.round(Array.from(abilities.values()).reduce((s,a) => s + a.healthScore, 0) / abilities.size) : 0,
  });
});

app.get("/api/marketplace/search", (c) => {
  const q = (c.req.query("q") ?? "").toLowerCase();
  let filtered = Array.from(skills.values());
  if (q) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  const results = filtered.map(s => ({
    domain: s.domain, name: s.name, description: s.description,
    endpoints: parseEndpointsFromMarkdown(s.skillMd, s.domain).length,
    authMethod: s.skillMd.includes("bearer") ? "bearer" : s.skillMd.includes("apikey") ? "apikey" : "none",
    tags: s.tags,
    abilities: Array.from(abilities.values()).filter(a => a.domain === s.domain).map(a => ({
      id: a.id, name: a.name, method: a.method, path: a.path, description: a.description
    })),
  }));
  return c.json(results);
});

app.get("/api/marketplace/skills/:id", (c) => {
  const skill = skills.get(c.req.param("id"));
  if (!skill) return c.json({ error: "Not found" }, 404);
  return c.json(skill);
});

app.post("/api/marketplace/publish", async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.skillMd) return c.json({ error: "name and skillMd required" }, 400);
  const id = genId("skl");
  skills.set(id, { id, name: body.name, domain: body.domain || "unknown", description: body.description || body.name, skillMd: body.skillMd, apiTemplate: body.apiTemplate, tags: body.tags || [], price: body.price || 0, creatorWallet: body.creatorWallet, userId: body.userId || "anon", version: "1.0.0", versionHash: hashContent(body.skillMd), downloads: 0, createdAt: Date.now() });
  return c.json({ id, name: body.name });
});

app.post("/api/marketplace/ingest", async (c) => {
  const body = await c.req.json();
  return c.json({ success: true, message: `Ingested ${body.domain || 'unknown'}` });
});

app.post("/api/execution/run", async (c) => {
  const body = await c.req.json();
  const ability = body.abilityId ? abilities.get(body.abilityId) : 
    Array.from(abilities.values()).find(a => a.domain === body.domain);
  if (!ability) return c.json({ error: "Ability not found" }, 404);

  let path = ability.originalPath;
  const queryParams: Record<string, string> = {};
  if (body.params) {
    for (const [k, v] of Object.entries(body.params)) {
      const replaced = path.replace(`{${k}}`, encodeURIComponent(v as string));
      if (replaced !== path) {
        path = replaced;
      } else {
        queryParams[k] = v as string;
      }
    }
  }

  const qs = Object.keys(queryParams).length > 0 ? '?' + new URLSearchParams(queryParams).toString() : '';
  const url = `https://${ability.domain}${path}${qs}`;
  const start = Date.now();
  let success = false, statusCode = 0, responseBody: any = null;
  try {
    const resp = await fetch(url, { method: ability.method, headers: { Accept: "application/json", ...(body.headers || {}) } });
    statusCode = resp.status;
    success = statusCode >= 200 && statusCode < 400;
    try { responseBody = await resp.json(); } catch { responseBody = await resp.text(); }
  } catch (e: any) { responseBody = { error: e.message }; }

  const latencyMs = Date.now() - start;
  executions.push({ userId: "anon", abilityId: ability.id, success, statusCode, latencyMs, timestamp: Date.now() });
  ability.totalExecutions++;
  if (success) ability.successCount++;
  updateHealthScore(ability);

  return c.json({ success, statusCode, latencyMs, data: responseBody, timing: latencyMs, healthScore: ability.healthScore });
});

app.get("/api/abilities/search", (c) => {
  const q = (c.req.query("q") ?? "").toLowerCase();
  let filtered = Array.from(abilities.values());
  if (q) filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.domain.toLowerCase().includes(q));
  return c.json({ results: filtered.slice(0, 20), total: filtered.length });
});

// Catch-all for frontend routing
app.get("*", (c) => c.json({ service: "unbrowse-api", docs: "/api/health", marketplace: "/api/marketplace/search", stats: "/api/stats" }));

export default handle(app);
