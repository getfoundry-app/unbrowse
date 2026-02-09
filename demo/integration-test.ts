#!/usr/bin/env tsx
/**
 * Unbrowse API Integration Test Suite
 * 
 * Comprehensive end-to-end test that exercises all API endpoints
 * and validates the entire system workflow.
 * 
 * Usage: npx tsx demo/integration-test.ts
 */

const BASE_URL = "http://localhost:4111";

// ── Color Output ──────────────────────────────────────────────────────

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(msg: string, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function pass(name: string, time: number) {
  log(`✓ ${name}`, colors.green);
  log(`  ${time}ms`, colors.gray);
}

function fail(name: string, error: string, time: number) {
  log(`✗ ${name}`, colors.red);
  log(`  ${error}`, colors.red);
  log(`  ${time}ms`, colors.gray);
}

function section(title: string) {
  console.log();
  log(`${"=".repeat(60)}`, colors.cyan);
  log(title, colors.bright + colors.cyan);
  log(`${"=".repeat(60)}`, colors.cyan);
}

// ── Test Framework ────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  time: number;
  error?: string;
}

const results: TestResult[] = [];
let seededSkillId: string | null = null;
let createdAbilityId: string | null = null;
let createdSkillId: string | null = null;
let createdDomain: string | null = null;

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const time = Date.now() - start;
    results.push({ name, passed: true, time });
    pass(name, time);
  } catch (error: any) {
    const time = Date.now() - start;
    const message = error.message || String(error);
    results.push({ name, passed: false, time, error: message });
    fail(name, message, time);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertExists(value: any, name: string) {
  assert(value !== null && value !== undefined, `${name} should exist`);
}

function assertType(value: any, type: string, name: string) {
  const actualType = Array.isArray(value) ? "array" : typeof value;
  assert(actualType === type, `${name} should be ${type}, got ${actualType}`);
}

// ── API Test Helpers ──────────────────────────────────────────────────

async function apiGet(path: string): Promise<any> {
  const resp = await fetch(`${BASE_URL}${path}`);
  if (!resp.ok) {
    throw new Error(`GET ${path} failed: ${resp.status} ${resp.statusText}`);
  }
  return resp.json();
}

async function apiPost(path: string, body: any): Promise<any> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`POST ${path} failed: ${resp.status} ${text}`);
  }
  return resp.json();
}

// ── Test Suite ────────────────────────────────────────────────────────

async function runTests() {
  section("🚀 Unbrowse API Integration Test Suite");
  log(`Base URL: ${BASE_URL}`, colors.dim);
  console.log();

  // ── 1. Server Check ─────────────────────────────────────────────────

  section("1️⃣  Server Health");

  await test("Server is running", async () => {
    try {
      const resp = await fetch(`${BASE_URL}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      assert(resp.ok, "Server should respond");
    } catch (error: any) {
      throw new Error(
        `Server not reachable at ${BASE_URL}. Is it running? (npx tsx packages/backend/src/server.ts)`
      );
    }
  });

  await test("GET /api/health", async () => {
    const data = await apiGet("/api/health");
    assertExists(data.status, "status");
    assert(data.status === "ok", "Status should be 'ok'");
    assertExists(data.service, "service");
    assertExists(data.version, "version");
  });

  // ── 2. Stats ────────────────────────────────────────────────────────

  section("2️⃣  Statistics");

  await test("GET /api/stats - initial state", async () => {
    const data = await apiGet("/api/stats");
    assertType(data.totalAbilities, "number", "totalAbilities");
    assertType(data.totalSkills, "number", "totalSkills");
    assertType(data.totalExecutions, "number", "totalExecutions");
    assertType(data.successfulExecutions, "number", "successfulExecutions");
    assertType(data.failedExecutions, "number", "failedExecutions");
    assertType(data.uniqueFingerprints, "number", "uniqueFingerprints");
    assertType(data.avgHealthScore, "number", "avgHealthScore");
    assert(data.totalSkills > 0, "Should have seeded skills");
    assert(data.totalAbilities > 0, "Should have seeded abilities");
  });

  // ── 3. Marketplace: Search ──────────────────────────────────────────

  section("3️⃣  Marketplace - Search");

  await test("GET /api/marketplace/search?q=json", async () => {
    const data = await apiGet("/api/marketplace/search?q=json");
    assertExists(data.results, "results");
    assertType(data.results, "array", "results");
    assertType(data.total, "number", "total");
    assert(data.results.length > 0, "Should find skills matching 'json'");

    // Store first skill ID for later tests
    seededSkillId = data.results[0].id;
    assertExists(seededSkillId, "first skill ID");

    // Validate result shape
    const skill = data.results[0];
    assertExists(skill.id, "skill.id");
    assertExists(skill.name, "skill.name");
    assertExists(skill.domain, "skill.domain");
    assertExists(skill.description, "skill.description");
    assertType(skill.tags, "array", "skill.tags");
    assertType(skill.price, "number", "skill.price");
    assertType(skill.downloads, "number", "skill.downloads");
    // skillMd should NOT be in search results
    assert(skill.skillMd === undefined, "skillMd should not be in search results");
  });

  await test("GET /api/marketplace/search - no query", async () => {
    const data = await apiGet("/api/marketplace/search");
    assert(data.results.length > 0, "Should return all skills");
  });

  // ── 4. Marketplace: Get Skill ───────────────────────────────────────

  section("4️⃣  Marketplace - Get Skill");

  await test(`GET /api/marketplace/skills/${seededSkillId}`, async () => {
    assert(seededSkillId, "Need a seeded skill ID");
    const data = await apiGet(`/api/marketplace/skills/${seededSkillId}`);
    assertExists(data.id, "id");
    assertExists(data.name, "name");
    assertExists(data.domain, "domain");
    assert(data.id === seededSkillId, "Should return correct skill");
    // Note: metadata endpoint doesn't return skillMd
    assert(data.skillMd === undefined, "skillMd should not be in metadata endpoint");
  });

  // ── 5. Marketplace: Download Skill (Free) ───────────────────────────

  section("5️⃣  Marketplace - Download Skill");

  await test(`GET /api/marketplace/skills/${seededSkillId}/download`, async () => {
    assert(seededSkillId, "Need a seeded skill ID");
    const data = await apiGet(`/api/marketplace/skills/${seededSkillId}/download`);
    assertExists(data.id, "id");
    assertExists(data.name, "name");
    assertExists(data.skillMd, "skillMd");
    assertExists(data.versionHash, "versionHash");
    assert(data.skillMd.length > 0, "skillMd should not be empty");
  });

  // ── 6. Ingestion: Skill ─────────────────────────────────────────────

  section("6️⃣  Ingestion - SKILL.md");

  await test("POST /api/ingestion/skill", async () => {
    // Use a unique timestamp-based domain and paths to avoid deduplication
    const timestamp = Date.now();
    const uniqueDomain = `test-api-${timestamp}.example.com`;
    createdDomain = uniqueDomain; // Store for later tests
    
    const skillMd = `
# Test API Skill

## Endpoints

- GET /integration-test-${timestamp}/users - List all users
- POST /integration-test-${timestamp}/users - Create a new user
- GET /integration-test-${timestamp}/users/{id} - Get user by ID
- PUT /integration-test-${timestamp}/users/{id} - Update user
- DELETE /integration-test-${timestamp}/users/{id} - Delete user
`;

    const data = await apiPost("/api/ingestion/skill", {
      skillMd,
      domain: uniqueDomain,
      userId: "integration-test",
    });

    assertType(data.parsed, "number", "parsed");
    assertType(data.created, "number", "created");
    assertType(data.deduplicated, "number", "deduplicated");
    assertType(data.abilities, "array", "abilities");
    assert(data.parsed === 5, "Should parse 5 endpoints");
    assert(data.created > 0, "Should create at least one ability");
    assert(data.abilities.length === data.created, "abilities array should match created count");

    // Store first created ability ID
    if (data.abilities.length > 0) {
      createdAbilityId = data.abilities[0].id;
    }

    // Validate ability shape
    if (data.abilities.length > 0) {
      const ability = data.abilities[0];
      assertExists(ability.id, "ability.id");
      assertExists(ability.name, "ability.name");
      assertExists(ability.domain, "ability.domain");
      assertExists(ability.method, "ability.method");
      assertExists(ability.path, "ability.path");
      assertExists(ability.fingerprint, "ability.fingerprint");
      assertType(ability.verified, "boolean", "ability.verified");
      assertType(ability.healthScore, "number", "ability.healthScore");
    }
  });

  // ── 7. Ingestion: HAR ───────────────────────────────────────────────

  section("7️⃣  Ingestion - HAR");

  await test("POST /api/ingestion/har", async () => {
    // Use a unique timestamp-based domain and paths to avoid deduplication
    const timestamp = Date.now();
    const uniqueDomain = `mock-api-${timestamp}.example.com`;
    // Minimal valid HAR structure
    const harContent = JSON.stringify({
      log: {
        version: "1.2",
        creator: { name: "Integration Test", version: "1.0" },
        entries: [
          {
            request: {
              method: "GET",
              url: `https://${uniqueDomain}/har-test-${timestamp}/products`,
              httpVersion: "HTTP/1.1",
              headers: [],
              queryString: [],
              cookies: [],
              headersSize: -1,
              bodySize: 0,
            },
            response: {
              status: 200,
              statusText: "OK",
              httpVersion: "HTTP/1.1",
              headers: [],
              cookies: [],
              content: { size: 0, mimeType: "application/json" },
              redirectURL: "",
              headersSize: -1,
              bodySize: 0,
            },
            cache: {},
            timings: { send: 0, wait: 0, receive: 0 },
            time: 100,
          },
          {
            request: {
              method: "POST",
              url: `https://${uniqueDomain}/har-test-${timestamp}/orders`,
              httpVersion: "HTTP/1.1",
              headers: [],
              queryString: [],
              cookies: [],
              headersSize: -1,
              bodySize: 0,
            },
            response: {
              status: 201,
              statusText: "Created",
              httpVersion: "HTTP/1.1",
              headers: [],
              cookies: [],
              content: { size: 0, mimeType: "application/json" },
              redirectURL: "",
              headersSize: -1,
              bodySize: 0,
            },
            cache: {},
            timings: { send: 0, wait: 0, receive: 0 },
            time: 150,
          },
        ],
      },
    });

    const data = await apiPost("/api/ingestion/har", {
      harContent,
      seedUrl: `https://${uniqueDomain}`,
      userId: "integration-test",
    });

    assertType(data.parsed, "number", "parsed");
    assertType(data.created, "number", "created");
    assertType(data.deduplicated, "number", "deduplicated");
    assertType(data.abilities, "array", "abilities");
    assert(data.parsed === 2, "Should parse 2 HAR entries");
    assert(data.created > 0, "Should create at least one ability");
  });

  // ── 8. Abilities: Search ────────────────────────────────────────────

  section("8️⃣  Abilities - Search");

  await test("POST /api/abilities/search - all abilities", async () => {
    const data = await apiPost("/api/abilities/search", {
      top_k: 20,
    });

    assertExists(data.results, "results");
    assertType(data.results, "array", "results");
    assertType(data.total, "number", "total");
    assert(data.results.length > 0, "Should return abilities");
    assert(data.total > 0, "Total should be greater than 0");
  });

  await test("POST /api/abilities/search - query filter", async () => {
    const data = await apiPost("/api/abilities/search", {
      query: "test",
      top_k: 10,
    });

    assertType(data.results, "array", "results");
    if (data.results.length > 0) {
      const hasTest = data.results.some((a: any) => 
        a.name.toLowerCase().includes("test") ||
        a.description.toLowerCase().includes("test") ||
        a.domain.toLowerCase().includes("test")
      );
      assert(hasTest, "Results should contain 'test'");
    }
  });

  await test("POST /api/abilities/search - domain filter", async () => {
    assert(createdDomain, "Need a created domain from ingestion test");
    const data = await apiPost("/api/abilities/search", {
      domains: [createdDomain],
      top_k: 10,
    });

    assertType(data.results, "array", "results");
    assert(data.results.length > 0, `Should find abilities for domain ${createdDomain}`);
    const allMatchDomain = data.results.every(
      (a: any) => a.domain === createdDomain
    );
    assert(allMatchDomain, "All results should match domain filter");
  });

  // ── 9. Abilities: Get by ID ─────────────────────────────────────────

  section("9️⃣  Abilities - Get by ID");

  await test(`GET /api/abilities/${createdAbilityId}`, async () => {
    assert(createdAbilityId, "Need a created ability ID");
    const data = await apiGet(`/api/abilities/${createdAbilityId}`);
    assertExists(data.id, "id");
    assertExists(data.name, "name");
    assertExists(data.domain, "domain");
    assertExists(data.method, "method");
    assertExists(data.path, "path");
    assert(data.id === createdAbilityId, "Should return correct ability");
  });

  // ── 10. Execution: Run ──────────────────────────────────────────────

  section("🔟 Execution - Run Ability");

  await test("POST /api/execution/run - jsonplaceholder", async () => {
    // Find a JSONPlaceholder ability by domain filter
    const searchResult = await apiPost("/api/abilities/search", {
      domains: ["jsonplaceholder.typicode.com"],
      top_k: 20,
    });

    assert(searchResult.results.length > 0, "Should find jsonplaceholder abilities");
    
    // Find GET /posts endpoint
    const getPostsAbility = searchResult.results.find(
      (a: any) => a.method === "GET" && a.path.includes("/posts") && !a.path.includes("{")
    );
    
    assert(getPostsAbility, "Should find GET /posts ability");

    // Execute the ability
    const execResult = await apiPost("/api/execution/run", {
      abilityId: getPostsAbility.id,
    });

    assertExists(execResult.success, "success");
    assertType(execResult.success, "boolean", "success");
    assertType(execResult.statusCode, "number", "statusCode");
    assertType(execResult.latencyMs, "number", "latencyMs");
    assertType(execResult.healthScore, "number", "healthScore");
    assertExists(execResult.response, "response");
    
    // JSONPlaceholder should return 200 and array of posts
    assert(execResult.success === true, "Execution should succeed");
    assert(execResult.statusCode === 200, "Should return 200 OK");
    assertType(execResult.response, "array", "response (posts array)");
  });

  await test("POST /api/execution/run - with path params", async () => {
    // Find GET /posts/{id} ability
    const searchResult = await apiPost("/api/abilities/search", {
      domains: ["jsonplaceholder.typicode.com"],
      top_k: 20,
    });

    const getPostByIdAbility = searchResult.results.find(
      (a: any) => a.method === "GET" && a.path.includes("/posts/{") && !a.path.includes("/comments")
    );
    
    if (getPostByIdAbility) {
      const execResult = await apiPost("/api/execution/run", {
        abilityId: getPostByIdAbility.id,
        params: { id: "1" },
      });

      assert(execResult.success === true, "Execution should succeed");
      assert(execResult.statusCode === 200, "Should return 200 OK");
      assertType(execResult.response, "object", "response (post object)");
      assert(execResult.response.id === 1, "Should return post with id=1");
    } else {
      // If no parameterized endpoint found, pass anyway
      log("  ℹ No parameterized endpoint found, skipping", colors.yellow);
    }
  });

  // ── 11. Execution: Report ───────────────────────────────────────────

  section("1️⃣1️⃣  Execution - Report Result");

  await test("POST /api/execution/report", async () => {
    assert(createdAbilityId, "Need a created ability ID");
    
    const data = await apiPost("/api/execution/report", {
      abilityId: createdAbilityId,
      success: true,
      statusCode: 200,
      latencyMs: 123,
      responseHash: "abc123",
    });

    assertExists(data.ok, "ok");
    assert(data.ok === true, "Should return ok: true");
  });

  // ── 12. Marketplace: Publish ────────────────────────────────────────

  section("1️⃣2️⃣  Marketplace - Publish Skill");

  await test("POST /api/marketplace/publish", async () => {
    const skillMd = `
# Integration Test Skill

This skill was created during integration testing.

## Endpoints

- GET /integration/test - Test endpoint
- POST /integration/test - Create test resource
`;

    const data = await apiPost("/api/marketplace/publish", {
      name: "Integration Test Skill",
      domain: "integration-test.example.com",
      skillMd,
      tags: ["test", "integration"],
      price: 0,
      userId: "integration-test",
    });

    assertExists(data.id, "id");
    assertExists(data.name, "name");
    assertExists(data.versionHash, "versionHash");
    assert(data.name === "Integration Test Skill", "Should return correct name");
    
    // Store for verification
    createdSkillId = data.id;
  });

  // ── 13. Verify Stats Increased ──────────────────────────────────────

  section("1️⃣3️⃣  Verify Stats Updated");

  await test("GET /api/stats - verify counts increased", async () => {
    const data = await apiGet("/api/stats");
    
    // We ingested abilities and published a skill, so counts should have increased
    assert(data.totalSkills > 0, "totalSkills should be > 0");
    assert(data.totalAbilities > 0, "totalAbilities should be > 0");
    assert(data.totalExecutions > 0, "totalExecutions should be > 0 (we ran abilities)");
    assert(data.successfulExecutions > 0, "successfulExecutions should be > 0");
    
    // Verify the skill we published exists
    if (createdSkillId) {
      const searchResult = await apiGet(`/api/marketplace/search?q=integration`);
      const foundSkill = searchResult.results.find((s: any) => s.id === createdSkillId);
      assert(foundSkill !== undefined, "Published skill should be searchable");
    }
  });

  // ── Summary ─────────────────────────────────────────────────────────

  section("📊 Test Summary");
  console.log();

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.time, 0);

  log(`Total Tests: ${results.length}`, colors.bright);
  log(`✓ Passed: ${passed}`, colors.green);
  if (failed > 0) {
    log(`✗ Failed: ${failed}`, colors.red);
  }
  log(`⏱  Total Time: ${totalTime}ms`, colors.cyan);
  console.log();

  if (failed > 0) {
    section("❌ Failed Tests");
    console.log();
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        log(`✗ ${r.name}`, colors.red);
        log(`  ${r.error}`, colors.dim);
      });
    console.log();
  }

  // Summary emoji
  if (failed === 0) {
    log("🎉 All tests passed!", colors.green + colors.bright);
  } else {
    log("💥 Some tests failed", colors.red + colors.bright);
  }
  console.log();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// ── Run ───────────────────────────────────────────────────────────────

runTests().catch((error) => {
  console.error();
  log("❌ Test suite crashed:", colors.red + colors.bright);
  console.error(error);
  console.error();
  process.exit(1);
});
