import type { IssueCategory, IssueSeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  aggressive_term: "Aggressive term",
  drafting_error: "Drafting error",
  missing_clause: "Missing clause",
};

export function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

export function CategoryBadge({ category }: { category: IssueCategory }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {CATEGORY_LABELS[category]}
    </span>
  );
}
