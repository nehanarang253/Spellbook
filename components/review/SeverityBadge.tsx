import type { IssueCategory, IssueSeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const SEVERITY_HINTS: Record<IssueSeverity, string> = {
  high: "High — address this before signing",
  medium: "Medium — worth negotiating",
  low: "Low — minor point",
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  aggressive_term: "Aggressive term",
  drafting_error: "Drafting error",
  missing_clause: "Missing clause",
};

const CATEGORY_HINTS: Record<IssueCategory, string> = {
  aggressive_term: "A term that is one-sided against you",
  drafting_error: "Unclear, inconsistent, or mistaken wording",
  missing_clause: "A protection your playbook expects but the contract omits",
};

export function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span
      title={SEVERITY_HINTS[severity]}
      className={`cursor-help rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

export function CategoryBadge({ category }: { category: IssueCategory }) {
  return (
    <span
      title={CATEGORY_HINTS[category]}
      className="cursor-help rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
