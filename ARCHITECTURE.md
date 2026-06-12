# BriefAI — Architecture

## 1. What it is

BriefAI is a **Power Apps Code App**: React + Vite + Tailwind compiled into a
bundle that Power Platform hosts and serves inside the firm's tenant. It is
authenticated by Entra (the tenant's identity) and reads/writes **Dataverse**.
The AI work is performed by **Copilot Studio agents** that live in the same
tenant. Nothing leaves the tenant's trust boundary.

## 2. The firm-as-agents model

The product mirrors a real law firm:

- **Department** — a practice area (Corporate & Capital Markets, Litigation,
  Real Estate & Construction, High-Tech & VC, Tax).
- **Agent** ("worker") — a specialist that does one legal job inside a
  department (Lease Review, M&A, Class-Action Analyst, Term Sheet, VAT…).
- **Main chat** — a generalist "front desk" that can answer directly or
  **summon** any worker (`@Lease Review`) into the conversation.

The roster (departments + agents) is **data in Dataverse**, not hard-coded.
The firm can add or retire agents without a code change to this app.

## 3. Every Microsoft connection — and the no-egress rule

```
┌─────────────────────────────────────────────────────────────────────┐
│  React app (this repo)                                               │
│     │                                                               │
│     │  imports ONLY:                                                │
│     ▼                                                               │
│  src/services/dataverse.js   ← the single integration seam          │
│     │                                                               │
│     ├─ Dataverse connector ─────────────► Departments, Agents,      │
│     │   (shared_commondataserviceforapps)  Conversations, Messages  │
│     │                                                               │
│     └─ Cloud flow connector ────────────► Power Automate flow       │
│         dataverseService.invokeAgent()      │                       │
│                                             ▼                       │
│                                      Copilot Studio agent           │
│                                      (the worker, in the tenant)    │
│                                             │                       │
│                                             ▼                       │
│                                      reply → Dataverse / flow → app │
└─────────────────────────────────────────────────────────────────────┘
```

**The React app never makes an external API call.** No LLM key, no third-party
`fetch()`. It only talks to **Power Platform connectors** (Dataverse + a cloud
flow). The AI runs in Copilot Studio inside the tenant. This is the no-egress
guarantee — client data never crosses into the source plane (laptop, GitHub).

### How a worker maps to Copilot Studio

`dataverseService.invokeAgent(agentId, prompt, context)` is intentionally
generic. The `agentId` (the Dataverse `Agent.copilotAgentId`) resolves to a
Copilot Studio target. Two valid tenant topologies — chosen later, no React
change either way:

- **Per-worker agents (recommended target):** each worker is its own Copilot
  Studio agent, with its own knowledge sources and permissions. A "front desk"
  orchestrator agent delegates to them (Copilot Studio connected agents). Best
  separation of knowledge and security; matches the firm-org UI exactly.
- **One agent, many topics:** a single Copilot Studio agent where each worker is
  a topic/skill. Fewer things to manage; shared knowledge base.

## 4. The integration seam — `src/services/dataverse.js`

Single source of all backend access. Three parts:

1. **Contract** — `ENTITY_CONTRACT` maps our logical names to placeholder
   Dataverse logical names (`cr1c4_*`). Remap before going live.
2. **Mock** — in-memory, deterministic, **no client data**. Default in dev.
   Seeds the 5 departments and their workers; `invokeAgent` simulates a reply.
3. **Live** — same shape as mock; wraps `pac code add-data-source`-generated
   typed services + the cloud-flow connector. Filled in when wiring a sandbox.

`mock` and `live` export an **identical surface** — swapping is one line
(`VITE_USE_MOCK`). Add a method to one → add it to the other.

## 4a. Document attachments — security model

Users can attach documents to a chat. The file follows the **same no-egress
path** as everything else and must never touch an external endpoint or this repo:

```
React (paperclip) → dataverseService.attachDocument({ file })
   ├─ LIVE: upload to a Dataverse FILE column (or SharePoint) via connector —
   │        inside the tenant. Returns a documentId.
   └─ MOCK: returns metadata ONLY (name/size/type). No bytes are read, stored,
            written to disk, or sent anywhere. A stray real document dropped in
            during dev cannot leak.
invokeAgent(..., attachments) carries the documentId(s); Copilot Studio reads
the file from in-tenant storage. Entra + Dataverse row-level security govern
who can open which file — attachments inherit the firm's existing permissions.
```

Rules: never `fetch()` a file to a third party; never log file bytes/text (only
metadata); validate type/size; keep dev on synthetic documents only. `.gitignore`
blocks `*.pdf/*.docx/*.xlsx` as a backstop.

## 5. Frontend layout

- `src/App.jsx` — `<PowerProvider>` wrapper + the in-app view router.
- `src/lib/tokens.js` — department colors/icons, status meta.
- `src/lib/i18n.js` — bilingual he/en strings + `dir` (rtl/ltr) toggle.
- `src/components/` — presentational only; data comes via `dataverseService`.

Screens: **Workspace** (sidebar tree + central chat + `@`-summon) ·
**Department** (agent team cards) · **Agent** (role + sample tasks + start chat)
· **History** (past conversations).

## 6. Going from mock → live (one-time, sandbox first)

1. In **Power Apps → Connections**, create a **Microsoft Dataverse** connection
   (and the connection used by the cloud flow). Note the connection id.
2. Generate typed services per table:
   ```bash
   pac code add-data-source -a shared_commondataserviceforapps -c <conn-id> -t <table_logical_name>
   ```
3. Build the Copilot Studio agents (or topics) and the cloud flow that
   `invokeAgent` triggers. Store each worker's Copilot target in
   `Agent.copilotAgentId`.
4. Implement the `live` object using the generated services + the flow. Keep the
   **same shape** as `mock`.
5. Flip the toggle against a **sandbox** org: `echo "VITE_USE_MOCK=false" >> .env`.
6. `npm run build && pac code push` once it works end-to-end.

Never point dev at a production org. The sandbox boundary is the safety net.
