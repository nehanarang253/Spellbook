"use client";

import { useState } from "react";
import { DocumentPane } from "@/components/workspace/DocumentPane";
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

  const active = TABS.find((t) => t.id === activeTab)!;

  async function selectSample(id: string) {
    const sample = CONTRACT_SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setLoadingSample(true);
    try {
      setContract(await loadSampleText(sample));
    } catch {
      // Surface nothing destructive — a failed fetch just leaves the current text.
      setContract((prev) => prev);
    } finally {
      setLoadingSample(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Spellbook</h1>
        <p className="text-sm text-slate-500">
          AI contract review, drafting, and grounded Q&amp;A for transactional lawyers.
        </p>
      </header>

      <div className="grid flex-1 items-start gap-6 lg:grid-cols-2">
        <DocumentPane
          contract={contract}
          samples={CONTRACT_SAMPLES}
          loadingSample={loadingSample}
          onChange={setContract}
          onSelectSample={selectSample}
          onClear={() => setContract("")}
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
            {activeTab === "ask" && <AskPanel contract={contract} />}
          </div>
        </section>
      </div>
    </main>
  );
}
