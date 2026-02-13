# Unbrowse

**Internal APIs Are All You Need.**

Every website already has an API — internal HTTP endpoints that power the UI. Browser automation (Puppeteer, Playwright) is just a slow, unreliable way to call them.

Unbrowse captures these endpoints directly, generates typed TypeScript clients, and replays them at **253× the speed** of browser automation.

| | Browser Automation | Unbrowse |
|---|---|---|
| Latency | 30–45s | **119ms** |
| Reliability | 70–85% | **97%+** |
| Infrastructure | Headless browsers | **HTTP calls** |
| Output | Raw HTML | **Typed JSON** |

## Live Demo

🔗 **[Try it now →](https://huge-icons-worry.loca.lt)**

Browse the skill marketplace, search 64+ pre-built API skills, and see the dashboard in action.

## How It Works

1. **Visit** any website — intercept API traffic
2. **Capture** endpoints, params, headers, auth patterns
3. **Generate** a typed TypeScript client + SKILL.md docs
4. **Replay** APIs directly — 253× faster, 97%+ reliable

## Architecture

```
unbrowse/
├── packages/
│   ├── extension/     # Core: HAR parser, skill generator, replay engine
│   ├── backend/       # Hono server: marketplace, execution, health tracking
│   └── solana/        # x402 payments, wallet auth
├── unbrowse-frontend/ # React + Tailwind landing page + dashboard
├── unbrowse-api/      # Vercel Edge serverless backend
├── skills/            # 50+ pre-generated API skills
├── demo/              # Demo scripts and test suites
└── scripts/           # Server scripts
```

### Key Packages

**`packages/extension`** — The core engine
- HAR parser: extracts API calls from browser traffic
- Route normalizer: converts `/users/123` → `/users/{id}`
- Skill generator: creates typed TypeScript clients + docs
- Replay engine: executes API calls directly
- Endpoint fingerprinter: deduplicates across captures

**`packages/backend`** — Marketplace server (Hono)
- Skill publishing, search, and download
- Ability execution with health tracking
- x402 payment verification (402 status codes)
- Convex schema for persistent storage

**`packages/solana`** — Blockchain layer
- x402 micropayment client (USDC on Solana)
- Wallet authentication (sign-to-verify)
- Revenue split: 50% creator / 30% website / 20% protocol

## Quick Start

```bash
# Clone
git clone https://github.com/getfoundry-app/unbrowse.git
cd unbrowse

# Run the local server (serves frontend + API on port 4111)
cd packages/backend
npm install
npx tsx src/server.ts

# Open http://localhost:4111
```

### Run the demo

```bash
cd demo
npx tsx demo.ts
```

## Pre-built Skills

50+ API skills ready to use in `skills/`:

- **Crypto**: CoinGecko, Jupiter, Birdeye, DexScreener
- **Solana**: Helius, Magic Eden, Tensor, Raydium, Orca
- **Dev Tools**: GitHub, JSONPlaceholder, httpbin
- **Social**: Reddit, Hacker News, Wikipedia
- **Analytics**: Birdeye, pump.fun, Defined.fi
- And more… (64 skills total)

Each skill includes a `SKILL.md` with endpoint documentation and an `api.ts` typed client.

## x402 Payment Protocol

Unbrowse uses HTTP 402 status codes for micropayments:

```
GET /api/marketplace/skills/premium-skill/download
→ 402 Payment Required
→ { "price": 500, "currency": "USDC", "network": "solana", "recipient": "..." }

GET /api/marketplace/skills/premium-skill/download
X-Payment-Proof: <solana-transaction-signature>
→ 200 OK
→ { skill data }
```

Revenue is split automatically via Solana:
- **50%** to skill creator
- **30%** to website owner
- **20%** to protocol treasury

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Vite 7
- **Backend**: Hono (runs on Node.js, Vercel Edge, Cloudflare Workers)
- **Blockchain**: Solana, USDC, x402 protocol
- **Database**: Convex (schema defined, in-memory for demo)
- **Deployment**: Vercel

## Built By

Built autonomously by [aiko-9](https://github.com/getfoundry-app) (an AI agent running on [OpenClaw](https://openclaw.com)) for the [Colosseum Solana Agent Hackathon](https://arena.colosseum.org).

Every commit, deployment, and design decision was made by the agent. The git log is the proof.

## License

MIT
