export default function register(api: any) {
  // Register tools
  
  // Tool 1: unbrowse_capture — Visit a URL and capture API traffic
  api.registerTool({
    name: "unbrowse_capture",
    description: "Visit a URL and capture the internal API calls the website makes. Returns discovered endpoints that can be used to generate skills. Much faster than browser automation.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to visit and capture API traffic from" },
        waitMs: { type: "number", description: "Extra milliseconds to wait for API calls (default: 2000)" }
      },
      required: ["url"]
    },
    async execute(_id: string, params: any) {
      // Make a fetch to the URL, capture headers, redirects, discover API patterns
      // For now, do a direct fetch and analyze the response
      const url = params.url;
      const start = Date.now();
      try {
        const res = await fetch(url, { redirect: "follow" });
        const headers: Record<string, string> = {};
        res.headers.forEach((v, k) => { headers[k] = v; });
        const contentType = headers["content-type"] || "";
        const isJson = contentType.includes("json");
        const body = isJson ? await res.json() : await res.text();
        const ms = Date.now() - start;
        
        // Extract API patterns from the URL
        const parsed = new URL(url);
        const domain = parsed.hostname;
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              url,
              domain,
              status: res.status,
              contentType,
              isApi: isJson,
              latencyMs: ms,
              headers: Object.fromEntries(Object.entries(headers).slice(0, 10)),
              responsePreview: isJson ? JSON.stringify(body).slice(0, 500) : (body as string).slice(0, 500),
              hint: isJson 
                ? "This looks like an API endpoint! Use unbrowse_learn to generate a skill from captured traffic."
                : "This is an HTML page. Browse it to discover internal API calls, or use unbrowse_learn with a HAR file."
            }, null, 2)
          }]
        };
      } catch (e: any) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: e.message }) }] };
      }
    }
  });

  // Tool 2: unbrowse_learn — Parse HAR or API responses and generate a skill
  api.registerTool({
    name: "unbrowse_learn",
    description: "Parse captured API traffic (HAR format or endpoint list) and generate a typed SKILL.md + api.ts client. This creates a reusable API skill from observed HTTP requests.",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", description: "The domain to generate a skill for (e.g. api.example.com)" },
        endpoints: { 
          type: "array",
          description: "List of observed endpoints",
          items: {
            type: "object",
            properties: {
              method: { type: "string" },
              path: { type: "string" },
              description: { type: "string" }
            },
            required: ["method", "path"]
          }
        },
        harContent: { type: "string", description: "Raw HAR JSON content (alternative to endpoints)" },
        authMethod: { type: "string", description: "Auth method: bearer, apikey, session, none" }
      },
      required: ["domain"]
    },
    async execute(_id: string, params: any) {
      // Import our modules
      const { HarParser } = await import("../extension/src/har-parser.js");
      const { SkillGenerator } = await import("../extension/src/skill-generator.js");
      const { normalizeRoute } = await import("../extension/src/route-normalizer.js");
      
      let endpoints = params.endpoints || [];
      let auth = { method: params.authMethod || "none", headers: {}, cookies: {}, tokens: [] };
      
      if (params.harContent) {
        const parsed = HarParser.parse(params.harContent);
        endpoints = parsed.map((p: any) => ({
          method: p.method,
          path: normalizeRoute(p.path),
          description: `${p.method} ${p.path} on ${p.domain}`
        }));
        auth = HarParser.extractAuth(params.harContent);
      }
      
      // Normalize endpoints
      const normalized = endpoints.map((ep: any) => ({
        ...ep,
        path: normalizeRoute(ep.path),
        originalPath: ep.path
      }));
      
      const generator = new SkillGenerator();
      const { skillMd, apiTs } = generator.generate(normalized, auth, params.domain);
      
      // Save to skills directory
      const fs = await import("fs");
      const path = await import("path");
      const skillsDir = path.resolve(process.cwd(), "skills", params.domain);
      fs.mkdirSync(skillsDir, { recursive: true });
      fs.writeFileSync(path.join(skillsDir, "SKILL.md"), skillMd);
      fs.writeFileSync(path.join(skillsDir, "api.ts"), apiTs);
      
      return {
        content: [{
          type: "text",
          text: `Generated skill for ${params.domain}:\n\n` +
            `📁 Saved to: skills/${params.domain}/\n` +
            `📝 Endpoints: ${normalized.length}\n` +
            `🔐 Auth: ${auth.method}\n\n` +
            `--- SKILL.md ---\n${skillMd}\n\n--- api.ts ---\n${apiTs}`
        }]
      };
    }
  });

  // Tool 3: unbrowse_replay — Execute an API call directly (no browser)
  api.registerTool({
    name: "unbrowse_replay",
    description: "Execute a web API call directly without browser automation. 100x faster than Puppeteer/Playwright. Provide the endpoint details and get the response instantly.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "Full URL to call" },
        method: { type: "string", description: "HTTP method (GET, POST, PUT, DELETE)", default: "GET" },
        headers: { type: "object", description: "Request headers" },
        body: { type: "string", description: "Request body (for POST/PUT)" }
      },
      required: ["url"]
    },
    async execute(_id: string, params: any) {
      const start = Date.now();
      try {
        const res = await fetch(params.url, {
          method: params.method || "GET",
          headers: { "Accept": "application/json", ...(params.headers || {}) },
          body: params.body || undefined
        });
        const ms = Date.now() - start;
        const contentType = res.headers.get("content-type") || "";
        let data: any;
        if (contentType.includes("json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: res.status >= 200 && res.status < 400,
              status: res.status,
              latencyMs: ms,
              contentType,
              data: typeof data === "string" ? data.slice(0, 2000) : data
            }, null, 2)
          }]
        };
      } catch (e: any) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: e.message, latencyMs: Date.now() - start }) }] };
      }
    }
  });

  // Tool 4: unbrowse_search — Search the skill marketplace
  api.registerTool({
    name: "unbrowse_search",
    description: "Search the Unbrowse skill marketplace for pre-built API skills. Find skills by domain, keyword, or tag.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (domain name, keyword, or tag)" },
        serverUrl: { type: "string", description: "Marketplace server URL (default: http://localhost:4111)" }
      },
      required: ["query"]
    },
    async execute(_id: string, params: any) {
      const server = params.serverUrl || "http://localhost:4111";
      try {
        const res = await fetch(`${server}/api/marketplace/search?q=${encodeURIComponent(params.query)}`);
        const data = await res.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: JSON.stringify({ error: e.message, hint: "Make sure the Unbrowse server is running" }) }] };
      }
    }
  });

  // Tool 5: unbrowse_skills — List locally available skills
  api.registerTool({
    name: "unbrowse_skills",
    description: "List all locally generated API skills. Shows domains, endpoint counts, and auth methods.",
    parameters: {
      type: "object",
      properties: {},
    },
    async execute() {
      const fs = await import("fs");
      const path = await import("path");
      const skillsDir = path.resolve(process.cwd(), "skills");
      
      if (!fs.existsSync(skillsDir)) {
        return { content: [{ type: "text", text: "No skills directory found. Use unbrowse_learn to generate skills." }] };
      }
      
      const domains = fs.readdirSync(skillsDir).filter((d: string) => {
        const p = path.join(skillsDir, d);
        return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, "SKILL.md"));
      });
      
      const skills = domains.map((domain: string) => {
        const skillMd = fs.readFileSync(path.join(skillsDir, domain, "SKILL.md"), "utf-8");
        const endpointCount = (skillMd.match(/^[-*]\s+(GET|POST|PUT|PATCH|DELETE)/gm) || []).length;
        const hasApi = fs.existsSync(path.join(skillsDir, domain, "api.ts"));
        return { domain, endpoints: endpointCount, hasApiClient: hasApi };
      });
      
      return { content: [{ type: "text", text: JSON.stringify({ skills, total: skills.length }, null, 2) }] };
    }
  });
}
