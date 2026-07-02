export type Tab = "review" | "draft" | "ask";

export const TABS: { id: Tab; label: string; blurb: string }[] = [
  {
    id: "review",
    label: "Review",
    blurb:
      "Scan the contract for risky or one-sided terms, drafting mistakes, and missing clauses — each with a suggested fix you can accept or dismiss.",
  },
  {
    id: "draft",
    label: "Draft",
    blurb: "Describe the clause you need in plain English and get drafted wording to insert.",
  },
  {
    id: "ask",
    label: "Ask",
    blurb:
      "Ask any question about the contract and get an answer backed by the exact wording it came from.",
  },
];

interface TabNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Workflows">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-md px-3 py-2.5 text-sm font-medium transition ${
            active === tab.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
