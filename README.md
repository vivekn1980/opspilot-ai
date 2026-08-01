# OpsPilot AI — MVP

Phase 1 slice of the platform described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): **Incident Management**, the **AI Log Analyzer**, and the **RCA Generator**, wired into one dashboard.

## Stack

- `apps/api` — NestJS + Prisma (SQLite for local dev) + the Anthropic SDK
- `apps/web` — Next.js (App Router)

This is a deliberate simplification of the target architecture for a fast MVP: one Node service instead of split domain/AI services, SQLite instead of pooled Postgres with RLS, no auth or multi-tenancy yet. Those land in later phases per the roadmap in the architecture doc.

## Setup

```bash
npm install
```

Add your Anthropic API key to `apps/api/.env` (copy the shape from `.env.example` if you need to recreate it):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Everything else (`DATABASE_URL`, `NEXT_PUBLIC_API_URL`) already has working local defaults.

## Run

Two terminals:

```bash
npm run dev:api   # http://localhost:4000/api — creates apps/api/prisma/dev.db on first run
npm run dev:web   # http://localhost:3000
```

## What works without an API key

Creating, listing, updating, and viewing incidents — the core Incident Management workflow — needs no AI key. **Analyze Logs** and **Generate RCA** call Claude (`claude-opus-5`) and need `ANTHROPIC_API_KEY` set in `apps/api/.env`.

## Next steps

See the Phase 2/3 roadmap in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Problem/Change Management, SOP Generator, Docs Chat (RAG), Shift Handover, then Reporting and multi-tenant/enterprise hardening.
