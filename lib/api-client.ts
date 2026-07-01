import type { AskResult, DraftResult, Issue } from "@/lib/types";

/**
 * Thin browser-side client for the workflow API routes. Centralizes the POST +
 * error-envelope handling so components only deal with typed results and a
 * single thrown Error on failure.
 */

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "Request failed. Please try again.";
    throw new Error(message);
  }

  return data as T;
}

export function requestReview(contract: string, playbook: string): Promise<{ issues: Issue[] }> {
  return postJSON("/api/review", { contract, playbook });
}

export function requestDraft(
  instruction: string,
  precedent?: string,
  contract?: string,
): Promise<DraftResult> {
  return postJSON("/api/draft", { instruction, precedent, contract });
}

export function requestAsk(contract: string, question: string): Promise<AskResult> {
  return postJSON("/api/ask", { contract, question });
}
