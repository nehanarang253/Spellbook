interface SuggestionChipsProps {
  /** Short heading, e.g. "Try one of these". */
  label: string;
  suggestions: string[];
  onPick: (suggestion: string) => void;
}

/**
 * Clickable example prompts. Non-technical users often don't know what to type
 * into an open-ended box; one tap fills a realistic instruction or question so
 * they can see the tool work before writing their own.
 */
export function SuggestionChips({ label, suggestions, onPick }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-left text-xs text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
