import { chatJSON } from "@/lib/llm";
import { reviewOutputSchema } from "@/lib/schemas";
import { REVIEW_SYSTEM_PROMPT, buildReviewUserPrompt } from "@/lib/prompts/review";
import type { Issue } from "@/lib/types";

/**
 * Review + Redline: structured, clause-level analysis against a playbook.
 * Pattern — structured extraction / JSON output. The model returns a typed list
 * of issues; we stamp a stable id per issue for the UI's accept/dismiss state.
 */
export async function reviewContract(
  contract: string,
  playbook: string,
): Promise<Issue[]> {
  const { issues } = await chatJSON(
    [
      { role: "system", content: REVIEW_SYSTEM_PROMPT },
      { role: "user", content: buildReviewUserPrompt(contract, playbook) },
    ],
    reviewOutputSchema,
  );

  return issues.map((issue, index) => ({ id: `issue-${index}`, ...issue }));
}
