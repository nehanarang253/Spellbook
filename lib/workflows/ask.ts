import { chatJSON } from "@/lib/llm";
import { askOutputSchema } from "@/lib/schemas";
import { ASK_SYSTEM_PROMPT, buildAskUserPrompt } from "@/lib/prompts/ask";
import type { AskResult } from "@/lib/types";

/**
 * Ask: grounded Q&A over the single loaded contract. Pattern — retrieval-style
 * grounding with citations pointing back into the source text, so answers are
 * traceable and trustworthy rather than free-floating.
 */
export async function askContract(
  contract: string,
  question: string,
): Promise<AskResult> {
  return chatJSON(
    [
      { role: "system", content: ASK_SYSTEM_PROMPT },
      { role: "user", content: buildAskUserPrompt(contract, question) },
    ],
    askOutputSchema,
  );
}
