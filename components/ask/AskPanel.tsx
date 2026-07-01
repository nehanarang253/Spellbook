"use client";

import { useState } from "react";
import { requestAsk } from "@/lib/api-client";
import type { AskResult } from "@/lib/types";

interface AskPanelProps {
  contract: string;
  /** Ask the document pane to reveal a cited span. */
  onCite?: (quote: string, offset?: number | null) => void;
}

export function AskPanel({ contract, onCite }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRun = contract.trim().length > 0 && question.trim().length > 0 && !loading;

  async function runAsk() {
    setLoading(true);
    setError(null);
    try {
      setResult(await requestAsk(contract, question));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!contract.trim() && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
          Paste or load a contract to ask questions about it.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canRun) runAsk();
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How long do the confidentiality obligations last?"
          className="flex-1 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canRun}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {result && !loading && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="whitespace-pre-wrap text-sm text-slate-800">{result.answer}</p>

          {result.citations.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Citations
              </p>
              {result.citations.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onCite?.(c.quote, c.offset)}
                  title="Show in document"
                  className="border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-left text-xs italic text-slate-600 transition hover:border-yellow-400 hover:bg-yellow-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  {c.quote}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
