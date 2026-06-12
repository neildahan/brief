# BriefAI — instructions for Claude Code

BriefAI is a **Power Apps Code App**: a legal-AI workspace that runs inside the
firm's Microsoft Power Platform tenant. React + Vite + Tailwind on the front,
**Dataverse + Copilot Studio agents** on the back. It models the firm as a set
of **departments** (practice areas), each containing **agents** ("workers") that
do a specific legal job. A main chat can summon any worker directly.

## Architecture in one breath

```
React app  →  src/services/dataverse.js (the ONLY backend seam)
                 ├─ Dataverse connector        → departments / agents / chat history
                 └─ cloud flow → Copilot Studio → the AI work (runs in the tenant)
```

The agent roster is **data, not code** — departments and agents live in
Dataverse, so the firm adds workers without redeploying this app.

## Red-line rules (do not violate)

- **No real client data in the repo.** Ever. Develop on mock or a sandbox with
  synthetic data. `.gitignore` enforces it as a backstop, not as the primary
  defense — the primary defense is "don't put it there."
- **No secrets in the repo.** No connection strings, API keys, tenant URLs with
  embedded creds. `.env` is gitignored.
- **One backend seam.** Only `src/services/dataverse.js` talks to Dataverse / a
  flow / Copilot. Adding a new component? It imports `dataverseService` —
  never a connector directly.
- **No external API from this React app.** The app never calls an LLM or any
  third-party endpoint directly. All AI runs through Copilot Studio agents in
  the client's environment, reached only via Power Platform connectors. If a
  change would make the React app `fetch()` an external service, push back.
- **Ask-before-replace.** Any flow that overwrites data must first call
  `replace=false`, surface a confirm modal on `exists`, then call `replace=true`.
- **No-egress is a feature, not a bug.** Source plane (laptop, GitHub) and data
  plane (deployed app + tenant) are separate. If a request would force client
  data through the source plane, push back.

## Dev loop

```bash
nvm use 22
npm run dev          # mock data — VITE_USE_MOCK=true (default)
```

Deploy loop is in DEPLOY.md. Two separate pushes: `git push` → GitHub (version),
`pac code push` → Power Platform (publish the live app).

## Layout

- `src/services/dataverse.js` — the seam. Mock + live stub, identical shape.
- `src/lib/tokens.js` — department colors/icons, status meta.
- `src/lib/i18n.js` — bilingual he/en strings + dir (rtl/ltr).
- `src/App.jsx` — `<PowerProvider>` + the layout/router.
- `src/components/` — presentational components only (import `dataverseService`).
