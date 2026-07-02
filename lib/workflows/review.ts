import { chatJSON } from "@/lib/llm";
import { reviewOutputSchema, reviewGapOutputSchema } from "@/lib/schemas";
import {
  REVIEW_SYSTEM_PROMPT,
  buildReviewUserPrompt,
  REVIEW_GAP_SYSTEM_PROMPT,
  buildReviewGapUserPrompt,
} from "@/lib/prompts/review";
import type { Issue, IssueSeverity, ReviewResult } from "@/lib/types";

const SEVERITY_ORDER: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };

/** Normalize text for loose de-duplication across the two review passes. */
function norm(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** True if a gap-pass issue is a duplicate of something the first pass already found. */
function isDuplicate(candidate: Omit<Issue, "id">, existing: Omit<Issue, "id">[]): boolean {
  const title = norm(candidate.title);
  const source = norm(candidate.sourceText);
  return existing.some((e) => {
    if (norm(e.title) === title) return true;
    if (source && source.length > 20) {
      const es = norm(e.sourceText);
      if (es && (es.includes(source) || source.includes(es))) return true;
    }
    return false;
  });
}

/**
 * Review + Redline: structured, clause-level analysis against a playbook.
 * Pattern — structured extraction / JSON output. Runs two passes for recall: an
 * exhaustive first pass, then a senior "gap catcher" that finds what the first
 * pass missed. The merged, de-duplicated issues are severity-sorted and each
 * gets a stable id for the UI's accept/dismiss state.
 */
export async function reviewContract(
  contract: string,
  playbook: string,
): Promise<ReviewResult> {
  const { summary, issues, requiredClauses } = await chatJSON(
    [
      { role: "system", content: REVIEW_SYSTEM_PROMPT },
      { role: "user", content: buildReviewUserPrompt(contract, playbook) },
    ],
    reviewOutputSchema,
    // An exhaustive, section-by-section review with redlines is long; give it room.
    { maxTokens: 8000 },
  );

  // Second pass: hunt only for issues the first pass missed, then merge.
  let merged = issues;
  try {
    const { issues: gapIssues } = await chatJSON(
      [
        { role: "system", content: REVIEW_GAP_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildReviewGapUserPrompt(
            contract,
            playbook,
            issues.map((i) => i.title),
          ),
        },
      ],
      reviewGapOutputSchema,
      { maxTokens: 6000 },
    );
    const additions = gapIssues.filter((gi) => !isDuplicate(gi, merged));
    merged = [...merged, ...additions];
  } catch {
    // The gap pass is a recall booster, not load-bearing: if it fails, the
    // first-pass review still stands on its own.
  }

  const ordered = [...merged]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .map((issue, index) => ({ id: `issue-${index}`, ...issue }));

  return { summary, issues: ordered, requiredClauses };
}
