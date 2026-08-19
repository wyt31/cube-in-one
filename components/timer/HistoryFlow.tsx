"use client";

import { formatTime, type Solve } from "@/lib/timer-types";

// ============================================================================
// History Flow — vertical stream of the most recent solves.
// Renders up to `maxItems` rows (newest on top), single-line, compact
// (text-xs/sm). Each row shows the time plus a +2 / DNF badge.
//
// Clicking a row opens the SolveDetailModal for that solve (handled by the
// parent via onSelect).
// ============================================================================

export interface HistoryFlowProps {
  solves: Solve[]; // newest-first order
  maxItems?: number;
  onSelect: (s: Solve) => void;
}

export default function HistoryFlow({
  solves,
  maxItems = 4,
  onSelect,
}: HistoryFlowProps) {
  const slice = solves.slice(0, maxItems);

  return (
    <div className="w-44">
      <ul className="flex flex-col gap-1 overflow-hidden pr-1">
        {slice.length === 0 ? (
          <li className="py-2 text-right text-[0.55rem] uppercase tracking-[0.2em] text-[#BBB]">
            No solves yet
          </li>
        ) : (
          slice.map((s, idx) => {
            const timeStr =
              s.penalty === -1
                ? "DNF"
                : formatTime(s.penalty === 2 ? s.time + 2000 : s.time);
            return (
              <li key={s.id ?? idx}>
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  className="flex w-full items-center justify-end gap-2 whitespace-nowrap rounded-md px-2 py-1 text-right transition-colors hover:bg-[#2C2C2C]/[0.04]"
                >
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs tabular-nums tracking-wide text-[#2C2C2C]">
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
                  <span className="text-[0.5rem] uppercase tracking-[0.1em] text-[#C0C0BB]">
                    #{solves.length - idx}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
