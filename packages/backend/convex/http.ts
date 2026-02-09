import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// GET /health
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", ts: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// GET /api/abilities/search?q=&top_k=12&domains=
http.route({
  path: "/api/abilities/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const topK = parseInt(url.searchParams.get("top_k") ?? "12", 10);
    const domainsParam = url.searchParams.get("domains") ?? "";

    // Text-based search (vector search placeholder)
    const results = await ctx.runQuery(api.abilities.search, {
      searchTerm: q,
    });

    let filtered = results;
    if (domainsParam) {
      const domains = domainsParam.split(",").map((d) => d.trim().toLowerCase());
      filtered = filtered.filter(
        (a) => a.domain && domains.includes(a.domain.toLowerCase())
      );
    }

    const sliced = filtered.slice(0, topK);

    return new Response(JSON.stringify({ results: sliced, total: sliced.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// POST /api/execution/run
http.route({
  path: "/api/execution/run",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { abilityId, userId, targetUrl, method, headers, bodyPayload } = body as {
      abilityId: string;
      userId: string;
      targetUrl: string;
      method?: string;
      headers?: Record<string, string>;
      bodyPayload?: unknown;
    };

    if (!abilityId || !userId || !targetUrl) {
      return new Response(
        JSON.stringify({ error: "abilityId, userId, and targetUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const startTime = Date.now();
    let success = false;
    let statusCode = 0;
    let responseBody: unknown = null;
    let errorMessage: string | undefined;

    try {
      const proxyResp = await fetch(targetUrl, {
        method: method ?? "GET",
        headers: headers ?? {},
        body: bodyPayload ? JSON.stringify(bodyPayload) : undefined,
      });
      statusCode = proxyResp.status;
      success = proxyResp.ok;
      responseBody = await proxyResp.text();
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }

    const latencyMs = Date.now() - startTime;

    await ctx.runMutation(api.execution.logExecution, {
      userId,
      abilityId,
      success,
      statusCode: statusCode || undefined,
      latencyMs,
      errorMessage,
    });

    await ctx.runMutation(api.execution.updateHealthScore, { abilityId });

    return new Response(
      JSON.stringify({ success, statusCode, latencyMs, response: responseBody, errorMessage }),
      { status: success ? 200 : 502, headers: { "Content-Type": "application/json" } }
    );
  }),
});

// GET /api/marketplace/skills/search?q=
http.route({
  path: "/api/marketplace/skills/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();

    const all = await ctx.runQuery(api.marketplace.list, {});
    const filtered = q
      ? all.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t: string) => t.toLowerCase().includes(q))
        )
      : all;

    return new Response(JSON.stringify({ results: filtered, total: filtered.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// GET /api/marketplace/skills/:id — use prefix match
http.route({
  pathPrefix: "/api/marketplace/skills/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    // Don't match the search route
    if (url.pathname.endsWith("/search")) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const skillId = url.pathname.split("/api/marketplace/skills/")[1];
    if (!skillId) {
      return new Response(JSON.stringify({ error: "Skill ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const skill = await ctx.runQuery(api.marketplace.get, { skillId });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If paid skill, return 402
    if (skill.priceUsdc > 0) {
      return new Response(
        JSON.stringify({
          error: "Payment Required",
          skill: {
            skillId: skill.skillId,
            name: skill.name,
            description: skill.description,
            priceUsdc: skill.priceUsdc,
            creatorWallet: skill.creatorWallet,
          },
          x402: {
            version: 1,
            accepts: ["solana-usdc"],
            price: skill.priceUsdc,
            payTo: skill.creatorWallet,
            maxTimeoutSeconds: 300,
          },
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(skill), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
