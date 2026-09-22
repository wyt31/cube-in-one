// ============================================================================
// WCA-compliant rolling averages.
//
// AoX = "average of X" — drop the best and worst of X solves, average the
// remaining (X - 2). Returns null when there are not enough *valid* solves
// (WCA rule: AoX requires at least X - 2 non-DNF results; 2 DNFs is the cap).
// ============================================================================

import { finalTime, type Solve } from "./timer-types";

/**
 * Compute AoX on an array of *final* times in milliseconds.
 * `times` should already have penalties applied; use `finalTime()` to convert.
 * Pass them in chronological order — we average the last `x` entries.
 *
 * Returns:
 *   - the average (ms), or
 *   - null when fewer than `x` entries are supplied, or
 *   - null when there are 2 or more DNFs (DNF = null entry) in the window.
 */
export function calcAoX(
  times: (number | null)[],
  x: number,
): number | null {
  if (times.length < x) return null;

  const window = times.slice(times.length - x);
  // WCA: max 2 DNFs allowed in an AoX. More than 2 DNFs in the window
  // => the AoX itself is a DNF.
  const dnfCount = window.filter((t) => t === null).length;
  if (dnfCount >= 2) return null;

  // Drop best (min) and worst (max / DNF). DNFs count as the worst.
  const numeric = window
    .map((t, i) => ({ t, i }))
    .filter((e) => e.t !== null) as { t: number; i: number }[];
  // sort ascending to drop best (first) & worst (last)
  numeric.sort((a, b) => a.t - b.t);
  // Remove the best and worst valid times. If there are DNFs, those already
  // occupy the "worst" slot — still drop one best + one worst.
  const middle = numeric.slice(1, numeric.length - 1);
  if (middle.length === 0) return null;
  const sum = middle.reduce((acc, e) => acc + e.t, 0);
  return sum / middle.length;
}

/** Convenience wrappers. */
export const calcAo5 = (t: (number | null)[]) => calcAoX(t, 5);
export const calcAo12 = (t: (number | null)[]) => calcAoX(t, 12);
export const calcAo50 = (t: (number | null)[]) => calcAoX(t, 50);
export const calcAo100 = (t: (number | null)[]) => calcAoX(t, 100);

/**
 * Best-of-N single. null when there are no valid times in the slice.
 */
export function bestSingle(times: (number | null)[]): number | null {
  const valid = times.filter((t): t is number => t !== null);
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

/** Current "rolling" averages: AoX of the *last* X solves, no historical best. */
export interface RollingStats {
  currentAo5: number | null;
  currentAo12: number | null;
  currentAo50: number | null;
  currentAo100: number | null;
}

/** Session best-of: best single, best Ao5/Ao12/Ao50/Ao100 across the session. */
export interface SessionStats {
  bestSingle: number | null;
  bestAo5: number | null;
  bestAo12: number | null;
  bestAo50: number | null;
  bestAo100: number | null;
  count: number;
}

/** Map a list of solves (chronological) to their final-time list. */
export function solvesToFinalTimes(solves: Solve[]): (number | null)[] {
  return solves.map(finalTime);
}

/**
 * Compute "best ever" session stats by sliding the AoX window over every
 * valid ending position — O(n·x) which is fine for typical sessions (<1000).
 */
export function computeSessionStats(solves: Solve[]): SessionStats {
  const times = solvesToFinalTimes(solves);
  const count = solves.length;
  let bestAo5: number | null = null;
  let bestAo12: number | null = null;
  let bestAo50: number | null = null;
  let bestAo100: number | null = null;

  // slide every window
  for (let i = 5; i <= times.length; i++) {
    const slice = times.slice(0, i);
    const a = calcAo5(slice);
    if (a !== null && (bestAo5 === null || a < bestAo5)) bestAo5 = a;
  }
  for (let i = 12; i <= times.length; i++) {
    const slice = times.slice(0, i);
    const a = calcAo12(slice);
    if (a !== null && (bestAo12 === null || a < bestAo12)) bestAo12 = a;
  }
  for (let i = 50; i <= times.length; i++) {
    const slice = times.slice(0, i);
    const a = calcAo50(slice);
    if (a !== null && (bestAo50 === null || a < bestAo50)) bestAo50 = a;
  }
  for (let i = 100; i <= times.length; i++) {
    const slice = times.slice(0, i);
    const a = calcAo100(slice);
    if (a !== null && (bestAo100 === null || a < bestAo100)) bestAo100 = a;
  }

  return {
    bestSingle: bestSingle(times),
    bestAo5,
    bestAo12,
    bestAo50,
    bestAo100,
    count,
  };
}

/** Compute *current* (rolling) AoX — just the last X solves. */
export function computeRollingStats(solves: Solve[]): RollingStats {
  const times = solvesToFinalTimes(solves);
  return {
    currentAo5: calcAo5(times),
    currentAo12: calcAo12(times),
    currentAo50: calcAo50(times),
    currentAo100: calcAo100(times),
  };
}

// ============================================================================
// AoX Window detail — for the Average Detail Modal.
// Returns the N solves in the window, which indices are trimmed (best/worst),
// and the computed average. Mirrors calcAoX's trimming logic exactly.
// ============================================================================

export interface AoXWindow {
  /** The N solves in chronological order within this window. */
  solves: Solve[];
  /** The computed AoX value (null = DNF or insufficient data). */
  average: number | null;
  /** Indices within `solves` that are trimmed (best + worst). */
  trimmedIndices: number[];
}

/**
 * Build a window result from N solves, identifying which are trimmed.
 * Mirrors calcAoX: drop best (min) and worst (max) among non-null; DNFs are
 * implicitly excluded and also marked as trimmed for display purposes.
 */
function buildWindow(windowSolves: Solve[], x: number): AoXWindow {
  const times = windowSolves.map(finalTime);
  const average = calcAoX(times, x);
  const trimmed: number[] = [];

  if (times.length >= x && average !== null) {
    // Sort non-null by value to find best + worst
    const valid = times
      .map((t, i) => ({ t, i }))
      .filter((e) => e.t !== null) as { t: number; i: number }[];
    valid.sort((a, b) => a.t - b.t);
    if (valid.length > 0) trimmed.push(valid[0].i); // best
    if (valid.length > 1) trimmed.push(valid[valid.length - 1].i); // worst
  }

  // DNF indices are always trimmed (excluded from the average)
  times.forEach((t, i) => {
    if (t === null && !trimmed.includes(i)) trimmed.push(i);
  });

  return { solves: windowSolves, average, trimmedIndices: trimmed };
}

/** Get the *current* (last-N) AoX window. Returns null if insufficient solves. */
export function getCurrentAoXWindow(solves: Solve[], x: number): AoXWindow | null {
  if (solves.length < x) return null;
  const windowSolves = solves.slice(solves.length - x);
  return buildWindow(windowSolves, x);
}

/**
 * Find the *best-ever* AoX window by sliding over all valid positions.
 * Returns the window with the lowest average. Returns null if no valid window.
 */
export function getBestAoXWindow(solves: Solve[], x: number): AoXWindow | null {
  let best: AoXWindow | null = null;
  for (let i = x; i <= solves.length; i++) {
    const windowSolves = solves.slice(i - x, i);
    const w = buildWindow(windowSolves, x);
    if (w.average !== null && (best === null || w.average < best.average!)) {
      best = w;
    }
  }
  return best;
}

/** Find the solve index (in the full solves array) that has the best single. */
export function findBestSingleIndex(solves: Solve[]): number {
  let bestIdx = -1;
  let bestVal = Infinity;
  for (let i = 0; i < solves.length; i++) {
    const ft = finalTime(solves[i]);
    if (ft !== null && ft < bestVal) {
      bestVal = ft;
      bestIdx = i;
    }
  }
  return bestIdx;
}
