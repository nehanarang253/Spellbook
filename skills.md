# skills.md — Method, Skills Demonstrated & Evaluation Mapping

Companion to [`CLAUDE.md`](./CLAUDE.md). Where `CLAUDE.md` defines *what* we
build and *to what standard*, this file records *how* we approached it and
*which skills* the assignment is testing — so the build and the walkthrough stay
aligned with what Caliper Lab is actually grading.

---

## 1. The skill being tested: environment construction

Caliper Lab evaluates AI products by reproducing their core workflows in a
controlled environment, then running structured tests. The assignment is a proxy
for that job. The graded skills are:

1. **Product decomposition** — reverse-engineering a product into its essential
   workflows from the outside.
2. **Scope judgment** — deciding what captures the essence vs. what is noise,
   under a hard time budget.
3. **Architecture** — expressing those workflows as clean, modular, faithful code.
4. **Fidelity of logic** — replicating *how* the product reasons, not just how it looks.
5. **Communication** — explaining and defending every decision in the walkthrough.

Everything below maps our work to these five.

---

## 2. Our process (repeatable method)

This is the exact process we'd reuse for any AI product (see §5 — it answers the
walkthrough's "different product" question).

1. **Explore & research** — use the live product + public docs, reviews, and help
   center to map the full feature surface. *(Done — recorded in `CLAUDE.md §2`.)*
2. **Identify the daily core** — separate everyday primitives from advanced /
   enterprise add-ons.
3. **Cluster by interaction pattern** — group features by the *type* of LLM call
   they require (structured extraction vs. generation vs. grounded QA vs.
   retrieval). Pick workflows that span distinct patterns, not duplicates.
4. **Scope against constraints** — drop anything that can't be faithful within the
   rules (no DB → no corpus-backed features) or the time budget.
5. **Design the modular architecture** — one-directional data flow, LLM logic
   isolated behind a provider-agnostic module.
6. **Build vertically** — one workflow end-to-end (UI → API → LLM → typed render)
   before the next, so each is demonstrably working.
7. **Seed realistic data** — sample contract + playbook so a reviewer sees value
   in one click.
8. **Document & rehearse the rationale** — this file + `CLAUDE.md` + README.

---

## 3. Why these three workflows (skill: scope judgment)

We chose **Review**, **Draft**, and **Ask** because they are simultaneously the
daily core *and* three architecturally different LLM patterns:

| Workflow | Interaction pattern | Why it earns its slot |
|---|---|---|
| Review + Playbook | Structured extraction → typed JSON issues | Flagship action; Playbook injection shows we replicated the *logic*, not a generic "find risks" prompt. |
| Draft | Grounded instructional generation | The other half of a transactional lawyer's day. |
| Ask | Grounded QA + citations | Everyday "what does this say about X" with a trust/citation requirement. |

Picking three *distinct* patterns (rather than, say, Review + Benchmark + Search,
which are all extraction-over-a-corpus) maximizes what the small build
demonstrates about our architectural range.

**Cut list & justification** lives in `CLAUDE.md §3` — Benchmark/Search (need a
DB-backed corpus, forbidden), Associate (orchestration, too large), literal Word
add-in (replaced by a browser document pane).

---

## 4. What a straightforward LLM call can and cannot do (skill: fidelity)

Framing for walkthrough question #4:

| Faithfully replicable with a single LLM call | Needs infrastructure beyond one call |
|---|---|
| **Review** — structured issue extraction against an in-prompt playbook. | **Benchmark / Market** — needs a corpus of thousands of agreements + a retrieval/embedding index to say how "market" a clause is. |
| **Draft** — instruction + precedent → clause. | **Contract Search** — needs a persisted, indexed contract history. |
| **Ask** — grounding over one loaded document (fits in context). | **Associate** — multi-document planning/agentic orchestration + state across documents. |

Closing those gaps ≈ add a vector store + document ingestion pipeline
(Benchmark/Search) or an agent/orchestration layer with tool use and per-document
state (Associate). This is the honest, specific answer the call is listening for.

---

## 5. Generalizing to another product (skill: method + communication)

For a different AI product (e.g., a financial-document analysis tool), we run the
**same §2 process**:

1. Explore the product + docs (≈ half a day).
2. Map the feature surface; identify the 3–4 daily-core workflows.
3. Cluster by LLM interaction pattern; pick a spanning set of three.
4. Scope out anything requiring data/infra we can't stand up in time.
5. Build vertically behind a provider-agnostic LLM module.
6. Seed realistic sample data; document the rationale.

**Estimated time:** 1.5–2 days for a three-workflow replica of comparable
complexity — most of the cost is in steps 1–3 (understanding + scoping), not
the code.

---

## 6. Skills → artifacts map

| Graded skill | Where it shows up |
|---|---|
| Product decomposition | `CLAUDE.md §2` (feature surface), §3 (mapping). |
| Scope judgment | §3 above + `CLAUDE.md §3` cut list. |
| Architecture | `CLAUDE.md §6` module layout + §7 standards; the code itself. |
| Fidelity of logic | Playbook-injected Review, citation-grounded Ask; §4 above. |
| Communication | This file, `CLAUDE.md §9`, and the README scope note. |
