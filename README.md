# Spellbook Replica

> A minimum working replica of the core workflows of [Spellbook](https://spellbook.com) — an AI copilot for transactional lawyers — built for the Caliper Lab environment-construction assignment.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white" />
  <img alt="OpenAI" src="https://img.shields.io/badge/LLM-OpenAI-412991?logo=openai&logoColor=white" />
</p>

---

## Overview

Spellbook is a Word-native AI assistant that helps lawyers review, draft, and answer
questions about contracts. This project is **not a pixel-perfect clone** — it's the
smallest faithful environment that reproduces Spellbook's **essential architecture and
key daily workflows**, so structured evaluations can be run against it.

The three workflows were chosen deliberately: they are the actions a transactional
lawyer uses every day **and** three architecturally distinct LLM interaction patterns —
not three flavors of the same call.

| Workflow | What it does | LLM pattern |
|---|---|---|
| **Review + Redline** | Flags client-unfavorable terms, drafting errors, and missing clauses against an editable **playbook** of firm standards. Each issue carries a severity, category, source span, and a suggested redline you can accept or dismiss. | Structured extraction → typed JSON |
| **Draft** | Generates a clause from a plain-English instruction, optionally grounded in precedent language and the current document, ready to insert. | Grounded instructional generation |
| **Ask** | Answers questions about the loaded contract with **verbatim citations** back into the text; every citation is verified against the source before it's shown. | Retrieval-style grounding + citation |

All model calls are **real OpenAI calls** — there are no mocked responses.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (`strict`)
- **Styling:** Tailwind CSS 4
- **LLM:** OpenAI (default `gpt-4o`), isolated behind a provider-agnostic `lib/llm` module
- **Validation:** Zod at every external boundary (request bodies + LLM output)
- **State:** React state only — no database (contract lives in session state)

## Getting started

### Prerequisites

- **Node.js 20+** and npm
- An **OpenAI API key**

### Run it (3 commands)

```bash
npm install
cp .env.example .env.local   # then paste your OPENAI_API_KEY
npm run dev
```

Open **http://localhost:3000**.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Server-side OpenAI calls. Never exposed to the browser. |
| `OPENAI_MODEL` | — | `gpt-4o` | Override the model. |
| `OPENAI_BASE_URL` | — | OpenAI | Point the OpenAI SDK at any OpenAI-compatible endpoint (e.g. a self-hosted or alternative provider). Requires `OPENAI_MODEL` to be set. |

Secrets live only in `.env.local` (git-ignored); `.env.example` is the committed template.
All model calls run **server-side** — the key never reaches the browser.

## Usage

1. Pick a contract from the **"Load a sample…"** dropdown (or paste your own):
   - The **demo NDA** is hand-written and deliberately salted with issues (perpetual
     confidentiality, uncapped indemnity, one-sided jurisdiction) so Review has obvious
     material to flag.
   - The remaining entries are **real commercial contracts from CUAD** (Contract
     Understanding Atticus Dataset, CC BY 4.0) — consulting, hosting, software
     maintenance, promotion, and endorsement agreements — for testing against genuine
     documents. Provenance: [`public/samples/SOURCE.md`](./public/samples/SOURCE.md).
2. Choose a tool on the right:
   - **Review** — edit the playbook if you like, then run the review and accept/dismiss issues.
   - **Draft** — describe the clause you need and insert the result into the document.
   - **Ask** — ask a question; click a citation to highlight its source in the document.

Nothing is persisted — reloading the page clears the workspace.

## Architecture

One-directional data flow, with all model logic isolated behind a provider-agnostic
`lib/llm` module so swapping providers is a single-file change.

```
component → lib/api-client → fetch('/api/<workflow>')
          → app/api/<workflow>/route.ts   (zod-validate request)
          → lib/workflows/<workflow>       (build prompt from lib/prompts)
          → lib/llm                        (OpenAI, JSON mode)
          → zod-validate output → typed result → render
```

- **`lib/llm/`** — single OpenAI client (`client.ts`) + provider-agnostic `chatJSON` helper (`index.ts`).
- **`lib/workflows/`** — prompt assembly + response handling for each workflow.
- **`lib/prompts/`** — prompt templates, kept out of the code paths.
- **`lib/schemas/`** — Zod schemas for every request body and every LLM JSON response.
- **`lib/types.ts`** — shared domain types (`Issue`, `Citation`, …).
- **`app/api/*`** — thin controllers: validate → call workflow → typed JSON, with a
  consistent `{ error }` envelope that never leaks provider internals.
- **`components/*`** — Review, Draft, Ask, and workspace UI, each with loading / empty / error states.
- **`data/*`** — seeded sample contract + playbook.

### Project structure

```
app/
  layout.tsx  page.tsx  globals.css
  api/{review,draft,ask}/route.ts   # thin controllers
components/
  workspace/   # document pane, tab nav
  review/      # issue list, issue card, severity badge, clause checklist
  draft/       # draft form + result
  ask/         # question box, answer + citations
  ui/          # shared primitives (tooltip, suggestion chips)
lib/
  llm/         # OpenAI client + provider-agnostic chatJSON
  workflows/   # review / draft / ask logic
  prompts/     # prompt templates
  schemas/     # zod request + output validation
  api.ts  api-client.ts  types.ts
data/          # seeded sample contract + playbook
public/samples/  # real CUAD contracts (see SOURCE.md)
```

## Scope — what and why

**Built:** the three workflows above, a browser document workspace, a seeded
contract + playbook, and the provider-agnostic LLM layer.

**Deliberately out of scope:**

- **Database / persistence** — forbidden by the brief; the contract lives in session state.
- **Benchmark / Market** and **Contract Search** — need a persisted, indexed corpus of
  thousands of agreements.
- **Associate (multi-document agent)** — an orchestration layer beyond a 48h prototype.
- **The literal Word add-in** — the browser document pane captures the same UX.
- **Auth / billing / multi-user / deployment** — on the brief's do-not-build list.

Full rationale — including how the workflows were chosen and what a single LLM call can
and can't faithfully replicate — is in [`CLAUDE.md`](./CLAUDE.md).

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Attribution

Sample contracts are drawn from the **CUAD** dataset (Contract Understanding Atticus
Dataset), licensed **CC BY 4.0**. See [`public/samples/SOURCE.md`](./public/samples/SOURCE.md)
for per-file provenance.
