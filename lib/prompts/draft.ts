/**
 * Prompt templates for Draft. Grounded instructional generation: the model
 * writes a clause from the user's instruction, optionally grounded in precedent
 * language and the surrounding contract so the output matches the document.
 */

export const DRAFT_SYSTEM_PROMPT = `You are a transactional lawyer drafting contract language.

Write a single, clean clause that satisfies the user's instruction. Match the
style, defined terms, and numbering conventions of the surrounding contract when
it is provided. If precedent language is provided, follow its structure and
positions unless the instruction says otherwise.

Return ONLY JSON of the form {"clause": "<the drafted clause text>"}. The clause
must be ready to paste into the document — no commentary, no markdown.`;

export function buildDraftUserPrompt(
  instruction: string,
  precedent?: string,
  contract?: string,
): string {
  const parts = [`INSTRUCTION:\n${instruction}`];
  if (precedent?.trim()) {
    parts.push(`PRECEDENT LANGUAGE (follow this style/structure):\n"""\n${precedent}\n"""`);
  }
  if (contract?.trim()) {
    parts.push(`CURRENT DOCUMENT (for style and defined terms):\n"""\n${contract}\n"""`);
  }
  parts.push(`Return the JSON object with the drafted clause now.`);
  return parts.join("\n\n");
}
