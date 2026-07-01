import OpenAI from "openai";

/**
 * The one place the OpenAI client is constructed. Reading the key here (and
 * nowhere else) keeps the secret server-side and makes the provider a single
 * swap point — see `lib/llm/index.ts` for the provider-agnostic surface.
 */
let client: OpenAI | null = null;

export function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Copy .env.example to .env.local.");
  }
  // Reuse a single instance across requests in the same server process.
  // OPENAI_BASE_URL (optional) points the OpenAI SDK at any OpenAI-compatible
  // endpoint — e.g. GLM/z.ai while we wait for the OpenAI key. Provider swap is
  // env-only: no code here changes.
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
  return client;
}

/** Default model, overridable via env so the choice is not hard-coded in prompts. */
export const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
