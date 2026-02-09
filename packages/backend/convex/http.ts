import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const JSON_HEADERS = { "Content-Type": "application/json" };

// GET /api/health
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", service: "unbrowse", version: "0.1.0" }),
      { status: 200, headers: JSON_HEADERS }
    );
  }),
});

// GET /api/marketplace/search?q=&tags=
http.route({
  path: "/api/marketplace/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const tagsParam = url.searchParams.get("tags") ?? "";

    const all = await ctx.runQuery(api.marketplace.list, {});
    let filtered = all;

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
        s.tags.some((t: string) => tags.includes(t.toLowerCase()))
      );
    }

    return new Response(
      JSON.stringify({ results: filtered, total: filtered.length }),
      { status: 200, headers: JSON_HEADERS }
    );
  }),
});

// GET /api/marketplace/skills/:id
http.route({
  pathPrefix: "/api/marketplace/skills/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const skillId = url.pathname.split("/api/marketplace/skills/")[1];
    if (!skillId) {
      return new Response(JSON.stringify({ error: "Skill ID required" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const skill = await ctx.runQuery(api.marketplace.get, { skillId });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: JSON_HEADERS,
      });
    }

    return new Response(JSON.stringify(skill), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }),
});

// POST /api/abilities/search
http.route({
  path: "/api/abilities/search",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as {
      query?: string;
      top_k?: number;
      domains?: string[];
    };
    const q = (body.query ?? "").toLowerCase();
    const topK = body.top_k ?? 12;

    const results = await ctx.runQuery(api.abilities.search, {
      searchTerm: q,
    });

    let filtered = results;
    if (body.domains && body.domains.length > 0) {
      const domains = body.domains.map((d) => d.toLowerCase());
      filtered = filtered.filter(
        (a) => a.domain && domains.includes(a.domain.toLowerCase())
      );
    }

    return new Response(
      JSON.stringify({ results: filtered.slice(0, topK), total: filtered.length }),
      { status: 200, headers: JSON_HEADERS }
    );
  }),
});

// POST /api/execution/report
http.route({
  path: "/api/execution/report",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as {
      abilityId: string;
      success: boolean;
      statusCode?: number;
      latencyMs?: number;
      responseHash?: string;
    };

    if (!body.abilityId) {
      return new Response(JSON.stringify({ error: "abilityId is required" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    await ctx.runMutation(api.execution.logExecution, {
      userId: "anonymous",
      abilityId: body.abilityId,
      success: body.success,
      statusCode: body.statusCode,
      latencyMs: body.latencyMs,
      responseHash: body.responseHash,
    });

    await ctx.runMutation(api.execution.updateHealthScore, {
      abilityId: body.abilityId,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }),
});

export default http;
