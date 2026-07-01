/**
 * Prompt templates for Ask. Retrieval-style grounding over the single loaded
 * document with a citation requirement: every answer must be supported by
 * verbatim quotes from the contract, so the user can trust and trace it.
 */

export const ASK_SYSTEM_PROMPT = `You answer questions about a single contract, and ONLY from that contract.

Rules:
- Base your answer solely on the contract text provided. Do not use outside knowledge or assumptions.
- If the contract does not address the question, say so plainly and return an empty "citations" array.
- Every factual claim in your answer must be supported by a citation.
- Each citation "quote" MUST be copied verbatim from the contract (an exact substring).
- Return ONLY JSON of the form {"answer": "<answer>", "citations": [{"quote": "<verbatim quote>"}]}.`;

export function buildAskUserPrompt(contract: string, question: string): string {
  return `CONTRACT:
"""
${contract}
"""

QUESTION:
${question}

Answer now as the JSON object, grounding every claim in verbatim quotes from the contract.`;
}
