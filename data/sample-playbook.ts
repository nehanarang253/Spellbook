import type { Playbook } from "@/lib/types";

/**
 * Seeded firm-standards playbook injected into Review. This is what makes review
 * *opinionated* rather than a generic risk summary — it encodes preferred and
 * fallback positions the model checks the contract against, from the Receiving
 * Party's perspective (the client we represent).
 */
export const SAMPLE_PLAYBOOK: Playbook = {
  standards: `We represent the RECEIVING PARTY. Review every clause from their perspective
and flag terms that are unfavorable, one-sided, or non-standard.

CONFIDENTIALITY TERM
- Preferred: obligations expire 2-3 years after disclosure.
- Fallback: up to 5 years.
- Unacceptable: perpetual or indefinite confidentiality obligations. Flag as an aggressive term.

LIABILITY & INDEMNIFICATION
- Preferred: no indemnification clause; each party bears its own losses.
- Fallback: mutual indemnity capped at fees paid or a fixed amount.
- Unacceptable: uncapped or unlimited indemnification, or one-sided indemnity running only from the Receiving Party. Flag as an aggressive term.

MUTUALITY
- Confidentiality, indemnity, and remedies should be mutual and reciprocal.
- Flag any obligation that binds only the Receiving Party where it should run both ways.

GOVERNING LAW & JURISDICTION
- Preferred: a neutral or the Receiving Party's home jurisdiction.
- Flag exclusive jurisdiction in the Disclosing Party's home state as a point to negotiate.

REQUIRED CLAUSES (flag as missing_clause if absent)
- A defined term/duration with a clear end date.
- A carve-out excluding information that is public, independently developed, or lawfully received from a third party.
- A mutual right to terminate the agreement on notice.

DRAFTING QUALITY
- Flag ambiguous defined terms, undefined references, and internal inconsistencies as drafting_error.`,
};
