"use client";

import { formatTime, type Solve } from "@/lib/timer-types";

// ============================================================================
// History Flow — vertical stream of the most recent solves.
// Renders up to `maxItems` rows (newest on top) and applies a vertical
// gradient mask at the bottom so the list fades smoothly.
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
  maxItems = 5,
  onSelect,
}: HistoryFlowProps) {
  const slice = solves.slice(0, maxItems);

  return (
    <div className="relative w-56">
      {/* List container — bottom fade mask via ::after on a wrapper */}
      <ul
        className="flex max-h-48 flex-col gap-1.5 overflow-hidden pr-1"
        style={{
          maskImage:
            "linear-gradient(to bottom, #000 65%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 65%, transparent 100%)",
        }}
      >
        {slice.length === 0 ? (
          <li className="py-3 text-center text-[0.6rem] uppercase tracking-[0.2em] text-[#BBB]">
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
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#2C2C2C]/[0.04]"
                >
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs tabular-nums tracking-wide text-[#2C2C2C]">
                    {timeStr}
                    {s.penalty === 2 && (
                      <span className="ml-1 text-[0.55rem] uppercase tracking-wider text-[#A0A09A]">
                        +2
                      </span>
                    )}
                  </span>
                  <span className="truncate text-[0.55rem] uppercase tracking-[0.15em] text-[#BBB]">
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
