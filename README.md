# BriefAI

A legal-AI workspace for the firm, built as a **Power Apps Code App** (React +
Vite + Tailwind) that runs inside the firm's Microsoft Power Platform tenant.

BriefAI models the firm as **departments** (practice areas) — Corporate,
Litigation, Real Estate, High-Tech & VC, Tax — each staffed with **agents**
("workers") that handle a specific legal job (e.g. *Lease Review*, *M&A*,
*Case-Law Research*). A central chat lets a lawyer talk to the firm and summon
any worker directly. Bilingual (Hebrew / English, RTL & LTR).

All AI runs on **Copilot Studio agents inside the tenant** — the React app never
calls an external API. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full
picture and [DEPLOY.md](./DEPLOY.md) for the deploy TL;DR.

## Quick start

```bash
nvm use 22
npm install
cp .env.example .env   # VITE_USE_MOCK=true → in-memory mock, no backend
npm run dev
```

The dev loop runs entirely on **mock data** — no Dataverse, no client data, no
egress. Flip to live only against a sandbox org (see ARCHITECTURE.md §"mock → live").
