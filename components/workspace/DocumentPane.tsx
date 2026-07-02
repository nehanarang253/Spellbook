"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ContractSample } from "@/data/samples";
import { InfoTip } from "@/components/ui/InfoTip";

/** A citation the Ask panel asked the document pane to reveal. */
export interface HighlightTarget {
  quote: string;
  /** Exact offset from server-side verification, used as a fast/precise hint. */
  offset?: number | null;
  /** Bumped on every click so re-clicking the same citation re-scrolls. */
  nonce: number;
}

interface DocumentPaneProps {
  contract: string;
  samples: ContractSample[];
  loadingSample: boolean;
  /** Message shown when a sample fails to load; null when there's nothing to report. */
  loadError: string | null;
  highlight: HighlightTarget | null;
  onChange: (value: string) => void;
  onSelectSample: (id: string) => void;
  onClear: () => void;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find the citation span in the current document text. Prefers the verified
 * offset, falls back to an exact search, then to a whitespace-tolerant search so
 * a quote still lands even if the user reflowed or lightly edited the contract.
 */
function locate(text: string, quote: string, hint?: number | null): [number, number] | null {
  const q = quote.trim();
  if (!q) return null;

  if (typeof hint === "number" && hint >= 0 && text.substr(hint, q.length) === q) {
    return [hint, hint + q.length];
  }
  const exact = text.indexOf(q);
  if (exact !== -1) return [exact, exact + q.length];

  const tokens = q.split(/\s+/).map(escapeRegExp).filter(Boolean);
  if (!tokens.length) return null;
  try {
    const match = new RegExp(tokens.join("\\s+")).exec(text);
    if (match) return [match.index, match.index + match[0].length];
  } catch {
    // A pathological quote produced an invalid pattern — just skip highlighting.
  }
  return null;
}

export function DocumentPane({
  contract,
  samples,
  loadingSample,
  loadError,
  highlight,
  onChange,
  onSelectSample,
  onClear,
}: DocumentPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const lastNonce = useRef<number>(-1);

  const span = useMemo(
    () => (highlight ? locate(contract, highlight.quote, highlight.offset) : null),
    [contract, highlight],
  );

  // On a new citation click, select the span and scroll it into view.
  useEffect(() => {
    if (!highlight || highlight.nonce === lastNonce.current) return;
    lastNonce.current = highlight.nonce;
    const textarea = textareaRef.current;
    if (!textarea || !span) return;

    const [start, end] = span;
    textarea.focus();
    textarea.setSelectionRange(start, end);

    const mark = backdropRef.current?.querySelector("mark");
    if (mark instanceof HTMLElement) {
      textarea.scrollTop = Math.max(0, mark.offsetTop - textarea.clientHeight / 3);
      if (backdropRef.current) backdropRef.current.scrollTop = textarea.scrollTop;
    }
  }, [highlight, span]);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="contract" className="flex items-center gap-1.5 text-sm font-medium">
          Contract
          <InfoTip label="What goes here" align="left">
            Paste your own contract, or load a sample to try the tools. You can edit the text
            here at any time — the tools always work on what&apos;s currently shown.
          </InfoTip>
        </label>
        <div className="flex items-center gap-2">
          {/* An action menu, not a state field: value is pinned to "" so it always
              reads "Load a sample…" and re-picking the same sample fires onChange
              (letting a cleared sample be reloaded). */}
          <select
            aria-label="Load a sample contract"
            value=""
            onChange={(e) => {
              if (e.target.value) onSelectSample(e.target.value);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="" disabled>
              ↓ Load a sample…
            </option>
            {samples.map((s) => (
              <option key={s.id} value={s.id} title={s.description}>
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

      {loadError && (
        <p className="rounded-md bg-red-50 p-2 text-xs text-red-700" role="alert">
          {loadError}
        </p>
      )}

      <div className="relative min-h-[28rem] flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-slate-400">
        {/* Highlight layer: same typography as the textarea, transparent text, so
            only the <mark> background shows through behind the real text. */}
        <div
          ref={backdropRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-transparent"
        >
          {span ? (
            <>
              {contract.slice(0, span[0])}
              <mark className="rounded bg-yellow-200 text-transparent">
                {contract.slice(span[0], span[1])}
              </mark>
              {contract.slice(span[1])}
            </>
          ) : (
            contract
          )}
        </div>

        <textarea
          id="contract"
          ref={textareaRef}
          value={contract}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            if (backdropRef.current) {
              backdropRef.current.scrollTop = e.currentTarget.scrollTop;
              backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
            }
          }}
          placeholder="Paste a contract here, or use “Load a sample…” above to get started…"
          className="relative z-10 h-full min-h-[28rem] w-full resize-none whitespace-pre-wrap break-words bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none"
        />

        {loadingSample && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 text-sm text-slate-500">
            Loading contract…
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>Not saved anywhere — the contract stays in this browser tab and clears on reload.</span>
        {contract.trim().length > 0 && (
          <span className="shrink-0 tabular-nums">
            {contract.trim().split(/\s+/).length.toLocaleString()} words
          </span>
        )}
      </div>
    </section>
  );
}
