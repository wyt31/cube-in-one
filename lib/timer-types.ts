// ============================================================================
// Shared types for the timer module.
// Kept here so both the data layer (lib/db.ts) and UI components can import a
// single, stable contract without circular dependencies.
// ============================================================================

/**
 * WCA-style puzzle/event identifiers supported by the timer.
 *
 * These friendly names are what the UI shows and what the DB stores. They are
 * translated to cubing.js event IDs ("222", "333oh", "minigsm", ...) inside
 * lib/scramble.ts so the rest of the app never has to know the wire format.
 */
export type TimerEvent =
  | "2x2x2"
  | "3x3x3"
  | "4x4x4"
  | "5x5x5"
  | "6x6x6"
  | "7x7x7"
  | "3x3x3 OH"
  | "3x3x3 BF"
  | "Clock"
  | "Megaminx"
  | "Pyraminx"
  | "Skewb"
  | "Square-1";

/**
 * Generation/training mode.
 *
 * `WCA` produces a standard WCA random scramble for the event. The other
 * modes are "专项" (case-specific drill) modes — the Filter Cases capsule is
 * only shown when mode !== "WCA". Case-specific scramble generation is a future
 * enhancement (see lib/scramble.ts); for now the filter just scopes which
 * algorithm cases are counted/exposed.
 */
export type TimerMode =
  // generic
  | "WCA"
  // 2x2 专项 modes
  | "CLL"
  | "EG1"
  | "EG2"
  | "TCLL"
  | "TCLL+"
  | "TCLL-"
  | "LS"
  // 3x3 专项 modes
  | "OLL"
  | "PLL"
  | "LL";

/** Penalty codes — mirror WCA rules. */
//   0   = clean
//   2   = +2 (over 15s inspection, or A-cut during solve, etc.)
//   -1  = DNF
export type Penalty = 0 | 2 | -1;

/** One stored solve row. Field names match the Dexie schema 1:1. */
export interface Solve {
  id?: number; // auto-increment primary key
  event: TimerEvent;
  session: string; // e.g. "Default", "Practice"
  time: number; // raw milliseconds before penalty is applied
  penalty: Penalty;
  scramble: string;
  inspectionTime?: number; // ms spent in inspection (for diagnostics)
  date: number; // epoch ms
}

/** Result of applying the penalty to a raw time. null means "no displayable time". */
export function finalTime(s: Solve): number | null {
  if (s.penalty === -1) return null; // DNF
  if (s.penalty === 2) return s.time + 2000;
  return s.time;
}

/** Compact mm:ss.cc formatter for displaying a millisecond value. */
export function formatTime(ms: number | null): string {
  if (ms === null || ms < 0) return "DNF";
  const totalMs = Math.floor(ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centis = Math.floor((totalMs % 1000) / 10);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return minutes > 0
    ? `${minutes}:${pad(seconds)}.${pad(centis)}`
    : `${seconds}.${pad(centis)}`;
}
