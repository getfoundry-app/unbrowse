import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Import from extension package
import { HarParser } from "../../extension/src/har-parser.js";
import { normalizeRoute } from "../../extension/src/route-normalizer.js";
import { fingerprint } from "../../extension/src/endpoint-fingerprinter.js";
import type { ParsedRequest } from "../../extension/src/types.js";

const app = new Hono();
app.use("*", cors());

// ── Types ──────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  domain: string;
  description: string;
  skillMd: string;
  apiTemplate?: string;
  tags: string[];
  price: number;
  creatorWallet?: string;
  userId: string;
  version: string;
  versionHash: string;
  downloads: number;
  createdAt: number;
}

interface Ability {
  id: string;
  name: string;
  description: string;
  domain: string;
  method: string;
  path: string;
  originalPath: string;
  fingerprint: string;
  verified: boolean;
  healthScore: number;
  totalExecutions: number;
  successCount: number;
  avgLatencyMs: number;
  userId: string;
  createdAt: number;
}

interface ExecutionLog {
  userId: string;
  abilityId: string;
  success: boolean;
  statusCode?: number;
  latencyMs?: number;
  responseHash?: string;
  timestamp: number;
}

// ── Storage ────────────────────────────────────────────────────────────

const skills = new Map<string, Skill>();
const abilities = new Map<string, Ability>();
const executions: ExecutionLog[] = [];
const seenFingerprints = new Set<string>();

// ── Helpers ────────────────────────────────────────────────────────────

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function updateHealthScore(ability: Ability): void {
  if (ability.totalExecutions === 0) return;
  ability.healthScore = Math.round(
    (ability.successCount / ability.totalExecutions) * 100
  );
}

// ── Seed Data ──────────────────────────────────────────────────────────

function seedData() {
  const seedSkills: Omit<Skill, "id" | "versionHash" | "downloads" | "createdAt">[] = [
    {
      name: "JSONPlaceholder CRUD",
      domain: "jsonplaceholder.typicode.com",
      description: "Full CRUD operations for JSONPlaceholder fake REST API",
      skillMd: `# JSONPlaceholder CRUD\n\n## Endpoints\n\n- GET /posts - List all posts\n- GET /posts/{id} - Get a single post\n- POST /posts - Create a post\n- PUT /posts/{id} - Update a post\n- DELETE /posts/{id} - Delete a post\n- GET /posts/{id}/comments - Get comments for a post`,
      apiTemplate: '{"baseUrl":"https://jsonplaceholder.typicode.com"}',
      tags: ["rest", "json", "crud", "demo"],
      price: 0,
      creatorWallet: undefined,
      userId: "seed",
      version: "1.0.0",
    },
    {
      name: "GitHub REST API",
      domain: "api.github.com",
      description: "Core GitHub API endpoints for repos, users, and issues",
      skillMd: `# GitHub REST API\n\n## Endpoints\n\n- GET /users/{id} - Get user profile\n- GET /users/{id}/repos - List user repos\n- GET /repos/{id}/{id} - Get repo details\n- GET /repos/{id}/{id}/issues - List issues\n- POST /repos/{id}/{id}/issues - Create issue`,
      apiTemplate: '{"baseUrl":"https://api.github.com","headers":{"Accept":"application/vnd.github.v3+json"}}',
      tags: ["github", "git", "developer", "api"],
      price: 0,
      creatorWallet: undefined,
      userId: "seed",
      version: "1.0.0",
    },
    {
      name: "OpenWeatherMap",
      domain: "api.openweathermap.org",
      description: "Weather data API - current weather, forecasts, and geocoding",
      skillMd: `# OpenWeatherMap\n\n## Endpoints\n\n- GET /data/2.5/weather - Current weather by city\n- GET /data/2.5/forecast - 5-day forecast\n- GET /geo/1.0/direct - Geocode city name to coordinates`,
      apiTemplate: '{"baseUrl":"https://api.openweathermap.org","auth":"apikey","keyParam":"appid"}',
      tags: ["weather", "forecast", "geocoding"],
      price: 0,
      creatorWallet: undefined,
      userId: "seed",
      version: "1.0.0",
    },
    {
      name: "Stripe Payments",
      domain: "api.stripe.com",
      description: "Stripe payment processing endpoints",
      skillMd: `# Stripe Payments\n\n## Endpoints\n\n- POST /v1/charges - Create a charge\n- GET /v1/charges/{id} - Retrieve a charge\n- POST /v1/customers - Create a customer\n- GET /v1/customers/{id} - Retrieve a customer\n- POST /v1/payment_intents - Create payment intent`,
      apiTemplate: '{"baseUrl":"https://api.stripe.com","auth":"bearer"}',
      tags: ["payments", "stripe", "fintech"],
      price: 500,
      creatorWallet: "0xStripeSkillCreator",
      userId: "seed",
      version: "1.0.0",
    },
  ];

  for (const s of seedSkills) {
    const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const skill: Skill = {
      ...s,
      id,
      versionHash: hashContent(s.skillMd),
      downloads: Math.floor(Math.random() * 200),
      createdAt: Date.now(),
    };
    skills.set(id, skill);

    // Parse abilities from skillMd
    const parsed = parseEndpointsFromMarkdown(s.skillMd, s.domain);
    for (const ep of parsed) {
      const fp = fingerprint(ep.method, ep.path);
      if (!seenFingerprints.has(fp)) {
        seenFingerprints.add(fp);
        const abilityId = genId("abl");
        abilities.set(abilityId, {
          id: abilityId,
          name: `${ep.method} ${ep.path}`,
          description: ep.description || `${ep.method} ${ep.path} on ${s.domain}`,
          domain: s.domain,
          method: ep.method,
          path: ep.path,
          originalPath: ep.originalPath,
          fingerprint: fp,
          verified: true,
          healthScore: 80 + Math.floor(Math.random() * 20),
          totalExecutions: Math.floor(Math.random() * 50),
          successCount: 0,
          avgLatencyMs: 50 + Math.floor(Math.random() * 200),
          userId: "seed",
          createdAt: Date.now(),
        });
        const abl = abilities.get(abilityId)!;
        abl.successCount = Math.round(abl.totalExecutions * abl.healthScore / 100);
      }
    }
  }
}

interface ParsedEndpoint {
  method: string;
  path: string;
  originalPath: string;
  description: string;
}

function parseEndpointsFromMarkdown(md: string, domain: string): ParsedEndpoint[] {
  const results: ParsedEndpoint[] = [];
  const lineRe = /^[-*]\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s*[-–—]?\s*(.*)/gmi;
  let match: RegExpExecArray | null;
  while ((match = lineRe.exec(md)) !== null) {
    const method = match[1].toUpperCase();
    const rawPath = match[2];
    const desc = match[3]?.trim() || "";
    const normalized = normalizeRoute(rawPath);
    results.push({ method, path: normalized, originalPath: rawPath, description: desc });
  }
  return results;
}

// ── Routes ─────────────────────────────────────────────────────────────

// Health
app.get("/api/health", (c) => {
  return c.json({ status: "ok", service: "unbrowse", version: "0.2.0" });
});

// Stats
app.get("/api/stats", (c) => {
  const totalExecs = executions.length;
  const successExecs = executions.filter((e) => e.success).length;
  return c.json({
    totalAbilities: abilities.size,
    totalSkills: skills.size,
    totalExecutions: totalExecs,
    successfulExecutions: successExecs,
    failedExecutions: totalExecs - successExecs,
    uniqueFingerprints: seenFingerprints.size,
    avgHealthScore: abilities.size > 0
      ? Math.round(
          Array.from(abilities.values()).reduce((s, a) => s + a.healthScore, 0) /
            abilities.size
        )
      : 0,
  });
});

// ── Ingestion: HAR ─────────────────────────────────────────────────────

app.post("/api/ingestion/har", async (c) => {
  const body = await c.req.json<{
    harContent: string;
    seedUrl: string;
    userId: string;
  }>();

  if (!body.harContent || !body.userId) {
    return c.json({ error: "harContent and userId are required" }, 400);
  }

  let parsed: ParsedRequest[];
  try {
    parsed = HarParser.parse(body.harContent);
  } catch (e: any) {
    return c.json({ error: `Failed to parse HAR: ${e.message}` }, 400);
  }

  const created: Ability[] = [];

  for (const req of parsed) {
    const normalized = normalizeRoute(req.path);
    const fp = fingerprint(req.method, normalized);

    if (seenFingerprints.has(fp)) continue;
    seenFingerprints.add(fp);

    const id = genId("abl");
    const ability: Ability = {
      id,
      name: `${req.method} ${normalized}`,
      description: `${req.method} ${normalized} on ${req.domain}`,
      domain: req.domain,
      method: req.method,
      path: normalized,
      originalPath: req.path,
      fingerprint: fp,
      verified: req.verified,
      healthScore: req.verified ? 100 : 50,
      totalExecutions: 0,
      successCount: 0,
      avgLatencyMs: 0,
      userId: body.userId,
      createdAt: Date.now(),
    };
    abilities.set(id, ability);
    created.push(ability);
  }

  return c.json({
    parsed: parsed.length,
    created: created.length,
    deduplicated: parsed.length - created.length,
    abilities: created,
  });
});

// ── Ingestion: SKILL.md ───────────────────────────────────────────────

app.post("/api/ingestion/skill", async (c) => {
  const body = await c.req.json<{
    skillMd: string;
    domain: string;
    userId: string;
  }>();

  if (!body.skillMd || !body.domain || !body.userId) {
    return c.json({ error: "skillMd, domain, and userId are required" }, 400);
  }

  const endpoints = parseEndpointsFromMarkdown(body.skillMd, body.domain);
  const created: Ability[] = [];

  for (const ep of endpoints) {
    const fp = fingerprint(ep.method, ep.path);
    if (seenFingerprints.has(fp)) continue;
    seenFingerprints.add(fp);

    const id = genId("abl");
    const ability: Ability = {
      id,
      name: `${ep.method} ${ep.path}`,
      description: ep.description || `${ep.method} ${ep.path} on ${body.domain}`,
      domain: body.domain,
      method: ep.method,
      path: ep.path,
      originalPath: ep.originalPath,
      fingerprint: fp,
      verified: false,
      healthScore: 50,
      totalExecutions: 0,
      successCount: 0,
      avgLatencyMs: 0,
      userId: body.userId,
      createdAt: Date.now(),
    };
    abilities.set(id, ability);
    created.push(ability);
  }

  return c.json({
    parsed: endpoints.length,
    created: created.length,
    deduplicated: endpoints.length - created.length,
    abilities: created,
  });
});

// ── Marketplace: Publish ──────────────────────────────────────────────

app.post("/api/marketplace/publish", async (c) => {
  const body = await c.req.json<{
    name: string;
    domain: string;
    skillMd: string;
    apiTemplate?: string;
    price?: number;
    tags?: string[];
    creatorWallet?: string;
    userId: string;
  }>();

  if (!body.name || !body.skillMd || !body.userId) {
    return c.json({ error: "name, skillMd, and userId are required" }, 400);
  }

  const id = genId("skl");
  const versionHash = hashContent(body.skillMd);
  const skill: Skill = {
    id,
    name: body.name,
    domain: body.domain || "unknown",
    description: body.name,
    skillMd: body.skillMd,
    apiTemplate: body.apiTemplate,
    tags: body.tags || [],
    price: body.price || 0,
    creatorWallet: body.creatorWallet,
    userId: body.userId,
    version: "1.0.0",
    versionHash,
    downloads: 0,
    createdAt: Date.now(),
  };

  skills.set(id, skill);

  return c.json({ id, versionHash, name: skill.name });
});

// ── Marketplace: Search ───────────────────────────────────────────────

app.get("/api/marketplace/search", (c) => {
  const q = (c.req.query("q") ?? "").toLowerCase();
  const tagsParam = c.req.query("tags") ?? "";

  let filtered = Array.from(skills.values());

  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (tagsParam) {
    const tags = tagsParam.split(",").map((t) => t.trim().toLowerCase());
    filtered = filtered.filter((s) =>
      s.tags.some((t) => tags.includes(t.toLowerCase()))
    );
  }

  // Return without skillMd for list view
  const results = filtered.map(({ skillMd, ...rest }) => rest);
  return c.json({ results, total: filtered.length });
});

// ── Marketplace: Get Skill ────────────────────────────────────────────

app.get("/api/marketplace/skills/:id", (c) => {
  const skill = skills.get(c.req.param("id"));
  if (!skill) return c.json({ error: "Skill not found" }, 404);
  const { skillMd, ...meta } = skill;
  return c.json(meta);
});

// ── Marketplace: Download Skill ───────────────────────────────────────

app.get("/api/marketplace/skills/:id/download", (c) => {
  const skill = skills.get(c.req.param("id"));
  if (!skill) return c.json({ error: "Skill not found" }, 404);

  if (skill.price > 0) {
    // Check for x402 payment header
    const paymentProof = c.req.header("x-payment-proof");
    if (!paymentProof) {
      return c.json(
        {
          error: "Payment required",
          price: skill.price,
          currency: "USDC",
          recipient: skill.creatorWallet,
          x402: {
            version: 1,
            price: skill.price,
            currency: "USDC",
            network: "base",
            recipient: skill.creatorWallet,
          },
        },
        402
      );
    }
    // In production: verify payment proof on-chain. For now, accept any proof.
  }

  skill.downloads++;
  return c.json({
    id: skill.id,
    name: skill.name,
    domain: skill.domain,
    skillMd: skill.skillMd,
    apiTemplate: skill.apiTemplate,
    versionHash: skill.versionHash,
    version: skill.version,
  });
});

// ── Execution: Run ────────────────────────────────────────────────────

app.post("/api/execution/run", async (c) => {
  const body = await c.req.json<{
    abilityId: string;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }>();

  if (!body.abilityId) {
    return c.json({ error: "abilityId is required" }, 400);
  }

  const ability = abilities.get(body.abilityId);
  if (!ability) {
    return c.json({ error: "Ability not found" }, 404);
  }

  // Build URL
  let path = ability.originalPath;
  if (body.params) {
    for (const [k, v] of Object.entries(body.params)) {
      path = path.replace(`{${k}}`, encodeURIComponent(v));
    }
  }

  const url = `https://${ability.domain}${path}`;
  const start = Date.now();
  let success = false;
  let statusCode = 0;
  let responseBody: unknown = null;

  try {
    const resp = await fetch(url, {
      method: ability.method,
      headers: {
        "Accept": "application/json",
        ...(body.headers || {}),
      },
    });
    statusCode = resp.status;
    success = statusCode >= 200 && statusCode < 400;
    try {
      responseBody = await resp.json();
    } catch {
      responseBody = await resp.text();
    }
  } catch (e: any) {
    responseBody = { error: e.message };
  }

  const latencyMs = Date.now() - start;

  // Track execution
  executions.push({
    userId: "anonymous",
    abilityId: body.abilityId,
    success,
    statusCode,
    latencyMs,
    timestamp: Date.now(),
  });

  // Update ability stats
  ability.totalExecutions++;
  if (success) ability.successCount++;
  ability.avgLatencyMs = Math.round(
    (ability.avgLatencyMs * (ability.totalExecutions - 1) + latencyMs) /
      ability.totalExecutions
  );
  updateHealthScore(ability);

  return c.json({
    success,
    statusCode,
    latencyMs,
    healthScore: ability.healthScore,
    response: responseBody,
  });
});

// ── Execution: Report (legacy) ────────────────────────────────────────

app.post("/api/execution/report", async (c) => {
  const body = await c.req.json<{
    abilityId: string;
    success: boolean;
    statusCode?: number;
    latencyMs?: number;
    responseHash?: string;
  }>();

  if (!body.abilityId) {
    return c.json({ error: "abilityId is required" }, 400);
  }

  executions.push({
    userId: "anonymous",
    abilityId: body.abilityId,
    success: body.success,
    statusCode: body.statusCode,
    latencyMs: body.latencyMs,
    responseHash: body.responseHash,
    timestamp: Date.now(),
  });

  const ability = abilities.get(body.abilityId);
  if (ability) {
    ability.totalExecutions++;
    if (body.success) ability.successCount++;
    updateHealthScore(ability);
  }

  return c.json({ ok: true });
});

// ── Abilities ─────────────────────────────────────────────────────────

app.get("/api/abilities/:id", (c) => {
  const ability = abilities.get(c.req.param("id"));
  if (!ability) return c.json({ error: "Ability not found" }, 404);
  return c.json(ability);
});

app.post("/api/abilities/search", async (c) => {
  const body = await c.req.json<{
    query?: string;
    top_k?: number;
    domains?: string[];
  }>();
  const q = (body.query ?? "").toLowerCase();
  const topK = body.top_k ?? 12;

  let filtered = Array.from(abilities.values());

  if (q) {
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }

  if (body.domains && body.domains.length > 0) {
    const domains = body.domains.map((d) => d.toLowerCase());
    filtered = filtered.filter(
      (a) => a.domain && domains.includes(a.domain.toLowerCase())
    );
  }

  return c.json({ results: filtered.slice(0, topK), total: filtered.length });
});

// ── Start ──────────────────────────────────────────────────────────────

seedData();

// Auto-seed from skills directory
function seedFromSkillsDir() {
  try {
    const skillsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../skills");
    if (!existsSync(skillsRoot)) return;
    const domains = readdirSync(skillsRoot).filter((d) => {
      const p = resolve(skillsRoot, d);
      return statSync(p).isDirectory() && existsSync(resolve(p, "SKILL.md"));
    });
    let autoSeeded = 0;
    for (const domain of domains) {
      const skillMd = readFileSync(resolve(skillsRoot, domain, "SKILL.md"), "utf-8");
      const name = skillMd.split("\n")[0].replace(/^#\s*/, "") || domain;
      const id = `auto-${domain}`;
      if (!skills.has(id)) {
        skills.set(id, {
          id, name, domain, description: name, skillMd,
          tags: ["api"], price: 0, userId: "aiko-9",
          version: "1.0.0", versionHash: hashContent(skillMd),
          downloads: Math.floor(Math.random() * 100), createdAt: Date.now(),
        });
        autoSeeded++;
      }
    }
    if (autoSeeded > 0) console.log(`  Auto-seeded: ${autoSeeded} skills from skills/`);
  } catch (e) { /* skills dir not found */ }
}
seedFromSkillsDir();

// Resolve paths — __dirname from import.meta.url points to src/
// Go up: src/ → backend/ → packages/
const serverDir = dirname(fileURLToPath(import.meta.url));
const landingPath = resolve(serverDir, "../../landing/index.html");
const dashboardPath = resolve(serverDir, "../../dashboard/index.html");

// Serve landing page
app.get("/", (c) => {
  try {
    const html = readFileSync(landingPath, "utf-8");
    return c.html(html);
  } catch (e) {
    return c.redirect("/dashboard");
  }
});

// Serve dashboard (React app)
app.get("/dashboard", (c) => {
  try {
    const html = readFileSync(dashboardPath, "utf-8");
    return c.html(html);
  } catch (e) {
    return c.text(`Dashboard not found at ${dashboardPath}. Visit /api/health for API status.`, 404);
  }
});

// Serve dashboard static assets
app.get("/assets/*", (c) => {
  const assetPath = c.req.path;
  const dashDir = resolve(serverDir, "../../dashboard");
  const filePath = resolve(dashDir, assetPath.slice(1)); // remove leading /
  try {
    const content = readFileSync(filePath);
    const ext = filePath.split(".").pop() || "";
    const mimeTypes: Record<string, string> = {
      js: "application/javascript",
      css: "text/css",
      svg: "image/svg+xml",
      png: "image/png",
      jpg: "image/jpeg",
      woff2: "font/woff2",
      woff: "font/woff",
    };
    return new Response(content, {
      headers: { "Content-Type": mimeTypes[ext] || "application/octet-stream" },
    });
  } catch {
    return c.text("Not found", 404);
  }
});

// Serve vite.svg
app.get("/vite.svg", (c) => {
  try {
    const dashDir = resolve(serverDir, "../../dashboard");
    const content = readFileSync(resolve(dashDir, "vite.svg"));
    return new Response(content, { headers: { "Content-Type": "image/svg+xml" } });
  } catch {
    return c.text("Not found", 404);
  }
});

const port = 4111;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(
    `Unbrowse standalone server running on http://localhost:${info.port}`
  );
  console.log(
    `  Dashboard: http://localhost:${info.port}/`
  );
  console.log(
    `  API: http://localhost:${info.port}/api/health`
  );
  console.log(
    `  Seeded: ${skills.size} skills, ${abilities.size} abilities`
  );
});
