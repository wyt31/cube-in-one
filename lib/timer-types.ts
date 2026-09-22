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

/**
 * Input entry source: space-bar timer vs manual typing.
 * Used by the page to switch between TimerFocus and ManualTimeInput.
 */
export type InputMode = "timer" | "typing";

/**
 * A named session group that isolates solves into different buckets
 * (e.g. "Default", "Practice", "Comp Sim").  The `id` is a stable
 * string used as the foreign key on Solve; `name` is the display label
 * the user can freely rename.  `isDefault` marks the always-present
 * session that cannot be deleted.
 *
 * `event` scopes a session to a single puzzle — each event owns its own
 * default session and sessions are never shared across events.
 */
export interface Session {
  id: string;
  name: string;
  event: TimerEvent;
  createdAt: number;
  isDefault?: boolean;
}

/** One stored solve row. Field names match the Dexie schema 1:1. */
export interface Solve {
  id?: number; // auto-increment primary key
  event: TimerEvent;
  session: string; // display name (kept for backward compat / denormalized)
  sessionId?: string; // links to Session.id (new field for grouped sessions)
  time: number; // raw milliseconds before penalty is applied
  penalty: Penalty;
  scramble: string;
  inspectionTime?: number; // ms spent in inspection (for diagnostics)
  note?: string; // user-authored review note for this solve
  /**
   * Original text the user typed when entering the solve manually
   * (Typing mode). Absent for space-bar timer solves.
   */
  rawInput?: string;
  /**
   * Reserved for the future PSC (Prepared Solve Challenge) mode: true when
   * the solve was completed under PSC mode. Always false/absent for now.
   */
  isPsc?: boolean;
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
