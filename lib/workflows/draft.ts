import { chatJSON } from "@/lib/llm";
import { draftOutputSchema } from "@/lib/schemas";
import { DRAFT_SYSTEM_PROMPT, buildDraftUserPrompt } from "@/lib/prompts/draft";
import type { DraftResult } from "@/lib/types";

/**
 * Draft: grounded instructional generation. Produces a single clause from an
 * instruction, optionally grounded in precedent language and the current
 * document so the output matches the contract's style and defined terms.
 */
export async function draftClause(
  instruction: string,
  precedent?: string,
  contract?: string,
): Promise<DraftResult> {
  return chatJSON(
    [
      { role: "system", content: DRAFT_SYSTEM_PROMPT },
      { role: "user", content: buildDraftUserPrompt(instruction, precedent, contract) },
    ],
    draftOutputSchema,
    { temperature: 0.4 },
  );
}
