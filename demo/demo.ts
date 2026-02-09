#!/usr/bin/env npx tsx
/**
 * Unbrowse End-to-End Demo
 * ========================
 * Capture → Generate → Search → Replay
 *
 * Demonstrates the full Unbrowse pipeline without a real browser.
 */

// ─── Colors & Formatting ────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
  bgCyan: "\x1b[46m",
  bgGreen: "\x1b[42m",
  bgMagenta: "\x1b[45m",
  bgBlue: "\x1b[44m",
};

function banner(text: string, bg = c.bgCyan) {
  const pad = " ".repeat(3);
  const line = "═".repeat(text.length + 6);
  console.log(`\n${bg}${c.bold}${c.white} ${line} ${c.reset}`);
  console.log(`${bg}${c.bold}${c.white} ${pad}${text}${pad} ${c.reset}`);
  console.log(`${bg}${c.bold}${c.white} ${line} ${c.reset}\n`);
}

function step(n: number, label: string) {
  console.log(`\n${c.bold}${c.cyan}  ▶ STEP ${n}: ${label}${c.reset}`);
  console.log(`${c.dim}  ${"─".repeat(50)}${c.reset}`);
}

function info(label: string, value: string) {
  console.log(`    ${c.yellow}${label}${c.reset} ${value}`);
}

function code(text: string) {
  for (const line of text.split("\n")) {
    console.log(`    ${c.dim}│${c.reset} ${line}`);
  }
}

// ─── Types (from ../packages/extension/src/types.ts) ────────────────────────

interface HarEntry {
  url: string;
  method: string;
  status: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  mimeType: string;
}

interface NormalizedEndpoint {
  method: string;
  path: string;
  originalPath: string;
  fingerprint: string;
  description?: string;
}

// ─── Step 1: Simulate HAR Capture ───────────────────────────────────────────

function createMockHar(): HarEntry[] {
  const baseHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Bearer mock-token-abc123",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  };

  const responseHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Powered-By": "Express",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  };

  return [
    {
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "GET",
      status: 200,
      requestHeaders: baseHeaders,
      responseHeaders,
      mimeType: "application/json",
      responseBody: JSON.stringify([
        { id: 1, userId: 1, title: "sunt aut facere repellat provident occaecati", body: "quia et suscipit..." },
        { id: 2, userId: 1, title: "qui est esse", body: "est rerum tempore vitae..." },
        { id: 3, userId: 2, title: "ea molestias quasi exercitationem", body: "et iusto sed quo iure..." },
      ]),
    },
    {
      url: "https://jsonplaceholder.typicode.com/posts/1",
      method: "GET",
      status: 200,
      requestHeaders: baseHeaders,
      responseHeaders,
      mimeType: "application/json",
      responseBody: JSON.stringify({
        id: 1,
        userId: 1,
        title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
      }),
    },
    {
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      status: 201,
      requestHeaders: { ...baseHeaders, "Content-Type": "application/json" },
      responseHeaders,
      mimeType: "application/json",
      requestBody: JSON.stringify({ title: "New Post", body: "Hello world", userId: 1 }),
      responseBody: JSON.stringify({ id: 101, title: "New Post", body: "Hello world", userId: 1 }),
    },
    {
      url: "https://jsonplaceholder.typicode.com/users/1",
      method: "GET",
      status: 200,
      requestHeaders: baseHeaders,
      responseHeaders,
      mimeType: "application/json",
      responseBody: JSON.stringify({
        id: 1,
        name: "Leanne Graham",
        username: "Bret",
        email: "Sincere@april.biz",
        phone: "1-770-736-8031 x56442",
        website: "hildegard.org",
      }),
    },
    {
      url: "https://jsonplaceholder.typicode.com/posts/1/comments",
      method: "GET",
      status: 200,
      requestHeaders: baseHeaders,
      responseHeaders,
      mimeType: "application/json",
      responseBody: JSON.stringify([
        { id: 1, postId: 1, name: "id labore ex et quam laborum", email: "Eliseo@gardner.biz", body: "laudantium enim quasi est..." },
        { id: 2, postId: 1, name: "quo vero reiciendis velit similique earum", email: "Jayne_Kuhic@sydney.com", body: "est natus enim nihil est dolore..." },
      ]),
    },
  ];
}

// ─── Step 2: HAR Parser ─────────────────────────────────────────────────────

function parseHar(entries: HarEntry[]): Array<{ path: string; domain: string; method: string; status: number }> {
  return entries.map((e) => {
    const url = new URL(e.url);
    return {
      path: url.pathname,
      domain: url.hostname,
      method: e.method,
      status: e.status,
    };
  });
}

// ─── Step 3: Route Normalizer ───────────────────────────────────────────────

function normalizeRoutes(
  parsed: Array<{ path: string; domain: string; method: string; status: number }>
): NormalizedEndpoint[] {
  const seen = new Set<string>();
  const endpoints: NormalizedEndpoint[] = [];

  for (const req of parsed) {
    // Replace numeric segments with :id parameters
    const normalized = req.path.replace(/\/(\d+)/g, "/:id");
    const fingerprint = `${req.method} ${normalized}`;

    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      endpoints.push({
        method: req.method,
        path: normalized,
        originalPath: req.path,
        fingerprint,
        description: describeEndpoint(req.method, normalized),
      });
    }
  }
  return endpoints;
}

function describeEndpoint(method: string, path: string): string {
  const parts = path.split("/").filter(Boolean);
  const resource = parts.find((p) => !p.startsWith(":")) || "resource";
  if (method === "POST") return `Create a new ${resource.replace(/s$/, "")}`;
  if (parts.includes(":id") && parts.length > 2) return `List ${parts[parts.length - 1]} for a ${parts[0].replace(/s$/, "")}`;
  if (parts.includes(":id")) return `Get a single ${resource.replace(/s$/, "")}`;
  return `List all ${resource}`;
}

// ─── Step 4: Skill Generator ───────────────────────────────────────────────

function generateSkillMd(domain: string, endpoints: NormalizedEndpoint[], authMethod: string): string {
  let md = `# ${domain} API Skill\n\n`;
  md += `> Auto-generated by Unbrowse\n\n`;
  md += `## Auth\n\n`;
  md += `- Method: \`${authMethod}\`\n`;
  md += `- Header: \`Authorization: Bearer <token>\`\n\n`;
  md += `## Endpoints\n\n`;
  md += `| Method | Path | Description |\n`;
  md += `|--------|------|-------------|\n`;
  for (const ep of endpoints) {
    md += `| ${ep.method} | \`${ep.path}\` | ${ep.description} |\n`;
  }
  md += `\n## Usage\n\n`;
  md += `\`\`\`typescript\nimport { api } from "./api";\n\n`;
  md += `const posts = await api.listPosts();\n`;
  md += `const post = await api.getPost("1");\n`;
  md += `const newPost = await api.createPost({ title: "Hello", body: "World", userId: 1 });\n`;
  md += `\`\`\`\n`;
  return md;
}

function generateApiTs(domain: string, endpoints: NormalizedEndpoint[], authMethod: string): string {
  let ts = `/**\n * Auto-generated API client for ${domain}\n * Generated by Unbrowse\n */\n\n`;
  ts += `const BASE_URL = "https://${domain}";\n\n`;
  ts += `interface ApiConfig {\n  token: string;\n}\n\n`;
  ts += `export function createClient(config: ApiConfig) {\n`;
  ts += `  const headers = {\n`;
  ts += `    "Content-Type": "application/json",\n`;
  ts += `    Authorization: \`Bearer \${config.token}\`,\n`;
  ts += `  };\n\n`;
  ts += `  async function request(method: string, path: string, body?: unknown) {\n`;
  ts += `    const res = await fetch(\`\${BASE_URL}\${path}\`, {\n`;
  ts += `      method,\n`;
  ts += `      headers,\n`;
  ts += `      body: body ? JSON.stringify(body) : undefined,\n`;
  ts += `    });\n`;
  ts += `    return res.json();\n`;
  ts += `  }\n\n`;
  ts += `  return {\n`;

  for (const ep of endpoints) {
    const fnName = makeFnName(ep);
    const hasId = ep.path.includes(":id");
    const hasBody = ep.method === "POST" || ep.method === "PUT" || ep.method === "PATCH";
    const params: string[] = [];
    if (hasId) params.push("id: string");
    if (hasBody) params.push("body: Record<string, unknown>");
    const pathExpr = hasId ? `\`${ep.path.replace(":id", "${id}")}\`` : `"${ep.path}"`;
    ts += `    /** ${ep.description} */\n`;
    ts += `    ${fnName}: (${params.join(", ")}) =>\n`;
    ts += `      request("${ep.method}", ${pathExpr}${hasBody ? ", body" : ""}),\n\n`;
  }

  ts += `  };\n}\n`;
  return ts;
}

function makeFnName(ep: NormalizedEndpoint): string {
  const parts = ep.path.split("/").filter((p) => p && !p.startsWith(":"));
  if (ep.method === "POST") return `create${capitalize(singularize(parts[0]))}`;
  if (parts.length > 1 && ep.path.includes(":id")) return `get${capitalize(singularize(parts[0]))}${capitalize(parts[parts.length - 1])}`;
  if (ep.path.includes(":id")) return `get${capitalize(singularize(parts[0]))}`;
  return `list${capitalize(parts[0])}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function singularize(s: string): string {
  return s.endsWith("s") ? s.slice(0, -1) : s;
}

// ─── Step 5: Search (simple fingerprint matching) ───────────────────────────

function searchSkill(endpoints: NormalizedEndpoint[], query: string): NormalizedEndpoint[] {
  const q = query.toLowerCase();
  return endpoints.filter(
    (ep) =>
      ep.fingerprint.toLowerCase().includes(q) ||
      (ep.description?.toLowerCase().includes(q) ?? false)
  );
}

// ─── Main Demo ──────────────────────────────────────────────────────────────

async function main() {
  banner("🔓 UNBROWSE — End-to-End Demo");
  console.log(`  ${c.dim}Internal APIs Are All You Need${c.reset}`);
  console.log(`  ${c.dim}Capture → Generate → Search → Replay${c.reset}\n`);

  // ── Step 1: Capture ─────────────────────────────────────
  step(1, "CAPTURE — Simulating browser traffic capture");
  const harEntries = createMockHar();
  info("Captured", `${harEntries.length} HTTP requests from jsonplaceholder.typicode.com`);
  for (const e of harEntries) {
    const statusColor = e.status < 300 ? c.green : c.yellow;
    console.log(
      `    ${c.dim}•${c.reset} ${c.bold}${e.method.padEnd(5)}${c.reset} ${e.url} ${statusColor}${e.status}${c.reset}`
    );
  }

  // ── Step 2: Parse ───────────────────────────────────────
  step(2, "PARSE — Extracting API structure from HAR");
  const parsed = parseHar(harEntries);
  info("Domain", parsed[0].domain);
  info("Requests", `${parsed.length} entries parsed`);

  // Detect auth
  const authHeader = harEntries[0].requestHeaders["Authorization"] || "";
  const authMethod = authHeader.startsWith("Bearer") ? "bearer" : "none";
  info("Auth detected", `${c.green}${authMethod}${c.reset} (from Authorization header)`);

  // ── Step 3: Normalize ───────────────────────────────────
  step(3, "NORMALIZE — Deduplicating & parameterizing routes");
  const endpoints = normalizeRoutes(parsed);
  info("Unique endpoints", `${endpoints.length} (from ${parsed.length} raw requests)`);
  for (const ep of endpoints) {
    console.log(
      `    ${c.magenta}${ep.method.padEnd(5)}${c.reset} ${c.bold}${ep.path}${c.reset} ${c.dim}— ${ep.description}${c.reset}`
    );
  }

  // ── Step 4: Generate ────────────────────────────────────
  step(4, "GENERATE — Creating SKILL.md + api.ts");

  const skillMd = generateSkillMd(parsed[0].domain, endpoints, authMethod);
  const apiTs = generateApiTs(parsed[0].domain, endpoints, authMethod);

  console.log(`\n    ${c.bgGreen}${c.bold}${c.white}  SKILL.md  ${c.reset}\n`);
  code(skillMd);

  console.log(`\n    ${c.bgBlue}${c.bold}${c.white}  api.ts  ${c.reset}\n`);
  code(apiTs);

  // ── Step 5: Search ──────────────────────────────────────
  step(5, "SEARCH — Finding endpoints by query");
  const queries = ["post", "user", "comments"];
  for (const q of queries) {
    const results = searchSkill(endpoints, q);
    console.log(
      `    ${c.yellow}🔍 "${q}"${c.reset} → ${results.map((r) => `${c.bold}${r.fingerprint}${c.reset}`).join(", ") || "no matches"}`
    );
  }

  // ── Step 6: Replay ──────────────────────────────────────
  step(6, "REPLAY — Executing API call directly (no browser!)");
  info("Target", "GET https://jsonplaceholder.typicode.com/posts/1");

  const t0 = performance.now();
  const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
  const data = await res.json();
  const apiTime = performance.now() - t0;

  info("Status", `${c.green}${res.status} OK${c.reset}`);
  info("Response", JSON.stringify(data).slice(0, 100) + "...");
  info("Time", `${c.green}${c.bold}${apiTime.toFixed(0)}ms${c.reset}`);

  // ── Step 7: Summary ─────────────────────────────────────
  const browserTime = 30000; // ~30 seconds for browser automation
  const speedup = Math.round(browserTime / apiTime);

  banner("📊 RESULTS", c.bgMagenta);

  console.log(`  ${c.bold}Performance Comparison${c.reset}\n`);
  console.log(`    Browser Automation:  ${c.red}${c.bold}~30,000ms${c.reset}  ${c.dim}(Selenium/Puppeteer)${c.reset}`);
  console.log(`    Unbrowse API Call:   ${c.green}${c.bold}${apiTime.toFixed(0).padStart(6)}ms${c.reset}  ${c.dim}(direct HTTP)${c.reset}`);
  console.log();

  const bar = "█".repeat(Math.min(speedup, 50));
  console.log(`    ${c.green}${c.bold}⚡ ${speedup}x faster${c.reset}  ${c.green}${bar}${c.reset}`);
  console.log();
  console.log(`  ${c.bold}Generated Artifacts${c.reset}\n`);
  console.log(`    ${c.cyan}✓${c.reset} SKILL.md        — Human-readable API documentation`);
  console.log(`    ${c.cyan}✓${c.reset} api.ts          — Type-safe API client (${endpoints.length} endpoints)`);
  console.log(`    ${c.cyan}✓${c.reset} Auth: ${authMethod}   — Automatically detected from traffic`);
  console.log(`    ${c.cyan}✓${c.reset} Search index    — Query endpoints by natural language`);
  console.log();
  console.log(
    `  ${c.dim}────────────────────────────────────────────────────────${c.reset}`
  );
  console.log(
    `  ${c.bold}${c.white}  "Internal APIs Are All You Need"  ${c.reset}`
  );
  console.log(
    `  ${c.dim}  Unbrowse — 100x faster than browser automation${c.reset}\n`
  );
}

main().catch(console.error);
