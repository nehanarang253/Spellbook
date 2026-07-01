"use client";

import { useState } from "react";
import { requestDraft } from "@/lib/api-client";

interface DraftPanelProps {
  contract: string;
  onInsert: (clause: string) => void;
}

export function DraftPanel({ contract, onInsert }: DraftPanelProps) {
  const [instruction, setInstruction] = useState("");
  const [precedent, setPrecedent] = useState("");
  const [clause, setClause] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inserted, setInserted] = useState(false);

  const canRun = instruction.trim().length > 0 && !loading;

  async function runDraft() {
    setLoading(true);
    setError(null);
    setInserted(false);
    try {
      const result = await requestDraft(instruction, precedent || undefined, contract || undefined);
      setClause(result.clause);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed.");
    } finally {
      setLoading(false);
    }
  }

  function insert() {
    if (!clause) return;
    onInsert(clause);
    setInserted(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Instruction</span>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Draft a mutual limitation-of-liability clause capped at fees paid."
          className="min-h-[5rem] resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Precedent language <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          value={precedent}
          onChange={(e) => setPrecedent(e.target.value)}
          placeholder="Paste preferred firm language to match its style…"
          className="min-h-[4rem] resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
        />
      </label>

      <button
        onClick={runDraft}
        disabled={!canRun}
        className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Drafting…" : "Draft clause"}
      </button>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {clause && !loading && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Drafted clause</p>
          <p className="whitespace-pre-wrap text-sm text-slate-800">{clause}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={insert}
              className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Insert into contract
            </button>
            {inserted && <span className="text-xs font-medium text-emerald-600">Appended to the document</span>}
          </div>
        </div>
      )}
    </div>
  );
}
