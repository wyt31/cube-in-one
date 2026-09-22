"use client";

import type { TimerEvent } from "@/lib/timer-types";

// ============================================================================
// Top-Center scramble banner.
//
// Controls:
//   Scramble   [← Last]  [Next →]
// ============================================================================

export interface ScrambleDisplayProps {
  scramble: string;
  loading: boolean;
  /** Current puzzle event, used to adapt font size for long scrambles. */
  event: TimerEvent;
  /** 0-based position in the history; -1 if there's no history yet. */
  historyIndex: number;
  /** Called when user clicks "Last" (go back one) or "Next" (generate new). */
  onNav: (delta: -1 | 1) => void;
}

const BIG_EVENTS: TimerEvent[] = ["5x5x5", "6x6x6", "7x7x7", "Megaminx"];

export default function ScrambleDisplay({
  scramble,
  loading,
  event,
  historyIndex,
  onNav,
}: ScrambleDisplayProps) {
  const canBack = historyIndex > 0;
  const isBig = BIG_EVENTS.includes(event);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 px-4 text-center sm:gap-3 sm:px-6">
      {/* Navigation row: [Scramble label] [← Last] [Next →] */}
      <div className="flex items-center gap-2">
        <span className="text-[0.55rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Scramble
        </span>

        <button
          type="button"
          onClick={() => onNav(-1)}
          disabled={!canBack || loading}
          aria-label="Previous scramble"
          className="flex items-center gap-1 rounded-full border border-[#E8E8E4] bg-white px-2.5 py-1 text-[0.55rem] font-medium uppercase tracking-[0.18em] text-neutral-500 transition-all hover:border-neutral-800 hover:text-neutral-800 disabled:opacity-30 disabled:hover:border-[#E8E8E4] disabled:hover:text-neutral-500"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Last
        </button>

        <button
          type="button"
          onClick={() => onNav(1)}
          disabled={loading}
          aria-label="Next scramble"
          className="flex items-center gap-1 rounded-full border border-[#E8E8E4] bg-white px-2.5 py-1 text-[0.55rem] font-medium uppercase tracking-[0.18em] text-neutral-500 transition-all hover:border-neutral-800 hover:text-neutral-800 disabled:opacity-30 disabled:hover:border-[#E8E8E4] disabled:hover:text-neutral-500"
        >
          Next
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <p
        className={
          [
            "flex items-center justify-center overflow-hidden",
            "font-[family-name:var(--font-geist-mono)] leading-snug tracking-wide text-neutral-800",
            isBig
              ? "line-clamp-6 min-h-[4rem] max-h-[8rem] text-[0.7rem] sm:text-xs md:text-sm"
              : "line-clamp-4 min-h-[3rem] max-h-[6rem] text-xs sm:text-sm md:text-base",
          ].join(" ")
        }
      >
        {scramble || (loading ? "Generating…" : "—")}
      </p>
    </div>
  );
}
