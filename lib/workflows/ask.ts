import { chatJSON } from "@/lib/llm";
import { askOutputSchema } from "@/lib/schemas";
import { ASK_SYSTEM_PROMPT, buildAskUserPrompt } from "@/lib/prompts/ask";
import type { AskResult, Citation } from "@/lib/types";

/**
 * Canonicalize text for tolerant matching: unify smart quotes/dashes with their
 * ASCII forms and collapse whitespace, so a quote the model lightly reformatted
 * still matches the source. Case is preserved — this only rescues formatting, not
 * paraphrase. Used for presence checks only; the original quote text is what we
 * return and display.
 */
function canonical(text: string): string {
  return text
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip a leading clause label the model may prepend, e.g. "Section 4.1: " or "(a) ". */
function stripLeadingLabel(text: string): string {
  return text
    .replace(/^\s*(?:section|article|clause|§)\s*[0-9ivxlc]+(?:\.[0-9a-z]+)*[.:) –—-]+/i, "")
    .replace(/^\s*\(?[0-9a-z]{1,3}\)[.:) ]+/i, "")
    .trim();
}

/**
 * True if `quote` is genuinely grounded in the contract. A quote joined with an
 * ellipsis (the model omitting a middle span) is accepted when every substantial
 * segment appears in the source, so an honest elided quote isn't discarded while
 * a paraphrased or invented one still fails.
 */
function isGrounded(canonContract: string, quote: string): boolean {
  const segments = quote
    .split(/\s*(?:\.{3,}|…)\s*/)
    .map((s) => canonical(stripLeadingLabel(s)))
    .filter((s) => s.length >= 12);

  if (segments.length > 0) return segments.every((s) => canonContract.includes(s));

  const whole = canonical(stripLeadingLabel(quote));
  return whole.length > 0 && canonContract.includes(whole);
}

/**
 * Keep only citations genuinely present in the contract, de-duplicated. An exact
 * substring gets a real character offset; a match that survives only after
 * formatting/label/ellipsis normalization is trusted but not exactly locatable
 * (offset null). Quotes that are paraphrased or invented match nothing and are
 * dropped — so a citation that survives is one we verified, not merely claimed.
 */
export function verifyCitations(contract: string, citations: Citation[]): Citation[] {
  const canonContract = canonical(contract);
  const verified: Citation[] = [];
  const seen = new Set<string>();

  for (const { quote } of citations) {
    const trimmed = quote.trim();
    if (!trimmed) continue;

    const key = canonical(trimmed).toLowerCase();
    if (!key || seen.has(key)) continue;

    const offset = contract.indexOf(trimmed);
    if (offset !== -1) {
      seen.add(key);
      verified.push({ quote: trimmed, offset });
    } else if (isGrounded(canonContract, trimmed)) {
      seen.add(key);
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
