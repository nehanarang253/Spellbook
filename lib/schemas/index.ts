import { z } from "zod";

/**
 * Runtime validation for every external boundary: incoming request bodies and
 * the JSON the model returns. The inferred types are structurally compatible
 * with the hand-written domain types in `lib/types.ts`, which stay the single
 * source of truth for shapes shared across the app.
 */

// ── Review ──────────────────────────────────────────────────────────────────

export const reviewRequestSchema = z.object({
  contract: z.string().min(1, "Contract text is required."),
  playbook: z.string().min(1, "Playbook standards are required."),
});
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

export const issueSchema = z.object({
  severity: z.enum(["high", "medium", "low"]),
  category: z.enum(["aggressive_term", "drafting_error", "missing_clause"]),
  title: z.string().min(1),
  explanation: z.string().min(1),
  sourceText: z.string(),
  suggestedRedline: z.string(),
});

export const requiredClauseSchema = z.object({
  requirement: z.string().min(1),
  status: z.enum(["present", "partial", "missing"]),
  note: z.string(),
});

/**
 * The model returns an object root (JSON mode requires it) with a summary, the
 * issue list, and a required-clauses checklist. The checklist makes the
 * missing-clause pass explicit rather than relying on the model to volunteer it.
 */
export const reviewOutputSchema = z.object({
  summary: z.string().min(1),
  issues: z.array(issueSchema),
  requiredClauses: z.array(requiredClauseSchema),
});

/** Second-pass gap catcher returns only the issues the first pass missed. */
export const reviewGapOutputSchema = z.object({
  issues: z.array(issueSchema),
});

// ── Draft ───────────────────────────────────────────────────────────────────

export const draftRequestSchema = z.object({
  instruction: z.string().min(1, "An instruction is required."),
  precedent: z.string().optional(),
  contract: z.string().optional(),
});
export type DraftRequest = z.infer<typeof draftRequestSchema>;

export const draftOutputSchema = z.object({
  clause: z.string().min(1),
});

// ── Ask ─────────────────────────────────────────────────────────────────────

export const askRequestSchema = z.object({
  contract: z.string().min(1, "Contract text is required."),
  question: z.string().min(1, "A question is required."),
});
export type AskRequest = z.infer<typeof askRequestSchema>;

export const askOutputSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(z.object({ quote: z.string().min(1) })),
});
