/**
 * Shared domain types for the three workflows. These are the contract between
 * the API routes, the workflow layer, and the UI — nothing else should redefine
 * these shapes. Runtime validation of the same shapes lives in `lib/schemas`.
 */

// ── Review + Redline ────────────────────────────────────────────────────────

export type IssueSeverity = "high" | "medium" | "low";

export type IssueCategory =
  | "aggressive_term"
  | "drafting_error"
  | "missing_clause";

export interface Issue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  /** Short human-readable title, e.g. "Unlimited liability". */
  title: string;
  /** Why this matters against the playbook. */
  explanation: string;
  /** The offending span copied verbatim from the contract (empty for missing clauses). */
  sourceText: string;
  /** Proposed replacement / redline the user can accept. */
  suggestedRedline: string;
}

// ── Ask (grounded Q&A) ──────────────────────────────────────────────────────

export interface Citation {
  /** Quoted span from the contract that supports the answer. */
  quote: string;
}

export interface AskResult {
  answer: string;
  citations: Citation[];
}

// ── Draft ───────────────────────────────────────────────────────────────────

export interface DraftResult {
  clause: string;
}

// ── Seed data ───────────────────────────────────────────────────────────────

export interface Playbook {
  id: string;
  name: string;
  /** Firm standards / preferred + fallback language injected into review. */
  standards: string;
}
