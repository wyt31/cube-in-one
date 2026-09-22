"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTime, type Solve } from "@/lib/timer-types";

// ============================================================================
// History Flow — vertical stream of the most recent solves.
//
// Shows up to `maxItems` rows (default 10) with a compact vertical scroll.
// Clicking the time badge of a row opens the SolveDetailModal.
//
// Batch selection mode:
//   - Tapping the toggle (top-right of the header) enters selection mode.
//   - Each row gets a checkbox — click to toggle selection.
//   - Header shows the count and offers a "Delete selected (N)" button
//     with a built-in confirm step.
// ============================================================================

export interface HistoryFlowProps {
  solves: Solve[]; // newest-first order
  maxItems?: number;
  /** Called to open the detail modal for a solve. */
  onSelect: (s: Solve) => void;
  /** Called with selected solve IDs when the user confirms batch delete. */
  onBatchDelete?: (ids: number[]) => void;
}

const CHECKBOX = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

export default function HistoryFlow({
  solves,
  maxItems = 10,
  onSelect,
  onBatchDelete,
}: HistoryFlowProps) {
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // Confirm step for the batch delete button.
  const [confirming, setConfirming] = useState<boolean>(false);

  // Reset selection when the parent data rebuilds (after delete).
  const totalCount = solves.length;
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<number>();
      for (const s of solves) {
        if (s.id !== undefined && prev.has(s.id)) next.add(s.id);
      }
      return next;
    });
  }, [solves, totalCount]);

  const slice = solves.slice(0, maxItems);

  const anySelected = useMemo(
    () => Array.from(selected).some((id) => solves.some((s) => s.id === id)),
    [selected, solves],
  );

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirming(false);
  };

  const handleDeleteClick = () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-dismiss confirm state after 3s if user backs out.
      window.setTimeout(() => setConfirming(false), 3000);
      return;
    }
    // Confirmed — actually delete.
    const ids = Array.from(selected).filter((n) => Number.isFinite(n));
    if (ids.length > 0 && onBatchDelete) onBatchDelete(ids);
    setSelected(new Set());
    setConfirming(false);
    setSelectMode(false);
  };

  return (
    <div className="flex h-full w-48 flex-col gap-1.5">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between px-1">
        <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#9A9A95]">
          History · last {Math.min(maxItems, solves.length)}
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
            setConfirming(false);
          }}
          className={`text-[0.5rem] uppercase tracking-[0.2em] transition-colors ${
            selectMode ? "text-neutral-800" : "text-neutral-300 hover:text-neutral-500"
          }`}
        >
          {selectMode ? "Done" : "Select"}
        </button>
      </div>

      {selectMode && onBatchDelete && (
        <button
          type="button"
          disabled={!anySelected}
          onClick={handleDeleteClick}
          className={`flex flex-shrink-0 w-full items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[0.55rem] font-medium uppercase tracking-[0.18em] transition-all ${
            confirming
              ? "border-[#C44] bg-[#C44] text-white"
              : anySelected
              ? "border-[#E8E8E4] bg-white text-[#C44] hover:border-[#C44]"
              : "border-[#F0F0EE] bg-[#FBFBFA] text-neutral-300"
          }`}
        >
          {confirming
            ? `Confirm delete ${selected.size}? (click again)`
            : `Delete selected (${selected.size})`}
        </button>
      )}

      {/* Rows */}
      <ul
        className="flex flex-1 min-h-0 flex-col gap-1.5 overflow-y-auto pr-1
          [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        {slice.length === 0 ? (
          <li className="py-2 text-right text-[0.55rem] uppercase tracking-[0.2em] text-neutral-300">
            No solves yet
          </li>
        ) : (
          slice.map((s, idx) => {
            if (s.id === undefined) return null;
            const timeStr =
              s.penalty === -1
                ? "DNF"
                : formatTime(s.penalty === 2 ? s.time + 2000 : s.time);
            const isSelected = selected.has(s.id);
            return (
              <li key={s.id}>
                <div
                  className={`flex w-full items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1 transition-colors ${
                    isSelected ? "bg-neutral-800/[0.07]" : "hover:bg-neutral-800/[0.03]"
                  }`}
                >
                  {selectMode ? (
                    <button
                      type="button"
                      onClick={() => toggle(s.id!)}
                      aria-label={
                        isSelected ? "Deselect solve" : "Select solve"
                      }
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all ${
                        isSelected
                          ? "border-neutral-800 bg-neutral-800 text-white"
                          : "border-[#D0D0CB] bg-white text-transparent hover:border-neutral-800/60"
                      }`}
                    >
                      {CHECKBOX}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onSelect(s)}
                    className="flex flex-1 items-center justify-end gap-2 py-0.5 text-right"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs tabular-nums tracking-wide text-neutral-800">
                      {timeStr}
                    </span>
                    {s.penalty === 2 && (
                      <span className="text-[0.5rem] font-semibold uppercase tracking-wider text-[#C44]">
                        +2
                      </span>
                    )}
                    {s.penalty === -1 && (
                      <span className="text-[0.5rem] font-semibold uppercase tracking-wider text-[#C44]">
                        DNF
                      </span>
                    )}
                    <span className="w-7 text-right text-[0.5rem] uppercase tracking-[0.1em] text-[#C0C0BB]">
                      #{solves.length - idx}
                    </span>
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
