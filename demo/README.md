# Unbrowse Demos

Collection of demos showcasing Unbrowse's capabilities.

## Available Demos

### 🎯 demo-colosseum.ts — Self-Referential Hackathon Demo

**The Meta Demo**: Unbrowse captures and generates a SKILL.md for the Colosseum Agent Hackathon API itself — the very API being used to judge this project!

**What it demonstrates:**
1. **HAR Capture Simulation** — Mock browser traffic from agents.colosseum.com
2. **Route Normalization** — Convert specific URLs (e.g., `/posts/3094`) into parameterized routes (e.g., `/posts/:id`)
3. **SKILL.md Generation** — Auto-generate comprehensive API documentation
4. **TypeScript Client Codegen** — Create type-safe API client with 5 methods
5. **Content Hashing** — SHA-256 for deduplication and versioning
6. **Live API Replay** — Actually call the real Colosseum API and verify responses
7. **Performance Benchmarking** — Compare manual fetch vs. generated client
8. **The Recursion Loop** — Agents judging agents building skills for agents...

**Run it:**
```bash
npx tsx demo/demo-colosseum.ts
```

**Expected output:**
- 🎨 Colorful terminal UI with emojis
- 📊 Real API calls to agents.colosseum.com
- ✓ Verified responses from live endpoints
- 🤯 Meta commentary on self-referential demo

**Key metrics:**
- 7 captured requests → 5 unique endpoints
- 71-line SKILL.md generated
- ~0ms latency overhead
- Meta level: **MAXIMUM**

### 📦 demo-full.ts — Complete Marketplace Flow

The comprehensive demo showing the full Unbrowse pipeline:
Capture → Generate → Sanitize → Hash → Publish → Search → Download → Replay → Track

### ⚡ demo.ts — Quick Start Demo

Basic demonstration of core capture and generation features.

## Why These Demos Matter

**For Judges:**
- Shows real working code against real APIs
- Demonstrates practical utility with familiar examples
- Self-referential demo proves the concept works on your own platform

**For Developers:**
- Copy-paste examples for quick integration
- TypeScript with full type safety
- Production-ready patterns

**For Agents:**
- Shows how to learn APIs from browsing
- Demonstrates skill generation workflow
- Proves the "Internal APIs Are All You Need" thesis

## Running All Demos

```bash
# Install dependencies first
npm install

# Run individual demos
npx tsx demo/demo-colosseum.ts
npx tsx demo/demo-full.ts
npx tsx demo/demo.ts
```

## The Thesis

Every internal API is a potential skill. We just proved it by turning the hackathon platform itself into a reusable agent skill.

---

**Unbrowse** — Internal APIs Are All You Need  
🔗 [GitHub](https://github.com/unbrowse/unbrowse) | 🏆 Colosseum Agent Hackathon 2026
