# Waggy Public Sandbox

**Prototype / reference client** for the Waggy API.

This repository shows what a partner could build around Waggy: a client-facing product that collects dog information, calls Waggy over HTTPS, and presents a structured analysis to customers, groomers, businesses, and developers.

> Waggy Public Sandbox is a prototype reference client demonstrating how a partner could experience and integrate Waggy's API.

> **Status: Public Prototype / Reference Client**
>
> This repository demonstrates the intended client experience and API integration boundary for Waggy. It is designed for demonstrations, client discussions, architecture review, and experimentation. It is not the production Waggy backend and does not contain Waggy's private scientific or decision infrastructure.
>
> **The Waggy API server is not included in this repository.** This frontend is a presentation client. By default it calls the verified external API at `https://waggy-production.up.railway.app`. It does not run analysis, optimization, or evidence selection itself.

---

## What is this?

Waggy Public Sandbox is a deliberately lightweight prototype showing how a client application could consume Waggy's API. The repository focuses on the experience at the API boundary rather than exposing Waggy's private scientific and decision infrastructure.

Three layers, three owners:

| Layer | Role | In this repository? |
|---|---|---|
| **The client** | Presentation: intake, dashboards, role views | Yes — `waggy-frontend/` |
| **The contract** | HTTPS / JSON API the client already knows how to call | Client code yes; API server no |
| **The engine** | Private Waggy scientific + deterministic infrastructure | No — by design |

A client does not need to understand Waggy's internal scientific machinery. They build their own product. Waggy remains the underlying analytical infrastructure.

```
CLIENT PRODUCT
      ↓
Waggy API
      ↓
Waggy's scientific + deterministic infrastructure
      ↓
structured analysis
      ↓
client presentation
```

---

## What this is not

This repository does **not** contain:

- Waggy's private scientific warehouse
- proprietary scientific evidence infrastructure
- deterministic health reasoning engine
- nutrition reasoning engine
- product matching implementation
- exhaustive package optimizer
- private dog-state database
- internal agent infrastructure
- private Gemini credentials
- production authentication infrastructure
- internal analytics
- administrative / debug endpoints
- MCP / tool gateway

The absence of these components is deliberate. A client integrating Waggy should consume Waggy capabilities through an API rather than receive or reproduce the underlying proprietary implementation.

This is not a production Waggy server, not a scientific paper, and not an unfinished backend dump. It is an illustrative client experience at the intended integration boundary.

---

## Architecture

```
┌──────────────────────────────────────┐
│        CLIENT APPLICATION            │
│                                      │
│  Customer / Groomer / Business UI    │
│  This repository                     │
└──────────────────┬───────────────────┘
                   │
                   │ HTTPS / JSON
                   ▼
┌──────────────────────────────────────┐
│             WAGGY API                │
│                                      │
│  Public integration boundary         │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│          PRIVATE WAGGY CORE          │
│                                      │
│ Scientific evidence                  │
│ Deterministic analysis               │
│ Product matching                     │
│ Package optimization                 │
│ Provenance                           │
│                                      │
│     NOT INCLUDED IN THIS REPOSITORY  │
└──────────────────────────────────────┘
```

The frontend already contains a centralized HTTP client (`waggy-frontend/src/api/client.js`) and configurable API-base handling. It can point at an external Waggy API. It does not run Python, read a warehouse, or optimize packages locally.

---

## The client perspective

This prototype answers a practical question:

> If I were a Waggy client, what would I actually build around the API?

```
Client collects dog information
         ↓
Client sends a structured request
         ↓
Waggy API performs analysis
         ↓
Waggy returns a structured envelope
         ↓
Client decides how to present it
         ↓
Customer / groomer / business sees the result
```

The client is not expected to recreate Waggy's scientific reasoning. This frontend demonstrates **consumption and presentation**.

A partner could replace this UI with their own:

- pet intake
- customer dashboard
- groomer interface
- health report
- nutrition experience
- product recommendations
- package comparison
- business dashboard
- AI assistant

Waggy stays behind the API.

---

## What the prototype demonstrates

The workbench is one application with four role tabs. Switching roles does **not** rerun the engine. Each view is a projection of the same API envelope.

### Customer view

- dog intake (breed, birthday, weight, sex, activity, environment, observed conditions, optional budget)
- health analysis presentation (findings, prevalence where returned, evidence links)
- nutrition facts modal from returned package rows
- product / package recommendations by care level (Essential / Balanced / Optimal)
- client-side comparison of selected bundles already returned by the API
- Ask Waggy entry point on a package

### Groomer view

- additional observation notes and flags (observations, not diagnoses)
- the same underlying analysis envelope
- groomer-oriented presentation, flags, follow-up copy, and product rationale where the API provides them

### Business view

- business-oriented projection of the same result
- portfolio / package presentation
- commercial fields returned by the API (snapshot, financials, catalog notes) — not calculated here

### Developer view

- API / engine / warehouse version display when the envelope includes them
- analysis signature and correlation id
- optimizer / search provenance as returned JSON
- structured inspection of the live workbench response

None of these views independently perform health, nutrition, matching, or package ranking. They render what the Waggy API returns.

---

## One analysis, many projections

Health, nutrition, products, and package recommendations are not independently calculated by the frontend.

The workbench currently calls:

```http
POST /api/v1/presentation/workbench
```

The response is a structured presentation envelope. The UI stores that envelope and projects it into the four role views.

```
One Waggy analysis
       ↓
canonical result
       ↓
multiple client-facing projections
```

That is the integration idea: a client sends dog context once, receives a unified result, and owns presentation.

---

## API integration

The client lives in `waggy-frontend/src/api/client.js`. The UI does not call `fetch` directly. The API base URL is configurable so this frontend can target an external Waggy API without embedding the engine.

### Currently used by this prototype

| Method | Path | Client use |
|---|---|---|
| `POST` | `/api/v1/presentation/workbench` | Run Analysis |
| `POST` | `/api/v1/dogs` | Save dog (create) |
| `PATCH` | `/api/v1/dogs/{dog_id}` | Save dog (update) |
| `GET` | `/api/v1/dogs/{dog_id}` | Load dog |
| `GET` | `/api/v1/dogs/{dog_id}/events` | Care history |
| `GET` | `/api/v1/dogs/{dog_id}/preferences` | Stored preferences |
| `POST` | `/api/v1/dogs/{dog_id}/recompute` | Recompute with preferences |
| `POST` | `/api/v1/ai/explain` | Ask Waggy |

Optional navigation links (not analysis):

| Method | Path |
|---|---|
| `GET` | `/health` |
| `GET` | `/docs` |
| `GET` | `/openapi.json` |

This is the **current prototype integration boundary**, discovered from the existing frontend. It is not a claim about the final production API.

The frontend currently sends **no authentication headers**. Production auth is not implemented here.

Full request/response field inventory: [docs/API_CONTRACT_DISCOVERY.md](docs/API_CONTRACT_DISCOVERY.md).

---

## Client ↔ API contract (illustrative)

The client sends structured input. Waggy returns a structured analysis. The client renders it.

```
Client:

{
  "name": "Dolly",
  "breeds": [
    "Labrador Retriever",
    "Golden Retriever"
  ],
  "weight": 30,
  "sex": "Female",
  "activity_level": "Moderate"
}

             ↓

          Waggy API

             ↓

   Structured analysis envelope
   (health, nutrition, products,
    packages, evidence, provenance)

             ↓

Client renders:

    Health
    Nutrition
    Products
    Packages
    Evidence
    Provenance
```

The frontend does not calculate that envelope. It posts JSON and presents the response.

---

## Demo dog: Dolly

Dolly is local demo **input** in `waggy-frontend/src/demo/dogs.js`.

Load Demo pre-fills the form so the prototype is immediately understandable. Dolly is:

- synthetic / demo only
- not scientific evidence
- not a real customer record
- not a production database row

Load Demo does not persist a dog and does not run the engine. Run Analysis still posts to the Waggy API. Product catalogs, prices, nutrients, and findings are not hardcoded as scientific or commercial output in this repository; they are expected from the API when a backend is connected.

---

## AI-assisted Waggy vision

The prototype includes an **Ask Waggy** panel as a demonstration of the intended AI-assisted client experience. It explains an analysis the engine already produced. It is not Gemini, not an MCP tool server, and not a scientific authority.

### Current prototype

```
UI
  ↓
POST /api/v1/ai/explain
  ↓
API response
  ↓
explanation shown to the user
```

Ask Waggy requires a successful workbench analysis first. The UI copy is explicit: chat does not choose products or recompute packages.

### Future / intended architecture

```
User
  ↓
Waggy Agent
  ↓
bounded evidence / authorized tools
  ↓
deterministic Waggy capabilities
  ↓
canonical result
  ↓
Agent explanation
```

The AI should eventually function as an orchestration and explanation layer, not the scientific authority.

**The AI should not independently invent scientific findings, choose products, override deterministic constraints, or modify the scientific warehouse.**

### Future / vision — operational agent panel

The desired “Ask Waggy” experience is closer to an operational agent panel than a generic chatbot:

```
┌───────────────────────────────┐
│ Ask Waggy                     │
│                               │
│ Why wasn't this product       │
│ recommended?                  │
│                               │
│ ───────────────────────────   │
│ Inspecting package criteria   │
│ Checking nutrient constraints │
│ Checking product eligibility  │
│                               │
│ Result: ...                   │
└───────────────────────────────┘
```

An eventual agent could:

- understand user intent
- inspect authorized Waggy results
- explain why a result occurred
- propose structured changes
- request authorized changes
- trigger deterministic recomputation
- report what changed

Those capabilities are **not implemented in this repository**. They are product vision for a future agent sitting on the API, not a claim about the current UI.

---

## Customer, groomer, business — and science

Waggy is intended to support different client-facing levels on **one** analytical infrastructure.

### Customer

Simple inputs: dog identity, breed, age, weight, sex, activity, preferences, budget. The customer does not need Waggy's scientific ontology.

### Groomer

Additional observations: physical traits, coat, morphology, observed conditions, other authorized notes. These are **observations**, not automatically scientific facts or diagnoses.

### Business

Commercial configuration could eventually include approved catalogs, brands, advertised products, package constraints, segments, and analytics. Business configuration should influence the **commercial search space**, not rewrite scientific truth.

### Science / Waggy (private)

Evidence, papers, mappings, scientific facts, validation, and reasoning. This layer is intentionally outside this repository. The API may return structured evidence and provenance for the client to display.

---

## Why this architecture?

### For clients

Build your own experience without owning the scientific engine.

### For Waggy

The scientific core remains controlled, versioned, and unpublished.

### For developers

The API is the stable integration boundary. This reference client already speaks it.

### For AI

AI can operate through bounded, authorized capabilities rather than unrestricted access to internal systems.

### For scientific integrity

Scientific facts stay separate from presentation copy and language-model output.

---

## Scientific traceability (presentation)

When the API returns them, the UI can display:

- scientific findings
- observed prevalence where available
- scientific quotes
- paper names and publication years
- evidence links
- engine / warehouse versions and analysis signature
- optimizer search provenance in the developer view

The client does not own the evidence warehouse. The API provides structured evidence and provenance for presentation.

Language in this prototype is preventative and warehouse-backed where the API says so: evidence indicates, observed prevalence, warehouse-backed finding, preventative relevance.

This UI does **not** claim that a package guarantees prevention, that a product cures, or that a bundle prevents disease.

---

## Product and package vision

```
Waggy API
   ↓
product eligibility
   ↓
nutrient constraints
   ↓
package ranking
   ↓
package options
   ↓
client UI
```

The private Waggy engine may evaluate the full permitted search space; this repository only presents the resulting API contract. The client should not need to know how combinations are enumerated internally. The API returns structured package information; this frontend renders it.

---

## Why this exists for a client pitch

This repository is designed so a prospective client can see:

1. what a customer-facing Waggy integration could look like
2. what data they would provide
3. what Waggy would return
4. how health / nutrition / product / package information could appear
5. how different roles could consume the same Waggy infrastructure
6. how an AI assistant could sit on top of the API
7. where the boundary between their application and Waggy's infrastructure lives

The purpose is **not** to expose proprietary implementation. The purpose is to make the integration model concrete.

---

## How to run

The prototype UI is a static frontend (Node 18+). There are no required npm packages.

```bash
cd waggy-frontend
npm start
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

The workbench loads with Dolly pre-filled. Run Analysis, Save / Load dog, Recompute, and Ask Waggy call the configured Waggy API. The default base is the verified production API in `src/api/runtime-config.js`.

`npm start` is `node scripts/serve.mjs`. Equivalent:

```bash
cd waggy-frontend
node scripts/serve.mjs --check
node scripts/serve.mjs
```

Optional checks:

```bash
cd waggy-frontend
node --test tests/api-client.test.mjs tests/isolation.test.mjs
```

Google Fonts load from a public CDN for the existing visual language. The workbench still runs if that CDN is blocked.

`npm start` serves `/`, `/demo`, `/classic`, `/business`, and `/developer` as this same workbench. `?role=` selects a projection and does not call the API.

---

## Pointing at a Waggy API

The public sandbox default is the verified production API:

`https://waggy-production.up.railway.app`

That value lives in `waggy-frontend/src/api/runtime-config.js` as `globalThis.__WAGGY_API_BASE_URL__`. It is configuration, not a per-call URL. Override it only when you intend to point at a different API:

```bash
set WAGGY_API_BASE_URL=https://waggy-production.up.railway.app
```

Or a query parameter:

```
http://127.0.0.1:5173/?api=https://waggy-production.up.railway.app
```

Resolution order in the client:

1. `?api=` query parameter  
2. `globalThis.__WAGGY_API_BASE_URL__` (runtime-config.js, or the static server when the env var is set)  
3. `VITE_WAGGY_API_BASE_URL` when a bundler defines it  
4. `<meta name="waggy-api-base">`  
5. same origin (`window.location.origin`) — only if no base was configured

See `waggy-frontend/.env.example`. Do not put Gemini keys, database credentials, or API secrets in this project.

When the UI is served by the Waggy API itself and runtime config is empty, same-origin is enough. This public sandbox sets a base so a separately hosted frontend does not call itself.

If the API is on a different origin, that API must allow browser CORS. This frontend does not embed CORS or authentication configuration.

---

## Repository layout

```
waggy-public_sandbox/
├── waggy-frontend/          # reference client (presentation only)
│   ├── src/api/             # HTTP client + base URL + errors
│   ├── src/workbench.js     # role UI
│   ├── src/demo/dogs.js     # Dolly — synthetic input
│   └── scripts/serve.mjs    # independent static host
└── docs/                    # API discovery (engineering audit)
```

Engineering discovery (how this client talks to Waggy today):

- [docs/OMEGA_PUBLIC_SANDBOX_API_DISCOVERY.md](docs/OMEGA_PUBLIC_SANDBOX_API_DISCOVERY.md)
- [docs/API_CONTRACT_DISCOVERY.md](docs/API_CONTRACT_DISCOVERY.md)
- [docs/API_DEPENDENCY_GRAPH.md](docs/API_DEPENDENCY_GRAPH.md)
- [docs/api-contract-discovery.json](docs/api-contract-discovery.json)

Frontend-specific notes: [waggy-frontend/README.md](waggy-frontend/README.md).
