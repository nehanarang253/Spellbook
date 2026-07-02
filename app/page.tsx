"use client";

import { useRef, useState } from "react";
import { DocumentPane, type HighlightTarget } from "@/components/workspace/DocumentPane";
import { TABS, TabNav, type Tab } from "@/components/workspace/TabNav";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { DraftPanel } from "@/components/draft/DraftPanel";
import { AskPanel } from "@/components/ask/AskPanel";
import { CONTRACT_SAMPLES, loadSampleText } from "@/data/samples";
import { SAMPLE_PLAYBOOK } from "@/data/sample-playbook";

/**
 * Workspace shell. Holds the two pieces of session state shared across the three
 * workflows — the loaded contract and the active playbook — and renders the
 * document pane beside the active workflow. There is no persistence: reloading
 * the page clears everything, which matches the "no database" scope decision.
 */
export default function Workspace() {
  const [activeTab, setActiveTab] = useState<Tab>("review");
  const [contract, setContract] = useState("");
  const [playbook, setPlaybook] = useState(SAMPLE_PLAYBOOK.standards);
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<HighlightTarget | null>(null);
  const citeNonce = useRef(0);

  const active = TABS.find((t) => t.id === activeTab)!;

  function citeInDocument(quote: string, offset?: number | null) {
    citeNonce.current += 1;
    setHighlight({ quote, offset, nonce: citeNonce.current });
  }

  // Manual edits invalidate any citation offset, so clear the highlight when the
  // user types — which also keeps the highlight lookup from re-running per keystroke.
  function editContract(value: string) {
    setContract(value);
    setHighlight(null);
  }

  async function selectSample(id: string) {
    const sample = CONTRACT_SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setHighlight(null);
    setSampleError(null);
    setLoadingSample(true);
    try {
      setContract(await loadSampleText(sample));
    } catch (err) {
      setSampleError(err instanceof Error ? err.message : "Could not load that sample.");
    } finally {
      setLoadingSample(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Spellbook</h1>
          <p className="text-sm text-slate-500">
            An AI assistant for reviewing, writing, and answering questions about contracts.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-600">
          <span className="font-medium text-slate-800">New here?</span> Start by loading a
          sample contract on the left. Then choose a tool on the right:{" "}
          <span className="font-medium text-slate-700">Review</span> checks the contract against
          your standards, <span className="font-medium text-slate-700">Draft</span> writes a new
          clause for you, and <span className="font-medium text-slate-700">Ask</span> answers
          questions about it. Nothing you paste is saved &mdash; it stays in this browser tab only.
        </div>
      </header>

      <div className="grid flex-1 items-start gap-6 lg:grid-cols-2">
        <DocumentPane
          contract={contract}
          samples={CONTRACT_SAMPLES}
          loadingSample={loadingSample}
          loadError={sampleError}
          highlight={highlight}
          onChange={editContract}
          onSelectSample={selectSample}
          onClear={() => {
            setContract("");
            setHighlight(null);
            setSampleError(null);
          }}
        />

        <section className="flex flex-col gap-4">
          <TabNav active={activeTab} onChange={setActiveTab} />
          <p className="text-xs text-slate-400">{active.blurb}</p>

          <div role="tabpanel">
            {activeTab === "review" && (
              <ReviewPanel
                contract={contract}
                playbook={playbook}
                onPlaybookChange={setPlaybook}
              />
            )}
            {activeTab === "draft" && (
              <DraftPanel
                contract={contract}
                onInsert={(clause) =>
                  setContract((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${clause}\n` : clause))
                }
              />
            )}
            {activeTab === "ask" && <AskPanel contract={contract} onCite={citeInDocument} />}
          </div>
        </section>
      </div>
    </main>
  );
}
