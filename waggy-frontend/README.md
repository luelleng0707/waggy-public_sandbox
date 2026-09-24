# Waggy frontend

Standalone **Waggy / Wagtopia workbench**. Presentation only.

Copy this directory into a new workspace. It does not contain the scientific warehouse, Python engine, optimizer, or secrets.

```
waggy-frontend/
        ↓
HTTP (Waggy API)
        ↓
private Waggy core
```

## What this is

The existing unified workbench:

- Customer / Groomer / Business / Developer tabs
- Health, nutrition modal, packages, provenance
- Saved-dog preferences and recompute
- Ask Waggy UI (explains an existing analysis; does not run Gemini here)

It talks to Waggy through `src/api/client.js`. It does not calculate nutrients, rank packages, or read warehouse files.

## Run independently

1. Copy `waggy-frontend/` to a new folder.
2. The default API base is the verified production API in `src/api/runtime-config.js`. Set `WAGGY_API_BASE_URL` only to override it.
3. From this directory:

```bash
node scripts/serve.mjs --check
node --test tests/*.test.mjs
node scripts/serve.mjs
```

Then open `http://127.0.0.1:5173`.

`npm start` is the same as `node scripts/serve.mjs`. There are **no required npm packages** (`package-lock.json` records an empty tree). Vite is optional (`vite.config.js`).

Google Fonts are loaded from a public CDN for the existing visual language. The workbench still runs if that CDN is blocked.

Override the API:

```bash
# optional override (used by the static server)
set WAGGY_API_BASE_URL=https://waggy-production.up.railway.app

# or query parameter
http://127.0.0.1:5173/?api=https://waggy-production.up.railway.app
```

When unset, `src/api/runtime-config.js` points at `https://waggy-production.up.railway.app`. Same-origin is only the last fallback if no base is configured.

## Environment

Public browser config only:

| Name | Required | Secret? |
|---|---|---|
| `WAGGY_API_BASE_URL` | optional override of runtime-config.js | no |
| `VITE_WAGGY_API_BASE_URL` | optional Vite alias of the same value | no |

Do **not** put Gemini keys, `API_KEYS`, database URLs, or access tokens in this project.

## Demo data

`src/demo/dogs.js` is **SYNTHETIC / DEMO ONLY**. Load Demo pre-fills Dolly. It is not a production customer and not warehouse evidence.

## Left behind (not this package)

- scientific warehouse
- Python engine, scientific care, package search, package optimizer
- Clinical Execution Explorer
- Archived classic/business shells
- SQLite dog-state database
- Authoring studio
