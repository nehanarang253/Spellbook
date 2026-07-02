import type { RequiredClauseCheck, RequiredClauseStatus } from "@/lib/types";
import { InfoTip } from "@/components/ui/InfoTip";

const STATUS_STYLES: Record<RequiredClauseStatus, { label: string; className: string; icon: string }> = {
  present: { label: "Present", className: "text-emerald-700 bg-emerald-50", icon: "✓" },
  partial: { label: "Partial", className: "text-amber-700 bg-amber-50", icon: "~" },
  missing: { label: "Missing", className: "text-red-700 bg-red-50", icon: "✕" },
};

export function RequiredClausesChecklist({ checks }: { checks: RequiredClauseCheck[] }) {
  if (checks.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        Required-clause checklist
        <InfoTip label="About this checklist" align="left">
          The clauses your playbook expects every contract to contain, and whether each one is
          present, only partly covered, or missing.
        </InfoTip>
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {checks.map((check, i) => {
          const style = STATUS_STYLES[check.status];
          return (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${style.className}`}
              >
                <span aria-hidden>{style.icon}</span>
                {style.label}
              </span>
              <div className="text-sm">
                <p className="font-medium text-slate-800">{check.requirement}</p>
                {check.note && <p className="text-xs text-slate-500">{check.note}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
