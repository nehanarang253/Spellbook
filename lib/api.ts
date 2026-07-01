import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { LLMError } from "@/lib/llm";

/**
 * Shared helpers for the API routes so each `route.ts` stays a thin controller:
 * parse + validate the body, run the workflow, and translate failures into a
 * consistent `{ error }` envelope. Raw provider errors are never forwarded to
 * the client — only safe, typed messages.
 */

export type ApiError = { error: string };

/** Validate a JSON request body against a schema, throwing a 400-shaped error on failure. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new HttpError(400, firstIssue(result.error));
  }
  return result.data;
}

/** An error carrying the HTTP status the route should return. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Map any thrown error to a safe JSON response. Provider internals stay server-side. */
export function toErrorResponse(error: unknown): NextResponse<ApiError> {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: firstIssue(error) }, { status: 400 });
  }
  if (error instanceof LLMError) {
    // The model failed (timeout, bad JSON, rate limit). Log server-side, return a generic message.
    console.error("[llm]", error.message, error.cause);
    return NextResponse.json(
      { error: "The model could not complete this request. Please try again." },
      { status: 502 },
    );
  }
  console.error("[api]", error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}

function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid request.";
}
