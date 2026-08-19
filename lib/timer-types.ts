// ============================================================================
// Shared types for the timer module.
// Kept here so both the data layer (lib/db.ts) and UI components can import a
// single, stable contract without circular dependencies.
// ============================================================================

/** Puzzle event identifiers supported by the timer (UI labels = cubing IDs). */
export type PuzzleId =
  | "2x2x2"
  | "3x3x3"
  | "4x4x4"
  | "5x5x5"
  | "6x6x6"
  | "7x7x7"
  | "3x3x3OH"
  | "3x3x3BF"
  | "clock"
  | "megaminx"
  | "pyraminx"
  | "skewb"
  | "sq1";

/**
 * Backwards-compatible alias. Existing solves only stored 2x2x2..5x5x5, but
 * the DB indexes `event` as a plain string, so the superset is safe.
 */
export type TimerEvent = PuzzleId;

/** Mode IDs. "WCA" is always available; others are specialized training modes. */
export type ModeId =
  // 2x2x2 specialized
  | "CLL"
  | "EG1"
  | "EG2"
  | "TCLL+"
  | "TCLL-"
  | "TCLL"
  | "LS"
  | "No Bar"
  // 3x3x3 specialized
  | "OLL"
  | "PLL"
  | "LL"
  // Default
  | "WCA";

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

// ============================================================================
// Puzzle / Mode configuration
// ============================================================================

export interface PuzzleOption {
  id: PuzzleId;
  label: string; // displayed in the puzzle capsule
  cubingEvent: string; // cubing.js event ID for randomScrambleForEvent
  /** Hint used by the preview viewer. "other" falls back to twisty 3D. */
  previewPuzzle:
    | "2x2"
    | "3x3"
    | "4x4"
    | "5x5"
    | "6x6"
    | "7x7"
    | "other";
}

export interface ModeOption {
  id: ModeId;
  label: string;
  /** Total cases for this training mode. 0 means no Filter Cases pill. */
  totalCases: number;
}

export const PUZZLES: PuzzleOption[] = [
  { id: "2x2x2",    label: "2x2x2",    cubingEvent: "2x2x2",    previewPuzzle: "2x2" },
  { id: "3x3x3",    label: "3x3x3",    cubingEvent: "3x3x3",    previewPuzzle: "3x3" },
  { id: "4x4x4",    label: "4x4x4",    cubingEvent: "4x4x4",    previewPuzzle: "4x4" },
  { id: "5x5x5",    label: "5x5x5",    cubingEvent: "5x5x5",    previewPuzzle: "5x5" },
  { id: "6x6x6",    label: "6x6x6",    cubingEvent: "6x6x6",    previewPuzzle: "6x6" },
  { id: "7x7x7",    label: "7x7x7",    cubingEvent: "7x7x7",    previewPuzzle: "7x7" },
  { id: "3x3x3OH",  label: "3x3x3OH",  cubingEvent: "3x3x3oh",  previewPuzzle: "3x3" },
  { id: "3x3x3BF",  label: "3x3x3BF",  cubingEvent: "3x3x3bld", previewPuzzle: "3x3" },
  { id: "clock",    label: "Clock",    cubingEvent: "clock",    previewPuzzle: "other" },
  { id: "megaminx", label: "Megaminx", cubingEvent: "megaminx", previewPuzzle: "other" },
  { id: "pyraminx", label: "Pyraminx", cubingEvent: "pyraminx", previewPuzzle: "other" },
  { id: "skewb",    label: "Skewb",    cubingEvent: "skewb",    previewPuzzle: "other" },
  { id: "sq1",      label: "sq1",      cubingEvent: "sq1",      previewPuzzle: "other" },
];

const WCA_MODE: ModeOption = { id: "WCA", label: "WCA", totalCases: 0 };

export const MODES_BY_PUZZLE: Record<PuzzleId, ModeOption[]> = {
  "2x2x2": [
    WCA_MODE,
    { id: "CLL",    label: "CLL",    totalCases: 42 },
    { id: "EG1",    label: "EG1",    totalCases: 40 },
    { id: "EG2",    label: "EG2",    totalCases: 40 },
    { id: "TCLL+",  label: "TCLL+",  totalCases: 54 },
    { id: "TCLL-",  label: "TCLL-",  totalCases: 54 },
    { id: "TCLL",   label: "TCLL",   totalCases: 54 },
    { id: "LS",     label: "LS",     totalCases: 27 },
    { id: "No Bar", label: "No Bar", totalCases: 50 },
  ],
  "3x3x3": [
    WCA_MODE,
    { id: "OLL", label: "OLL", totalCases: 57 },
    { id: "PLL", label: "PLL", totalCases: 21 },
    { id: "LL",  label: "LL",  totalCases: 78 },
  ],
  "4x4x4":   [WCA_MODE],
  "5x5x5":   [WCA_MODE],
  "6x6x6":   [WCA_MODE],
  "7x7x7":   [WCA_MODE],
  "3x3x3OH": [WCA_MODE],
  "3x3x3BF": [WCA_MODE],
  "clock":     [WCA_MODE],
  "megaminx":  [WCA_MODE],
  "pyraminx": [WCA_MODE],
  "skewb":    [WCA_MODE],
  "sq1":      [WCA_MODE],
};

/** Returns true if the mode has a case-filter UI (i.e. is a specialized mode). */
export function isSpecializedMode(mode: ModeId): boolean {
  return mode !== "WCA";
}

/** Get puzzle option by ID (defensive: falls back to 3x3x3). */
export function getPuzzle(id: PuzzleId): PuzzleOption {
  return PUZZLES.find((p) => p.id === id) ?? PUZZLES[1];
}

/** Get modes available for a given puzzle. */
export function getModes(puzzle: PuzzleId): ModeOption[] {
  return MODES_BY_PUZZLE[puzzle] ?? [WCA_MODE];
}

/** Get a mode option by ID for a given puzzle (defensive: falls back to WCA). */
export function getMode(puzzle: PuzzleId, modeId: ModeId): ModeOption {
  const modes = getModes(puzzle);
  return modes.find((m) => m.id === modeId) ?? WCA_MODE;
}
