import { chatJSON } from "@/lib/llm";
import { askOutputSchema } from "@/lib/schemas";
import { ASK_SYSTEM_PROMPT, buildAskUserPrompt } from "@/lib/prompts/ask";
import type { AskResult, Citation } from "@/lib/types";

/** Collapse runs of whitespace so a quote that reflowed newlines still matches. */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Keep only citations whose quote is genuinely present in the contract. An exact
 * substring gets a real character offset; a whitespace-normalized match is still
 * trusted but not exactly locatable (offset null). Quotes that are paraphrased or
 * invented match neither and are dropped — so a citation that survives is one we
 * verified, not merely one the model claimed.
 */
export function verifyCitations(contract: string, citations: Citation[]): Citation[] {
  const normalizedContract = normalizeWhitespace(contract);
  const verified: Citation[] = [];

  for (const { quote } of citations) {
    const trimmed = quote.trim();
    if (!trimmed) continue;

    const offset = contract.indexOf(trimmed);
    if (offset !== -1) {
      verified.push({ quote: trimmed, offset });
    } else if (normalizedContract.includes(normalizeWhitespace(trimmed))) {
      verified.push({ quote: trimmed, offset: null });
    }
    // Otherwise the quote isn't in the contract — drop it.
  }

  return verified;
}

/**
 * Ask: grounded Q&A over the single loaded contract. Pattern — retrieval-style
 * grounding with citations pointing back into the source text. Every returned
 * citation is verified against the contract, so answers are traceable and the
 * model cannot pass off a paraphrased or fabricated quote as a source.
 */
export async function askContract(
  contract: string,
  question: string,
): Promise<AskResult> {
  const { answer, citations } = await chatJSON(
    [
      { role: "system", content: ASK_SYSTEM_PROMPT },
      { role: "user", content: buildAskUserPrompt(contract, question) },
    ],
    askOutputSchema,
  );

  return { answer, citations: verifyCitations(contract, citations) };
}
