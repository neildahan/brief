# Deploy — BriefAI

Two **separate** pushes. They do different things; do not conflate them.

| Command | Where it goes | What it does |
|---|---|---|
| `git push`      | **GitHub**         | Versions your code. Does **not** change the live app. |
| `pac code push` | **Power Platform** | Publishes the live app. Does **not** touch GitHub. |

## Every change after bootstrap

```bash
cd ~/Projects/BriefAI
nvm use 22

# 1. SAVE to GitHub (history / backup)
git add -A
git commit -m "describe what changed"
git push

# 2. PUBLISH to the live app
npm run build
pac code push
```

Watch for **"App pushed successfully. You can play your app at https://…"**.
The play URL is derived from `power.config.json`:
`https://apps.powerapps.com/play/e/<environmentId>/a/<appId>`.

## First-time bootstrap (one-time)

```bash
nvm use 22
npm install

# auth pac to the target environment
pac auth create --environment <your-environment-url> --deviceCode

# turn this folder into a Code App (writes power.config.json)
pac code init --displayName "BriefAI"
# → wrap the root component in src/App.jsx with the generated <PowerProvider>.

# add each Dataverse table you need
pac code add-data-source -a shared_commondataserviceforapps -c <conn-id> -t <table_logical_name>
```

## Troubleshooting

- **`403 CodeAppOperationNotAllowedInEnvironment`** — Code Apps is off in that
  environment's feature settings, or the change is still propagating (~10–15 min).
- **`pac: command not found`** — open a new terminal or `nvm use 22` first.
- **`pac` hangs / "Broken pipe"** — don't pipe its output (no `| tail`). Ctrl-C
  and rerun. Make sure `nvm use 22` ran in this terminal.
- **`pac auth create` crashes on macOS** — downgrade to `pac` 2.5.1 just for the
  auth step, then back to 2.8.1+ for `pac code` commands.
- **macOS path with spaces** — `pac` breaks on them. Keep the project at a
  space-free path (this one, `~/Documents/Projects/BriefAI`, is fine).
- **Browser blocks Local Play URL** — grant local-network access when prompted;
  open in the browser profile signed into the tenant.
