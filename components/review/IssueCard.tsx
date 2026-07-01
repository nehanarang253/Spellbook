import type { Issue } from "@/lib/types";
import { CategoryBadge, SeverityBadge } from "./SeverityBadge";

export type IssueStatus = "open" | "accepted" | "dismissed";

interface IssueCardProps {
  issue: Issue;
  status: IssueStatus;
  onAccept: () => void;
  onDismiss: () => void;
  onReopen: () => void;
}

export function IssueCard({ issue, status, onAccept, onDismiss, onReopen }: IssueCardProps) {
  const resolved = status !== "open";

  return (
    <article
      className={`rounded-lg border p-4 shadow-sm transition ${
        resolved ? "border-slate-200 bg-slate-50 opacity-70" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={issue.severity} />
        <CategoryBadge category={issue.category} />
        {status === "accepted" && (
          <span className="ml-auto text-xs font-medium text-emerald-600">Accepted</span>
        )}
        {status === "dismissed" && (
          <span className="ml-auto text-xs font-medium text-slate-400">Dismissed</span>
        )}
      </div>

      <h3 className="mt-2 text-sm font-semibold text-slate-900">{issue.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{issue.explanation}</p>

      {issue.sourceText && (
        <blockquote className="mt-3 border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
          {issue.sourceText}
        </blockquote>
      )}

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Suggested redline
        </p>
        <p className="mt-1 whitespace-pre-wrap rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {issue.suggestedRedline}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {resolved ? (
          <button
            onClick={onReopen}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Reopen
          </button>
        ) : (
          <>
            <button
              onClick={onAccept}
              className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Accept redline
            </button>
            <button
              onClick={onDismiss}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </article>
  );
}
