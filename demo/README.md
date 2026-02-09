# Unbrowse Demo

End-to-end demonstration of the Unbrowse pipeline:

**Capture → Generate → Search → Replay**

## Quick Start

```bash
cd demo
npx tsx demo.ts
```

## What It Does

1. **Capture** — Simulates capturing 5 HTTP requests from `jsonplaceholder.typicode.com`
2. **Parse** — Extracts API structure, detects authentication method
3. **Normalize** — Deduplicates routes, replaces IDs with `:id` parameters
4. **Generate** — Produces `SKILL.md` (docs) + `api.ts` (typed client)
5. **Search** — Queries the generated skill index
6. **Replay** — Makes a real HTTP call and compares against browser automation (~30s)

## Requirements

- Node.js 18+
- [tsx](https://github.com/privatenumber/tsx) (auto-installed via `npx`)

Or install locally:

```bash
npm install -D tsx
npx tsx demo.ts
```

## Expected Output

The demo prints a colorful terminal walkthrough showing each pipeline step, the generated artifacts, and a performance comparison demonstrating **100x+ speedup** over browser automation.
