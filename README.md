# Spellbook Replica

A minimum working replica of the core workflows of [Spellbook](https://spellbook.com) —
an AI copilot for transactional lawyers. Built for the Caliper Lab environment-construction
assignment.

It reproduces the three **daily-use workflows** that are also three **architecturally
distinct LLM interaction patterns**:

| Workflow | What it does | LLM pattern |
|---|---|---|
| **Review + Redline** | Flags client-unfavorable terms, drafting errors, and missing clauses against an editable **playbook** of firm standards; each issue has a severity, category, source span, and a suggested redline you can accept or dismiss. | Structured extraction → typed JSON |
| **Draft** | Generates a clause from an instruction, optionally grounded in precedent language and the current document, ready to insert. | Grounded instructional generation |
| **Ask** | Answers questions about the loaded contract with **verbatim citations** back into the text. | Retrieval-style grounding + citation |

## Run it (3 commands)

```bash
npm install
cp .env.example .env.local   # then paste your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000 and pick a contract from the **"Load a sample…"** dropdown:

- The **demo NDA** is hand-written and deliberately salted with issues (perpetual
  confidentiality, uncapped indemnity, one-sided jurisdiction) so Review has obvious
  material to flag.
- The remaining entries are **real commercial contracts from CUAD** (Contract
  Understanding Atticus Dataset, CC BY 4.0) — consulting, hosting, software
  maintenance, promotion, and endorsement agreements — for testing against genuine
  documents. Provenance and attribution: [`public/samples/SOURCE.md`](./public/samples/SOURCE.md).

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | yes | Server-side OpenAI calls. Never exposed to the browser. |
| `OPENAI_MODEL` | no | Override the default model (`gpt-4o`). |

Model calls are **real** — there are no mocked responses.

## Architecture

One-directional data flow, with all model logic isolated behind a provider-agnostic
`lib/llm` module so swapping providers is a single-file change.

```
component → fetch('/api/<workflow>') → route.ts (zod-validate)
          → lib/workflows/<workflow> (build prompt)
          → lib/llm (OpenAI, JSON mode) → zod-validate output → typed result → render
```

- `lib/llm/` — single OpenAI client + provider-agnostic `chat` / `chatJSON` helpers.
- `lib/workflows/` — prompt build + parse for each workflow.
- `lib/prompts/` — prompt templates, kept out of code paths.
- `lib/schemas/` — zod validation for every request body and every LLM JSON response.
- `lib/types.ts` — shared domain types (`Issue`, `Citation`, …).
- `app/api/*` — thin controllers: validate → call workflow → typed JSON, with a
  consistent `{ error }` envelope that never leaks provider internals.
- `components/*` — Review, Draft, Ask, and workspace UI, each with loading / empty /
  error states.
- `data/*` — seeded sample contract + playbook.

## Scope — what and why

We built the three workflows above plus a browser document workspace, a seeded
contract + playbook, and the provider-agnostic LLM layer.

**Deliberately out of scope:** database / persistence (forbidden by the brief — the
contract lives in session state), Benchmark/Market and Contract Search (need a
persisted, indexed corpus of thousands of agreements), the Associate multi-document
agent (an orchestration layer beyond a 48h prototype), the literal Word add-in
(the browser pane captures the same UX), and auth / billing / multi-user / deployment
(on the brief's do-not-build list).

Full rationale — including how the workflows were chosen and what a single LLM call
can and can't faithfully replicate — is in [`CLAUDE.md`](./CLAUDE.md) and
[`skills.md`](./skills.md).

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
