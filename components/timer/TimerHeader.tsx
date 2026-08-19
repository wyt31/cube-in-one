"use client";

import type { TimerEvent, TimerMode } from "@/lib/timer-types";

// ============================================================================
// Top Header for the timer page.
//
// Layout (centered, no labels):
//                 ┌──────────┐ ┌──────────┐
//                 │ 3x3x3 ▾  │ │  WCA ▾   │   ← Puzzle + Mode capsules
//                 └──────────┘ └──────────┘
//                   ┌───────────────────┐
//                   │ Filter Cases 8/21 │           ← only when mode≠WCA
//                   └───────────────────┘
//
//   - Puzzle capsule: 13 WCA events (2x2 ... Square-1).
//   - Mode capsule:   WCA always; 2x2 adds CLL/EG1/EG2/TCLL(+/-)/LS;
//                     3x3 adds OLL/PLL/LL; others WCA-only.
//   - Filter Cases capsule: shown only in 专项 (mode ≠ WCA). Displays
//     (selected/total) for the current mode's algorithm case set.
//
//   The gear (Settings) stays right-aligned.
// ============================================================================

export interface TimerHeaderProps {
  event: TimerEvent;
  events: TimerEvent[];
  mode: TimerMode;
  modes: TimerMode[];
  inspectionEnabled: boolean;
  filterSelected: number;
  filterTotal: number;
  onEventChange: (e: TimerEvent) => void;
  onModeChange: (m: TimerMode) => void;
  onOpenSettings: () => void;
}

/**
 * Liquid-glass styled capsule wrapping a native <select>.
 * `appearance-none` removes the default OS chrome; the ▾ is rendered
 * separately so the capsule keeps a consistent look across platforms.
 */
function SelectCapsule({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[#E8E8E4] bg-white/80 px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-colors hover:border-[#2C2C2C]/40">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[#2C2C2C] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="text-[0.6rem] leading-none text-[#9A9A95]">
        ▾
      </span>
    </div>
  );
}

export default function TimerHeader({
  event,
  events,
  mode,
  modes,
  inspectionEnabled,
  filterSelected,
  filterTotal,
  onEventChange,
  onModeChange,
  onOpenSettings,
}: TimerHeaderProps) {
  const puzzleOptions = events.map((e) => ({ value: e, label: e }));
  const modeOptions = modes.map((m) => ({ value: m, label: m }));

  // 3rd capsule only renders in 专项 mode (mode !== "WCA").
  const showFilter = mode !== "WCA" && filterTotal > 0;

  return (
    <header className="relative flex w-full flex-col items-center gap-2 py-3">
      {/* Row 1 — Puzzle + Mode, centered */}
      <div className="flex items-center gap-2">
        <SelectCapsule
          ariaLabel="Puzzle"
          value={event}
          onChange={(v) => onEventChange(v as TimerEvent)}
          options={puzzleOptions}
        />
        <SelectCapsule
          ariaLabel="Mode"
          value={mode}
          onChange={(v) => onModeChange(v as TimerMode)}
          options={modeOptions}
        />
      </div>

      {/* Row 2 — Filter Cases, centered, only in 专项 mode.
          Display-only status pill: shows (selected/total) for the current
          mode's case set. A full case-filter modal is a future enhancement. */}
      {showFilter && (
        <div
          title="Case filter — open the Algorithms page to filter by case"
          className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-white/80 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[#666] shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm"
        >
          Filter Cases
          <span className="font-[family-name:var(--font-geist-mono)] tabular-nums text-[#2C2C2C]">
            {filterSelected}/{filterTotal}
          </span>
        </div>
      )}

      {/* Inspection state hint — small, centered, only meaningful when inspection on */}
      {inspectionEnabled && (
        <span className="text-[0.55rem] uppercase tracking-[0.25em] text-[#BBB]">
          Inspection · 15s
        </span>
      )}

      {/* Settings gear — right-aligned */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Open settings"
        className="absolute right-0 top-3 flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-white/80 px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#666] backdrop-blur-sm transition-all hover:border-[#2C2C2C] hover:text-[#2C2C2C]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </button>
    </header>
  );
}
