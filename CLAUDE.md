# CLAUDE.md — Spellbook Replica (Caliper Lab Engineering Assignment)

This file is the single source of truth for **what we are building, why, and to what standard**.
Read it before writing or reviewing any code.

---

## 1. Context

Caliper Lab builds functional replicas of AI SaaS products to run structured
evaluations against them ("environment construction"). This project is a
**minimum working replica of the core workflows of [Spellbook](https://spellbook.com)** —
an AI-powered contract drafting and review tool for legal teams.

We are **not** building a pixel-perfect clone. We are building the smallest
environment that faithfully captures Spellbook's **essential architecture and
key user-facing workflows**. Scope judgment (what we include vs. cut) is part of
the evaluation.

- **Time budget:** 48 hours from receipt.
- **Submission:** GitHub repo + README (≤ 3 commands to run locally).
- **Follow-up:** 30-minute screen-share walkthrough.

---

## 2. Product understanding (Spellbook)

Word-native AI copilot for transactional lawyers. Full feature surface:

| Feature | What it does |
|---|---|
| **Review / Redline** | Scans a contract; flags client-unfavorable ("aggressive") terms, drafting errors, and missing clauses; proposes redlines + comments the user approves. |
| **Draft** | Generates clauses or full sections from a prompt and/or the firm's precedents. |
| **Ask** | Q&A about the contract, answered with citations back into the document. |
| **Playbooks** | Encode a firm's standards / preferred + fallback language so review runs consistently. |
| **Benchmark / Market** | Compares clauses against thousands of comparable agreements. |
| **Associate** | Agent that runs multi-document projects (datarooms, financings). |
| **Contract Search** | Indexes signed contracts for retrieval. |

---

## 3. Scope decision — the three workflows we replicate

We build the **three daily-use workflows that are also three architecturally
distinct LLM interaction patterns** (not three flavors of one call):

1. **Review + Redline against a Playbook**
   Structured, clause-level analysis. The model returns a typed list of issues
   (severity, category: `aggressive_term` / `drafting_error` / `missing_clause`,
   the offending text span, and a suggested redline). The Playbook (firm
   standards) is injected into the prompt so review is opinionated, not generic.
   → *Pattern: structured extraction / JSON output.*

2. **Draft**
   Generate a clause or section from an instruction plus optional precedent
   language and the current document context.
   → *Pattern: grounded instructional generation.*

3. **Ask**
   Grounded Q&A over the loaded contract, with citations pointing back to the
   source text.
   → *Pattern: retrieval-style grounding + citation.*

### ✅ In scope — what we ARE building (with reason)

| We build | Reason it's in scope |
|---|---|
| **Review + Redline against a Playbook** | Spellbook's flagship daily action; Playbook injection lets us replicate the *logic* (opinionated, standards-driven review), not a generic risk summary. |
| **Draft** (clause/section generation) | The other half of a transactional lawyer's day; faithful with a single grounded LLM call. |
| **Ask** (grounded Q&A with citations) | Everyday "what does this contract say about X" with a trust/citation requirement; one loaded document fits in context. |
| **Browser document workspace** (paste/upload text, 3 tabs) | Mimics Spellbook's in-document experience without needing the Word add-in. |
| **Seeded sample contract + playbook** | Lets a reviewer see the full workflow value in one click. |
| **Provider-agnostic `lib/llm` module** | Faithful architecture + a one-line provider swap (OpenAI now). |

### ❌ Out of scope — what we are NOT building (with reason)

| We skip | Reason it's cut |
|---|---|
| **Database / persistence** | **Explicitly forbidden by the brief (§3).** Contract lives in client/session state instead. |
| **Benchmark / Market comparison** | Needs a real corpus of thousands of agreements + a vector/embedding index — impossible to do faithfully without a DB (which is forbidden). Honest answer to the "can't do with a straight LLM call" question. |
| **Contract Search** | Needs a persisted, indexed contract history — same DB constraint. |
| **Associate (multi-doc agent)** | An agentic orchestration layer *on top of* the three primitives; too large for a 48h prototype. |
| **Literal Microsoft Word add-in** | Out-of-process Office integration adds no evaluation signal; the browser document pane captures the same UX. |
| **Authentication · billing · multi-user · production deployment** | **Explicitly on the brief's "do not build" list (§3).** |

> The cut list is deliberate and defensible — walkthrough questions #3 and #4
> ask exactly *what* we left out and *why*. Each row above is that answer.

---

## 4. Deliverables checklist

- [ ] Next.js (App Router) + TypeScript + Tailwind project that runs with **≤ 3 commands**.
- [ ] **Workflow 1 — Review:** paste/upload a contract + pick/edit a Playbook → typed list of flagged issues with severity, category, source span, and suggested redline; user can accept/dismiss.
- [ ] **Workflow 2 — Draft:** instruction + optional precedent/context → generated clause the user can insert.
- [ ] **Workflow 3 — Ask:** question over the loaded contract → grounded answer with citations to the text.
- [ ] Shared **document workspace** UI (three tabs/panes) navigable by a non-technical user.
- [ ] **Real OpenAI API calls** — no mocked model responses.
- [ ] All model calls isolated behind one `lib/llm` module (provider-swappable).
- [ ] Sample contract + sample playbook seeded so a reviewer can click through immediately.
- [ ] `README.md` — setup, env vars, run commands (≤ 3), and a short "what/why" scope note.
- [ ] `CLAUDE.md` (this file) committed. (`skills.md` is kept local-only — see `.gitignore`.)
- [ ] Clean commit history; no secrets committed (`.env.local` git-ignored, `.env.example` provided).

### Explicitly NOT building (per brief)
Authentication · billing · multi-user · production deployment · database.

---

## 5. Tech stack & provider

- **Framework:** Next.js (App Router) · **Language:** TypeScript (strict) · **Styling:** Tailwind CSS.
- **LLM provider:** **OpenAI** (key provided by email). *Note:* brief §2 says OpenAI,
  §3 says Anthropic — we build on OpenAI and isolate all calls behind `lib/llm`
  so the provider is a one-line swap.
- **State:** React state / context only. **No database** — the loaded contract
  lives in client state for the session.

---

## 6. Architecture (modular structure — REQUIRED)

Keep a clean separation between **UI**, **API routes**, and **LLM/domain logic**.
No business logic in React components; no OpenAI SDK calls in components.

```
app/
  layout.tsx
  page.tsx                     # workspace shell (tabs: Review | Draft | Ask)
  api/
    review/route.ts            # POST -> reviewContract()
    draft/route.ts             # POST -> draftClause()
    ask/route.ts               # POST -> askContract()
components/
  workspace/                   # document pane, tab nav
  review/                      # issue list, issue card, severity badge
  draft/                       # draft form, result panel
  ask/                         # question box, answer + citations
lib/
  llm/
    client.ts                  # single OpenAI client instance (env-based)
    index.ts                   # provider-agnostic wrapper (chat/JSON helpers)
  workflows/
    review.ts                  # prompt build + parse for Review
    draft.ts                   # prompt build + parse for Draft
    ask.ts                     # prompt build + parse for Ask
  prompts/                     # prompt templates, kept out of code paths
  schemas/                     # zod schemas for request + LLM JSON output
  types.ts                     # shared domain types (Issue, Citation, ...)
data/
  sample-contract.ts           # seeded NDA/SaaS agreement
  sample-playbook.ts           # seeded firm standards
```

**Data flow (one direction):**
`component` → `fetch('/api/<workflow>')` → `route.ts` (validate with zod) →
`lib/workflows/<workflow>` (build prompt) → `lib/llm` (OpenAI) →
validate JSON with zod → typed result → component renders.

---

## 7. Coding standards & best practices

This code **will be reviewed by a technical evaluator**. Treat quality as a
first-class deliverable.

**General**
- Small, single-responsibility modules. No god files.
- Meaningful names; no dead code, no commented-out blocks, no `console.log` noise.
- Comments explain **why**, not what. Match the surrounding style.

**TypeScript**
- `strict: true`. No `any` — use precise types or `unknown` + narrowing.
- All shared shapes live in `lib/types.ts`. Export types, not implicit shapes.
- Validate **every** external boundary (request bodies and LLM JSON output) with **zod**.

**API routes**
- Thin controllers: validate input → call a `lib/workflows` function → return typed JSON.
- Proper status codes and a consistent error envelope `{ error: string }`.
- Never leak the API key or raw provider errors to the client.

**LLM layer**
- One place constructs the OpenAI client (`lib/llm/client.ts`), reading the key from env.
- Request structured output (JSON mode / response schema) and validate it before use.
- Prompts live in `lib/prompts/*` as named templates, not inline string soup.
- Handle failures gracefully: timeouts, malformed JSON, rate limits → typed errors.

**React / UI**
- Server Components by default; `'use client'` only where interactivity is needed.
- No data-fetching or business logic inside components — call the API routes.
- Loading, empty, and error states for every async action.
- Accessible, keyboard-navigable controls; Tailwind utility classes, no inline styles.

**Security & config**
- Secrets only in `.env.local` (git-ignored). Ship `.env.example`.
- All model calls are **server-side**; the key never reaches the browser.

**Hygiene**
- ESLint + Prettier clean. `npm run build` and `npm run lint` pass before commit.
- Conventional, descriptive commit messages; logical, reviewable commits.

---

## 8. Run commands (target — ≤ 3)

```bash
npm install
cp .env.example .env.local   # then paste your OPENAI_API_KEY
npm run dev
```

---

## 9. Walkthrough call — questions we must be ready to answer

1. What does Spellbook do, and how did we pick these three workflows?
2. What did we build — main components and how they connect?
3. Gaps vs. the real product — what we left out and why.
4. What couldn't be done with a straightforward LLM call, and what would close the gap?
5. How would we run this process for a different AI product, and how long would it take?

Our scope decisions in §3 are written to answer #1, #3, and #4 directly.
