"use client";

import type { TimerEvent } from "@/lib/timer-types";

// ============================================================================
// Top Header for the timer page.
//   Centered three-capsule toolbar:  [ Puzzle ] [ Mode ] [ Case ]
//   Right side: a minimal gear icon that opens the Settings drawer.
// ============================================================================

export interface TimerHeaderProps {
  event: TimerEvent;
  events: TimerEvent[];
  session: string;
  sessions: string[];
  inspectionEnabled: boolean;
  onEventChange: (e: TimerEvent) => void;
  onSessionChange: (s: string) => void;
  onToggleInspection: () => void;
  onOpenSettings: () => void;
}

function Capsule({
  label,
  value,
  onClick,
  children,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  // When `children` is provided (e.g. a <select>), we render it inline instead
  // of a static value+click-cycler. This keeps the styled-select capsule
  // accessible while still matching the visual capsule template.
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#E8E8E4] bg-white px-3 py-1.5">
      <span className="text-[0.55rem] font-medium uppercase tracking-[0.2em] text-[#A0A09A]">
        {label}
      </span>
      {children ?? (
        <button
          type="button"
          onClick={onClick}
          className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[#2C2C2C] transition-colors hover:text-[#000]"
        >
          {value}
        </button>
      )}
    </div>
  );
}

export default function TimerHeader({
  event,
  events,
  session,
  sessions,
  inspectionEnabled,
  onEventChange,
  onSessionChange,
  onToggleInspection,
  onOpenSettings,
}: TimerHeaderProps) {
  // Cycle through events on click.
  const cycleEvent = () => {
    const idx = events.indexOf(event);
    const next = events[(idx + 1) % events.length];
    onEventChange(next);
  };

  return (
    <header className="relative flex w-full items-center justify-center py-4">
      {/* Centered three-capsule toolbar */}
      <div className="flex items-center gap-2">
        <Capsule
          label="Puzzle"
          value={event.replace("x", "")} // "3x3x3" -> "3x3"
          onClick={cycleEvent}
        />

        <Capsule
          label="Mode"
          value={inspectionEnabled ? "Inspection" : "Casual"}
          onClick={onToggleInspection}
        />

        {/* Case pill — styled select for accessibility */}
        <div className="flex items-center gap-2 rounded-full border border-[#E8E8E4] bg-white px-3 py-1.5">
          <span className="text-[0.55rem] font-medium uppercase tracking-[0.2em] text-[#A0A09A]">
            Case
          </span>
          <select
            value={session}
            onChange={(e) => onSessionChange(e.target.value)}
            className="cursor-pointer bg-transparent text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[#2C2C2C] focus:outline-none"
          >
            {sessions.length === 0 ? (
              <option value="Default">Default</option>
            ) : (
              sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Settings gear — right-aligned */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Open settings"
        className="absolute right-0 flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-white px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#666] transition-all hover:border-[#2C2C2C] hover:text-[#2C2C2C]"
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
