"use client";

import { formatTime, type Solve } from "@/lib/timer-types";
import { computeRollingStats, computeSessionStats } from "@/lib/aox";

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
// `BEST`    = session-best ever for that stat.
// `CURRENT` = rolling (last-X) value.
// ============================================================================

export interface StatsPanelProps {
  solves: Solve[]; // chronological (oldest first)
}

function f(v: number | null): string {
  return v === null ? "—" : formatTime(v);
}

export default function StatsPanel({ solves }: StatsPanelProps) {
  const session = computeSessionStats(solves);
  const rolling = computeRollingStats(solves);

  const rows: { label: string; best: number | null; current: number | null }[] = [
    { label: "Single", best: session.bestSingle, current: solves.length > 0 ? solves[solves.length - 1].penalty === -1 ? null : (solves[solves.length - 1].penalty === 2 ? solves[solves.length - 1].time + 2000 : solves[solves.length - 1].time) : null, },
    { label: "Ao5", best: session.bestAo5, current: rolling.currentAo5 },
    { label: "Ao12", best: session.bestAo12, current: rolling.currentAo12 },
    { label: "Ao50", best: session.bestAo50, current: rolling.currentAo50 },
    { label: "Ao100", best: session.bestAo100, current: rolling.currentAo100 },
  ];

  return (
    <div className="flex flex-col gap-1.5 font-[family-name:var(--font-geist-mono)] tabular-nums">
      {/* Column header */}
      <div className="grid grid-cols-[auto_1fr_1fr] items-baseline gap-x-6 gap-y-1 text-[0.6rem] uppercase tracking-[0.18em]">
        <span className="opacity-0">·</span>
        <span className="opacity-40">Best</span>
        <span className="opacity-40">Current</span>
      </div>

      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[auto_1fr_1fr] items-baseline gap-x-6 gap-y-1 text-xs tracking-wide text-[#2C2C2C]"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-[#888]">
            {row.label}
          </span>
          <span className="text-sm text-[#2C2C2C]">{f(row.best)}</span>
          <span className="text-sm text-[#2C2C2C]">{f(row.current)}</span>
        </div>
      ))}
    </div>
  );
}
