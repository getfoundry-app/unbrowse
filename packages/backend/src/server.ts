import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", cors());

const JSON_HEADERS = { "Content-Type": "application/json" };

// In-memory storage
interface Skill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  author?: string;
  version?: string;
}

interface Ability {
  id: string;
  name: string;
  description: string;
  domain?: string;
  healthScore?: number;
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

const skills = new Map<string, Skill>();
const abilities = new Map<string, Ability>();
const executions: ExecutionLog[] = [];
const healthScores = new Map<string, number>();

// Seed some sample data
skills.set("hello-world", {
  id: "hello-world",
  name: "Hello World",
  description: "A simple hello world skill",
  tags: ["demo", "basic"],
  author: "unbrowse",
  version: "0.1.0",
});

abilities.set("web-search", {
  id: "web-search",
  name: "Web Search",
  description: "Search the web for information",
  domain: "search",
  healthScore: 100,
});

// GET /api/health
app.get("/api/health", (c) => {
  return c.json({ status: "ok", service: "unbrowse", version: "0.1.0" });
});

// GET /api/marketplace/search?q=&tags=
app.get("/api/marketplace/search", (c) => {
  const q = (c.req.query("q") ?? "").toLowerCase();
  const tagsParam = c.req.query("tags") ?? "";

  let filtered = Array.from(skills.values());

  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  if (tagsParam) {
    const tags = tagsParam.split(",").map((t) => t.trim().toLowerCase());
    filtered = filtered.filter((s) =>
      s.tags.some((t) => tags.includes(t.toLowerCase()))
    );
  }

  return c.json({ results: filtered, total: filtered.length });
});

// GET /api/marketplace/skills/:id
app.get("/api/marketplace/skills/:id", (c) => {
  const skillId = c.req.param("id");
  const skill = skills.get(skillId);
  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  return c.json(skill);
});

// POST /api/abilities/search
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

// POST /api/execution/report
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

  // Update health score (simple: last 10 executions success rate)
  const relevant = executions
    .filter((e) => e.abilityId === body.abilityId)
    .slice(-10);
  const score = Math.round(
    (relevant.filter((e) => e.success).length / relevant.length) * 100
  );
  healthScores.set(body.abilityId, score);

  const ability = abilities.get(body.abilityId);
  if (ability) {
    ability.healthScore = score;
  }

  return c.json({ ok: true });
});

const port = 4111;
console.log(`Unbrowse standalone server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
