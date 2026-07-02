"use client";

import { useState } from "react";
import { requestReview } from "@/lib/api-client";
import type { ReviewResult } from "@/lib/types";
import { IssueCard, type IssueStatus } from "./IssueCard";
import { RequiredClausesChecklist } from "./RequiredClausesChecklist";

interface ReviewPanelProps {
  contract: string;
  playbook: string;
  onPlaybookChange: (value: string) => void;
}

export function ReviewPanel({ contract, playbook, onPlaybookChange }: ReviewPanelProps) {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [statuses, setStatuses] = useState<Record<string, IssueStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlaybook, setShowPlaybook] = useState(false);

  const canRun = contract.trim().length > 0 && playbook.trim().length > 0 && !loading;

  async function runReview() {
    setLoading(true);
    setError(null);
    try {
      const review = await requestReview(contract, playbook);
      setResult(review);
      setStatuses({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setLoading(false);
    }
  }

  function setStatus(id: string, status: IssueStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowPlaybook((v) => !v)}
          className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
        >
          {showPlaybook ? "Hide playbook" : "Edit playbook"}
        </button>
        <button
          onClick={runReview}
          disabled={!canRun}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Reviewing…" : "Run review"}
        </button>
      </div>

      {showPlaybook && (
        <textarea
          value={playbook}
          onChange={(e) => onPlaybookChange(e.target.value)}
          aria-label="Playbook standards"
          className="min-h-[10rem] resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs shadow-sm focus:border-slate-400 focus:outline-none"
        />
      )}

      {!contract.trim() && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
          Paste or load a contract to review it against the playbook.
        </p>
      )}

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Analyzing the contract against your playbook…</p>}

      {result !== null && !loading && (
        <div className="flex flex-col gap-4">
          {result.summary && (
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Executive summary
              </h3>
              <p className="mt-1 text-sm text-slate-700">{result.summary}</p>
            </section>
          )}

          <RequiredClausesChecklist checks={result.requiredClauses} />

          {result.issues.length === 0 ? (
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
              No issues flagged against the playbook.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                {result.issues.length} issue{result.issues.length === 1 ? "" : "s"} flagged, highest
                severity first
              </p>
              {result.issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  status={statuses[issue.id] ?? "open"}
                  onAccept={() => setStatus(issue.id, "accepted")}
                  onDismiss={() => setStatus(issue.id, "dismissed")}
                  onReopen={() => setStatus(issue.id, "open")}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
