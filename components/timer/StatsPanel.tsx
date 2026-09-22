"use client";

import { formatTime, type Solve } from "@/lib/timer-types";
import { computeRollingStats, computeSessionStats, findBestSingleIndex } from "@/lib/aox";

// ============================================================================
// Bottom-Left Stats matrix — frameless, transparent, tabular-nums.
//
//   Grid layout (3 columns × 6 rows):
//     │ label │  BEST   │ CURRENT │
//     │ Single│  12.34  │  13.45  │
//     │ Ao5   │  ...    │  ...    │
//     │ Ao12  │  ...    │  ...    │
//     │ Ao50  │  ...    │  ...    │
//     │ Ao100 │  ...    │  ...    │
//
// Values that are not "—" are clickable:
//   - Single → opens History Modal at that solve's detail page
//   - AoX    → opens Average Detail Modal
// ============================================================================

export interface StatsPanelProps {
  solves: Solve[]; // chronological (oldest first)
  onSingleClick?: (solveId: number) => void;
  onAverageClick?: (type: "ao5" | "ao12" | "ao50" | "ao100", kind: "best" | "current") => void;
}

function f(v: number | null): string {
  return v === null ? "—" : formatTime(v);
}

export default function StatsPanel({ solves, onSingleClick, onAverageClick }: StatsPanelProps) {
  const session = computeSessionStats(solves);
  const rolling = computeRollingStats(solves);

  const bestSingleIdx = findBestSingleIndex(solves);
  const lastSolve = solves.length > 0 ? solves[solves.length - 1] : null;

  type AvgType = "ao5" | "ao12" | "ao50" | "ao100";

  const rows: {
    label: string;
    best: number | null;
    current: number | null;
    avgType?: AvgType;
    onBestClick?: () => void;
    onCurrentClick?: () => void;
  }[] = [
    {
      label: "Single",
      best: session.bestSingle,
      current: lastSolve
        ? lastSolve.penalty === -1
          ? -1  // DNF marker - formatTime renders "DNF"
          : lastSolve.penalty === 2
            ? lastSolve.time + 2000
            : lastSolve.time
        : null,
      onBestClick: bestSingleIdx >= 0 && onSingleClick
        ? () => onSingleClick(solves[bestSingleIdx].id!)
        : undefined,
      onCurrentClick: lastSolve && onSingleClick
        ? () => onSingleClick(lastSolve.id!)
        : undefined,
    },
    {
      label: "Ao5", best: session.bestAo5, current: rolling.currentAo5 === null && solves.length >= 5 ? -1 : rolling.currentAo5,
      avgType: "ao5" as const,
    },
    {
      label: "Ao12", best: session.bestAo12, current: rolling.currentAo12 === null && solves.length >= 12 ? -1 : rolling.currentAo12,
      avgType: "ao12" as const,
    },
    {
      label: "Ao50", best: session.bestAo50, current: rolling.currentAo50 === null && solves.length >= 50 ? -1 : rolling.currentAo50,
      avgType: "ao50" as const,
    },
    {
      label: "Ao100", best: session.bestAo100, current: rolling.currentAo100 === null && solves.length >= 100 ? -1 : rolling.currentAo100,
      avgType: "ao100" as const,
    },
  ];

  // Inject average callbacks
  for (const row of rows) {
    if (row.avgType) {
      const t = row.avgType;
      if (row.best !== null && onAverageClick) {
        row.onBestClick = () => onAverageClick(t, "best");
      }
      if (row.current !== null && onAverageClick) {
        row.onCurrentClick = () => onAverageClick(t, "current");
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 font-[family-name:var(--font-geist-mono)] tabular-nums">
      {/* Column header — Best sits directly above left numbers, Current above right.
          Fixed-width value columns so every row shares identical geometry and
          the right-aligned digits stack perfectly. */}
      <div className="grid grid-cols-[auto_5.5rem_5.5rem] items-baseline gap-x-6 gap-y-1.5 text-[0.65rem] uppercase tracking-[0.18em]">
        <span className="opacity-0">·</span>
        <span className="text-right opacity-40">Best</span>
        <span className="text-right opacity-40">Current</span>
      </div>

      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[auto_5.5rem_5.5rem] items-baseline gap-x-6 gap-y-1.5 text-[0.8rem] tracking-wide text-neutral-800"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.15em] text-neutral-400">
            {row.label}
          </span>
          {/* Best value — right-aligned so all digits stack vertically.
              w-full forces the button/span to fill the fixed grid cell so
              text-right actually anchors digits to the cell's right edge. */}
          {row.onBestClick ? (
            <button
              type="button"
              onClick={row.onBestClick}
              className="w-full cursor-pointer text-right font-[family-name:var(--font-geist-mono)] text-[0.95rem] tabular-nums text-neutral-800 opacity-70 transition-all hover:opacity-100 hover:text-neutral-800 hover:underline hover:underline-offset-4 hover:decoration-neutral-800/30"
            >
              {f(row.best)}
            </button>
          ) : (
            <span className="w-full text-right font-[family-name:var(--font-geist-mono)] text-[0.95rem] tabular-nums text-neutral-800 opacity-60">{f(row.best)}</span>
          )}
          {/* Current value — right-aligned */}
          {row.onCurrentClick ? (
            <button
              type="button"
              onClick={row.onCurrentClick}
              className="w-full cursor-pointer text-right font-[family-name:var(--font-geist-mono)] text-[0.95rem] tabular-nums text-neutral-800 opacity-70 transition-all hover:opacity-100 hover:text-neutral-800 hover:underline hover:underline-offset-4 hover:decoration-neutral-800/30"
            >
              {f(row.current)}
            </button>
          ) : (
            <span className="w-full text-right font-[family-name:var(--font-geist-mono)] text-[0.95rem] tabular-nums text-neutral-800 opacity-60">{f(row.current)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
