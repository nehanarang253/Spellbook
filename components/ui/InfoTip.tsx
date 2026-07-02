import type { ReactNode } from "react";

interface InfoTipProps {
  /** Screen-reader label and accessible name for the trigger. */
  label: string;
  /** Plain-language explanation shown on hover or keyboard focus. */
  children: ReactNode;
  /** Keep the bubble from overflowing near a right edge. */
  align?: "center" | "left" | "right";
}

const ALIGN: Record<NonNullable<InfoTipProps["align"]>, string> = {
  center: "left-1/2 -translate-x-1/2",
  left: "left-0",
  right: "right-0",
};

/**
 * A small "i" trigger that reveals a plain-language note on hover *and* keyboard
 * focus, so non-technical users can learn an unfamiliar term (playbook, redline,
 * citation…) in place without leaving the workflow. CSS-only — no JS state — and
 * announced to assistive tech via the button label + role="tooltip".
 */
export function InfoTip({ label, children, align = "center" }: InfoTipProps) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none text-slate-500 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        i
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-30 mt-2 w-64 rounded-md bg-slate-900 px-3 py-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${ALIGN[align]}`}
      >
        {children}
      </span>
    </span>
  );
}
