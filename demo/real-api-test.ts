#!/usr/bin/env npx tsx
/**
 * Real API Test Suite — Tests Unbrowse against live APIs
 * Proves the system works with actual web services, not mocks.
 */

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const SERVER = "http://localhost:4111";
let passed = 0;
let failed = 0;
const results: { name: string; ok: boolean; ms: number; detail?: string }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    passed++;
    results.push({ name, ok: true, ms });
    console.log(`  ${GREEN}✓${RESET} ${name} ${DIM}${ms}ms${RESET}`);
  } catch (e: any) {
    const ms = Date.now() - start;
    failed++;
    results.push({ name, ok: false, ms, detail: e.message });
    console.log(`  ${RED}✗${RESET} ${name} ${DIM}${ms}ms${RESET}`);
    console.log(`    ${RED}${e.message}${RESET}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}${CYAN}  🔓 UNBROWSE — Real API Test Suite${RESET}`);
console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}\n`);

// ── Test 1: Direct API calls (what Unbrowse replays) ─────────────────

console.log(`${BOLD}${YELLOW}▶ Direct API Calls (Unbrowse Replay Speed)${RESET}\n`);

await test("JSONPlaceholder GET /posts/1", async () => {
  const start = Date.now();
  const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
  const ms = Date.now() - start;
  const data = await res.json();
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(data.id === 1, "Expected post id 1");
  assert(data.title?.length > 0, "Expected title");
  assert(ms < 5000, `Too slow: ${ms}ms`);
  console.log(`    ${DIM}→ ${ms}ms, title: "${data.title.slice(0, 50)}..."${RESET}`);
});

await test("JSONPlaceholder POST /posts (create)", async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unbrowse Test", body: "Testing real API", userId: 1 }),
  });
  const data = await res.json();
  assert(res.status === 201, `Expected 201, got ${res.status}`);
  assert(data.id > 0, "Expected created post id");
  console.log(`    ${DIM}→ Created post #${data.id}${RESET}`);
});

await test("JSONPlaceholder GET /users/1", async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const data = await res.json();
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(data.name === "Leanne Graham", `Expected Leanne Graham, got ${data.name}`);
  console.log(`    ${DIM}→ User: ${data.name} (${data.email})${RESET}`);
});

await test("GitHub API GET /repos/getfoundry-app/unbrowse", async () => {
  const start = Date.now();
  const res = await fetch("https://api.github.com/repos/getfoundry-app/unbrowse", {
    headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "unbrowse-test" },
  });
  const ms = Date.now() - start;
  const data = await res.json();
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  assert(data.full_name === "getfoundry-app/unbrowse", `Expected our repo, got ${data.full_name}`);
  console.log(`    ${DIM}→ ${ms}ms, stars: ${data.stargazers_count}, forks: ${data.forks_count}${RESET}`);
});

await test("Colosseum API GET /hackathons/active", async () => {
  const start = Date.now();
  const res = await fetch("https://agents.colosseum.com/api/hackathons/active");
  const ms = Date.now() - start;
  const data = await res.json();
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const hackathon = Array.isArray(data) ? data[0] : data;
  assert(hackathon, "Expected hackathon data");
  console.log(`    ${DIM}→ ${ms}ms, hackathon: ${hackathon.name || "active"}${RESET}`);
});

await test("Colosseum API GET /leaderboard (top 3)", async () => {
  const res = await fetch("https://agents.colosseum.com/api/leaderboard");
  const data = await res.json();
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const entries = data.entries || data;
  assert(Array.isArray(entries) && entries.length > 0, "Expected leaderboard entries");
  for (const e of entries.slice(0, 3)) {
    const p = e.project || e;
    console.log(`    ${DIM}→ #${e.rank} ${p.name} (H:${p.humanUpvotes} A:${p.agentUpvotes})${RESET}`);
  }
});

// ── Test 2: Server execution proxy (real HTTP through our server) ─────

console.log(`\n${BOLD}${YELLOW}▶ Server Execution Proxy (Real API via Unbrowse)${RESET}\n`);

await test("Execute ability via server → JSONPlaceholder", async () => {
  // Find a GET /posts ability
  const searchRes = await fetch(`${SERVER}/api/abilities/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "posts" }),
  });
  const searchData = await searchRes.json();
  const getPostsAbility = searchData.results?.find(
    (a: any) => a.method === "GET" && a.path === "/posts"
  );
  assert(getPostsAbility, "Expected to find GET /posts ability");

  const execRes = await fetch(`${SERVER}/api/execution/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abilityId: getPostsAbility.id }),
  });
  const execData = await execRes.json();
  assert(execData.success, `Execution failed: ${execData.statusCode}`);
  assert(execData.latencyMs > 0, "Expected latency tracking");
  assert(Array.isArray(execData.response), "Expected array of posts");
  console.log(`    ${DIM}→ ${execData.latencyMs}ms, ${execData.response.length} posts, health: ${execData.healthScore}${RESET}`);
});

await test("Execute GET /posts/{id} with params", async () => {
  const searchRes = await fetch(`${SERVER}/api/abilities/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "posts" }),
  });
  const searchData = await searchRes.json();
  const getPostAbility = searchData.results?.find(
    (a: any) => a.method === "GET" && a.path === "/posts/{id}"
  );
  assert(getPostAbility, "Expected to find GET /posts/{id} ability");

  const execRes = await fetch(`${SERVER}/api/execution/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abilityId: getPostAbility.id, params: { id: "5" } }),
  });
  const execData = await execRes.json();
  assert(execData.success, `Execution failed: ${execData.statusCode}`);
  assert(execData.response?.id === 5, `Expected post #5, got ${execData.response?.id}`);
  console.log(`    ${DIM}→ ${execData.latencyMs}ms, post #${execData.response.id}: "${execData.response.title?.slice(0, 40)}..."${RESET}`);
});

await test("Execute GET /users/{id}", async () => {
  const searchRes = await fetch(`${SERVER}/api/abilities/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "users" }),
  });
  const searchData = await searchRes.json();
  const getUserAbility = searchData.results?.find(
    (a: any) => a.method === "GET" && a.path === "/users/{id}"
  );
  assert(getUserAbility, "Expected to find GET /users/{id} ability");

  const execRes = await fetch(`${SERVER}/api/execution/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abilityId: getUserAbility.id, params: { id: "3" } }),
  });
  const execData = await execRes.json();
  assert(execData.success, `Execution failed: status ${execData.statusCode}`);
  const user = execData.response;
  assert(user?.id || user?.name, "Expected user data");
  console.log(`    ${DIM}→ ${execData.latencyMs}ms, user: ${user.name || user.username || "unknown"} (${user.email || ""})${RESET}`);
});

// ── Test 3: Full pipeline (ingest → search → execute) ─────────────────

console.log(`\n${BOLD}${YELLOW}▶ Full Pipeline: Ingest → Search → Execute${RESET}\n`);

await test("Ingest httpbin.org skill → search → execute", async () => {
  // Ingest a new real API skill with unique paths to avoid dedup
  const ts = Date.now();
  const ingestRes = await fetch(`${SERVER}/api/ingestion/skill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skillMd: `# httpbin.org\n\n- GET /get - Returns GET data\n- GET /ip - Returns origin IP\n- GET /anything/${ts} - Returns anything`,
      domain: "httpbin.org",
      userId: "real-api-test",
    }),
  });
  const ingestData = await ingestRes.json();
  // May be 0 if already ingested on a running server — that's ok, check total parsed
  assert(ingestData.parsed > 0, `Expected parsed abilities, got ${ingestData.parsed}`);
  console.log(`    ${DIM}→ Ingested ${ingestData.created} abilities for httpbin.org${RESET}`);

  // Search for the new abilities
  const searchRes = await fetch(`${SERVER}/api/abilities/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "ip", domains: ["httpbin.org"] }),
  });
  const searchData = await searchRes.json();
  assert(searchData.results?.length > 0, "Expected to find httpbin abilities");

  const ipAbility = searchData.results.find((a: any) => a.path === "/ip");
  assert(ipAbility, "Expected /ip ability");

  // Execute it against the real API
  const execRes = await fetch(`${SERVER}/api/execution/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abilityId: ipAbility.id }),
  });
  const execData = await execRes.json();
  assert(execData.success, `Execution failed: ${JSON.stringify(execData)}`);
  assert(execData.response?.origin, "Expected origin IP in response");
  console.log(`    ${DIM}→ Executed GET /ip: origin=${execData.response.origin}, ${execData.latencyMs}ms${RESET}`);
});

await test("Verify stats updated after real executions", async () => {
  const res = await fetch(`${SERVER}/api/stats`);
  const data = await res.json();
  assert(data.totalExecutions > 0, `Expected executions > 0, got ${data.totalExecutions}`);
  assert(data.successfulExecutions > 0, `Expected successful > 0`);
  console.log(`    ${DIM}→ ${data.totalExecutions} total, ${data.successfulExecutions} successful, ${data.totalAbilities} abilities, avg health: ${data.avgHealthScore}${RESET}`);
});

// ── Summary ───────────────────────────────────────────────────────────

console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}  Results: ${passed}/${passed + failed} passed${RESET}`);
if (failed === 0) {
  console.log(`${GREEN}${BOLD}  🎉 All real API tests passed!${RESET}`);
} else {
  console.log(`${RED}${BOLD}  ❌ ${failed} test(s) failed${RESET}`);
  for (const r of results.filter((r) => !r.ok)) {
    console.log(`    ${RED}✗ ${r.name}: ${r.detail}${RESET}`);
  }
}

const totalMs = results.reduce((s, r) => s + r.ms, 0);
console.log(`${DIM}  Total time: ${totalMs}ms${RESET}`);
console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}\n`);

process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
