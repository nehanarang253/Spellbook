import type { ContractSample } from "@/data/samples";

interface DocumentPaneProps {
  contract: string;
  samples: ContractSample[];
  loadingSample: boolean;
  onChange: (value: string) => void;
  onSelectSample: (id: string) => void;
  onClear: () => void;
}

export function DocumentPane({
  contract,
  samples,
  loadingSample,
  onChange,
  onSelectSample,
  onClear,
}: DocumentPaneProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="contract" className="text-sm font-medium">
          Contract
        </label>
        <div className="flex items-center gap-2">
          <select
            aria-label="Load a sample contract"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onSelectSample(e.target.value);
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="" disabled>
              Load a sample…
            </option>
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {contract.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-slate-400 underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        <textarea
          id="contract"
          value={contract}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste a contract here, or load a sample to get started…"
          className="min-h-[28rem] w-full flex-1 resize-none rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed shadow-sm focus:border-slate-400 focus:outline-none"
        />
        {loadingSample && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 text-sm text-slate-500">
            Loading contract…
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        The contract lives in session state only — nothing is persisted.
      </p>
    </section>
  );
}
