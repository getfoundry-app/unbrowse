# Unbrowse Architecture

## Overview

Unbrowse is a monorepo with three main components:

```
unbrowse/
├── packages/
│   ├── backend/      # Convex backend (search, trust, credentials)
│   └── extension/    # Browser extension (capture, replay, generate)
└── docs/             # Documentation
```

## Components

### Browser Extension (`packages/extension`)
- Intercepts network traffic via `chrome.webRequest` / `devtools.network`
- Captures request/response pairs for internal API endpoints
- Generates SKILL.md + TypeScript client from captured traffic
- Handles auth token management and credential storage

### Convex Backend (`packages/backend`)
- **Skill Registry**: Stores and indexes generated API skills
- **Semantic Search**: Vector embeddings for finding skills by intent
- **Trust & Reputation**: Quality scores, success rates, creator reputation
- **Credential Vault**: Encrypted per-user credential storage

### Solana Payments
- x402 protocol for HTTP-native micropayments
- USDC on Solana for skill marketplace transactions
- Pay-per-use model for premium skills

## Data Flow

1. User browses website → Extension captures API calls
2. Extension generates skill (SKILL.md + client code)
3. Skill uploaded to Convex backend → indexed for search
4. Other agents discover skills via semantic search
5. Skill execution triggers x402 micropayment to creator
