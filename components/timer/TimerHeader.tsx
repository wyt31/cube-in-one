"use client";

import type { TimerEvent, TimerMode, Session } from "@/lib/timer-types";
import SessionDropdown from "@/components/timer/SessionDropdown";

// ============================================================================
// Top Header for the timer page.
//
// Layout (3 columns — matches the bottom corners' container width):
//
//   Left:  [ Session ▾ ]   [ HISTORY ]
//   Center:                         [ 3x3x3 ▾ ] [ WCA ▾ ]  (+ Filter below)
//   Right:                                                  [ ⚙ SETTINGS ]
// ============================================================================

export interface TimerHeaderProps {
  event: TimerEvent;
  events: TimerEvent[];
  mode: TimerMode;
  modes: TimerMode[];
  sessions: Session[];
  activeSessionId: string;
  solveCounts: Record<string, number>;
  onSelectSession: (id: string) => void;
  onCreateSession: (name: string) => void;
  onRenameSession: (id: string, name: string) => void;
  onDeleteSession: (id: string) => void;
  filterSelected: number;
  filterTotal: number;
  onEventChange: (e: TimerEvent) => void;
  onModeChange: (m: TimerMode) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenCaseFilter: () => void;
}

/**
 * Liquid-glass styled capsule wrapping a native <select>.
 */
function SelectCapsule({
  value,
  onChange,
  options,
  ariaLabel,
  align = "center",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  align?: "left" | "center";
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[#E8E8E4] dark:border-white/8 bg-white/80 dark:bg-white/5 px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-colors hover:border-neutral-800/40 dark:hover:border-white/30">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer appearance-none bg-transparent pr-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-neutral-800 dark:text-neutral-200 focus:outline-none ${
          align === "left" ? "text-left" : "text-center"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="text-[0.6rem] leading-none text-[#9A9A95] dark:text-neutral-500">
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
  sessions,
  activeSessionId,
  solveCounts,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  filterSelected,
  filterTotal,
  onEventChange,
  onModeChange,
  onOpenSettings,
  onOpenHistory,
  onOpenCaseFilter,
}: TimerHeaderProps) {
  const puzzleOptions = events.map((e) => ({ value: e, label: e }));
  const modeOptions = modes.map((m) => ({ value: m, label: m }));
  const showFilter = mode !== "WCA" && mode !== "LL";

  return (
    <header className="flex w-full flex-col gap-2 py-2">
      {/* Main row: 3 columns — Left / Center / Right */}
      <div className="grid w-full grid-cols-3 items-center">
        {/* Left: Session dropdown + HISTORY */}
        <div className="flex items-center gap-2 justify-start">
          <SessionDropdown
            sessions={sessions}
            activeSessionId={activeSessionId}
            solveCounts={solveCounts}
            onSelect={onSelectSession}
            onCreate={onCreateSession}
            onRename={onRenameSession}
            onDelete={onDeleteSession}
          />
          <button
            type="button"
            onClick={onOpenHistory}
            title="Session history"
            className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] dark:border-white/8 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all hover:border-neutral-800 dark:hover:border-white/30 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              <path d="M12 7v5l4 2" />
            </svg>
            History
          </button>
        </div>

        {/* Center: Puzzle + Mode */}
        <div className="flex items-center justify-center gap-2">
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

        {/* Right: Settings */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] dark:border-white/8 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 backdrop-blur-sm transition-all hover:border-neutral-800 dark:hover:border-white/30 hover:text-neutral-800 dark:hover:text-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <svg
              width="13"
              height="13"
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
        </div>
      </div>

      {/* Filter Cases (centered row below) — only for 专项 modes */}
      {showFilter && (
        <div className="flex w-full justify-center">
          <button
            type="button"
            onClick={onOpenCaseFilter}
            title="Filter cases"
            className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] dark:border-white/8 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all hover:border-neutral-800 dark:hover:border-white/30 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Filter Cases
            <span className="font-[family-name:var(--font-geist-mono)] tabular-nums text-neutral-800 dark:text-neutral-200">
              {filterSelected}/{filterTotal}
            </span>
          </button>
        </div>
      )}
    </header>
  );
}
