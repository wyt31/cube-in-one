"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { formatTime, finalTime, type Solve } from "@/lib/timer-types";
import { getBestAoXWindow, getCurrentAoXWindow, type AoXWindow } from "@/lib/aox";
import { formatSolveExport } from "@/lib/export-format";

// ============================================================================
// AverageDetailModal — shows the N solves that make up a rolling average,
// with trimmed (best/worst) entries wrapped in parentheses, plus a Copy
// button that exports csTimer-compatible text.
//
// Opens as a centered overlay (same portal + glass style as HistoryModal).
// ============================================================================

export interface AverageDetailModalProps {
  open: boolean;
  solves: Solve[];          // all session solves (chronological)
  type: "ao5" | "ao12" | "ao50" | "ao100";
  kind: "best" | "current"; // best-ever window or last-N window
  onClose: () => void;
}

const X_MAP: Record<AverageDetailModalProps["type"], number> = {
  ao5: 5,
  ao12: 12,
  ao50: 50,
  ao100: 100,
};

const LABEL_MAP: Record<AverageDetailModalProps["type"], string> = {
  ao5: "Ao5",
  ao12: "Ao12",
  ao50: "Ao50",
  ao100: "Ao100",
};

export default function AverageDetailModal({ open, solves, type, kind, onClose }: AverageDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const x = X_MAP[type];

  const aoWindow: AoXWindow | null = useMemo(
    () => (kind === "current" ? getCurrentAoXWindow(solves, x) : getBestAoXWindow(solves, x)),
    [solves, x, kind],
  );

  // Reset copy state on open
  useEffect(() => {
    if (open) setCopied(false);
  }, [open, type, kind]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Build export text using the shared formatting utility.
  // AoX windows are always consecutive + standard size → uses Ao5/Ao12/... label.
  const clipboardText = useMemo(() => {
    if (!aoWindow || aoWindow.solves.length === 0) return "";
    const n = aoWindow.solves.length;
    // Consecutive indices: [0, 1, 2, ..., n-1]
    const indices = Array.from({ length: n }, (_, i) => i);
    return formatSolveExport(aoWindow.solves, n, indices);
  }, [aoWindow]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // fallback
    }
  };

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: open ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.18)",
    backdropFilter: "blur(2px)",
  };

  if (!open || !aoWindow) return null;

  const title = `${LABEL_MAP[type]} ${kind === "best" ? "Best Ever" : "Current"}`;

  return (
    <div
      style={overlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative flex h-[min(80vh,720px)] w-[min(680px,92vw)] min-h-[400px] min-h-0 flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        style={{ animation: "tabEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* ---------- Header ---------- */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.05] px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-neutral-800">
              {title}
            </h2>
            <span className="rounded-full bg-black/[0.03] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.65rem] text-neutral-400">
              {aoWindow.average === null ? "DNF" : formatTime(aoWindow.average)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-8 items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:border-neutral-800/50 hover:text-neutral-800"
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-neutral-400 transition-all hover:border-black/10 hover:text-neutral-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ---------- Solve list ---------- */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4 sm:px-8">
            <ol className="space-y-1.5">
              {aoWindow.solves.map((s, i) => {
                const ft = finalTime(s);
                const timeStr = ft === null ? "DNF" : formatTime(ft);
                const isTrimmed = aoWindow.trimmedIndices.includes(i);
                return (
                  <li
                    key={s.id ?? i}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.03] px-3 py-2.5 transition-colors hover:bg-black/[0.015]"
                  >
                    <span className="w-6 text-right text-[0.6rem] font-medium text-neutral-400">
                      {i + 1}
                    </span>
                    <span
                      className={`font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.85rem] ${
                        isTrimmed ? "text-neutral-400" : "text-neutral-800"
                      }`}
                      style={{ minWidth: "4rem" }}
                    >
                      {isTrimmed ? `(${timeStr})` : timeStr}
                    </span>
                    <span className="flex-1 truncate font-[family-name:var(--font-geist-mono)] text-[0.62rem] text-neutral-300">
                      {s.scramble || ""}
                    </span>
                  </li>
                );
              })}
            </ol>
        </div>

        {/* ---------- Footer hint ---------- */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-black/[0.04] px-6 py-3 sm:px-8">
          <div className="flex items-center gap-4 text-[0.58rem] uppercase tracking-[0.18em] text-neutral-400">
            <span>
              <span className="text-neutral-400">( )</span> = trimmed
            </span>
            <span>{aoWindow.solves.length} solves</span>
          </div>
          <span className="font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.7rem] text-neutral-800">
            {aoWindow.average === null ? "DNF" : formatTime(aoWindow.average)}
          </span>
        </div>
      </div>
    </div>
  );
}
