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

/**
 * Resolve the model for a request. `OPENAI_MODEL` (or a per-call override) wins;
 * otherwise we default to OpenAI's `gpt-4o`. If a custom `OPENAI_BASE_URL` is set
 * (a non-OpenAI provider) without a model, we fail loudly rather than silently
 * sending an OpenAI model name the other endpoint won't recognize.
 */
export function resolveModel(override?: string): string {
  const model = override ?? process.env.OPENAI_MODEL;
  if (model) return model;
  if (process.env.OPENAI_BASE_URL) {
    throw new Error(
      "OPENAI_MODEL must be set when OPENAI_BASE_URL points at a non-OpenAI endpoint.",
    );
  }
  return "gpt-4o";
}
