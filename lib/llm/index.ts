import type { ZodType } from "zod";
import { getClient, resolveModel } from "./client";

/**
 * Provider-agnostic LLM surface. Every workflow talks to the model through
 * these helpers, so swapping providers means re-implementing this file only.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  /** Cap on completion length. Raise it for exhaustive outputs like a full review. */
  maxTokens?: number;
}

/** A typed error the API layer can translate into a safe `{ error }` envelope. */
export class LLMError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "LLMError";
  }
}

/**
 * JSON completion validated against a zod schema. Requests JSON mode, parses,
 * and validates before returning — callers get a typed value or an LLMError.
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  schema: ZodType<T>,
  options: ChatOptions = {},
): Promise<T> {
  let raw: string;
  try {
    const response = await getClient().chat.completions.create({
      model: resolveModel(options.model),
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens,
      response_format: { type: "json_object" },
      messages,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new LLMError("Model returned an empty response.");
    raw = content;
  } catch (error) {
    if (error instanceof LLMError) throw error;
    throw new LLMError("JSON completion failed.", error);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new LLMError("Model returned malformed JSON.", error);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new LLMError("Model JSON did not match the expected schema.", result.error);
  }
  return result.data;
}
