// ==========================================================================
// Export / clipboard text formatting for solve selections.
//
// Three-section format:
//   1. Stats Summary  — Ao5/Ao12/.../Trimmed Avg + Best + Worst
//   2. Time List      — numbered rows with trimmed (bracketed) entries
//   3. Footer         — cubein.one · date(s)
//
// Terminology:
//   - "Consecutive"   = selected indices are contiguous (no gaps).
//   - "Standard size" = 5, 12, 50, 100.
//   - "Trimmed"       = excluded from the average (best & worst extremes).
// ==========================================================================

import type { Solve } from "@/lib/timer-types";
import { formatTime, finalTime } from "@/lib/timer-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether the selected indices (into the full solve list) are
 * consecutive — i.e. [3,4,5,6] → true; [3,5,6] → false.
 */
export function checkIsConsecutive(indices: number[]): boolean {
  if (indices.length <= 1) return true;
  const sorted = [...indices].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
}

/** true if both epochs fall on the same calendar day. */
function isSameDate(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * Format the footer date range.
 *   same day  → "2026/08/27"
 *   range     → "2026/08/20-08/27"  (same year, same month)
 *              → "2026/08/20-09/15" (same year, diff month)
 *              → "2025/12/30-2026/01/02" (diff year)
 */
function formatDateRange(dates: number[]): string {
  if (dates.length === 0) return "";
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  const dMin = new Date(min);
  const dMax = new Date(max);

  const pad = (n: number) => String(n).padStart(2, "0");
  const y1 = dMin.getFullYear();
  const y2 = dMax.getFullYear();
  const mo1 = dMin.getMonth() + 1;
  const mo2 = dMax.getMonth() + 1;
  const day1 = dMin.getDate();
  const day2 = dMax.getDate();

  if (isSameDate(min, max)) {
    return `${y1}/${pad(mo1)}/${pad(day1)}`;
  }
  // Same year
  if (y1 === y2) {
    // Same month
    if (mo1 === mo2) {
      return `${y1}/${pad(mo1)}/${pad(day1)}-${pad(day2)}`;
    }
    return `${y1}/${pad(mo1)}/${pad(day1)}-${pad(mo2)}/${pad(day2)}`;
  }
  // Different year
  return `${y1}/${pad(mo1)}/${pad(day1)}-${y2}/${pad(mo2)}/${pad(day2)}`;
}

// ---------------------------------------------------------------------------
// Trimmed average calculation (matches the on-screen stats bar logic)
// ---------------------------------------------------------------------------

interface TrimResult {
  average: number | null;   // null = all DNF in the middle
  best: number | null;      // fastest valid time
  worst: number | null;     // slowest valid time (or DNF)
  trimmedIndices: Set<number>; // indices (into the input array) that were excluded
}

/**
 * Compute a trimmed average.
 *   - 5..19 items  → trim 1 best + 1 worst
 *   - 20+ items    → trim 5% from each end (floor of count * 0.05)
 *   - < 5 items    → no trim (pure mean)
 *
 * DNF is treated as +∞ for ranking purposes. If the middle set contains any
 * DNF, the average is null (= DNF). Best/worst are computed across ALL
 * entries (including trimmed ones).
 */
export function computeTrimmedAverage(solves: Solve[]): TrimResult {
  const n = solves.length;
  if (n === 0) {
    return { average: null, best: null, worst: null, trimmedIndices: new Set() };
  }

  // Determine trim count
  let trimCount: number;
  if (n < 5) trimCount = 0;
  else if (n < 20) trimCount = 1;
  else trimCount = Math.floor(n * 0.05);

  // Build ranked list: [{ idx, ft }] where ft = finalTime or +∞ for DNF
  const ranked = solves.map((s, idx) => ({
    idx,
    ft: finalTime(s),  // null for DNF
    isDNF: s.penalty === -1,
  }));

  // Sort by final time ascending (DNF = +∞ goes to the end)
  const sorted = [...ranked].sort((a, b) => {
    const av = a.ft ?? Infinity;
    const bv = b.ft ?? Infinity;
    return av - bv;
  });

  // Mark trimmed indices (best N + worst N)
  const trimmedIndices = new Set<number>();
  // Best (fastest) N from the sorted (ascending) list
  for (let i = 0; i < Math.min(trimCount, n); i++) {
    trimmedIndices.add(sorted[i].idx);
  }
  // Worst (slowest) N from the end of the sorted list
  for (let i = 0; i < Math.min(trimCount, n); i++) {
    trimmedIndices.add(sorted[n - 1 - i].idx);
  }

  // Best and worst across ALL entries
  const allValid = ranked.filter((r) => !r.isDNF).map((r) => r.ft!);
  const best = allValid.length > 0 ? Math.min(...allValid) : null;
  // Worst: if any DNF exists, worst = DNF (null); else max time
  const anyDNF = ranked.some((r) => r.isDNF);
  const worst = anyDNF ? null : (allValid.length > 0 ? Math.max(...allValid) : null);

  // Middle set = all indices NOT in trimmedIndices
  const middle = ranked.filter((r) => !trimmedIndices.has(r.idx));
  const middleValid = middle.filter((r) => !r.isDNF);

  let average: number | null;
  if (middleValid.length === 0) {
    average = null; // all middle entries are DNF
  } else {
    const sum = middleValid.reduce((acc, r) => acc + (r.ft ?? 0), 0);
    average = sum / middleValid.length;
  }

  return { average, best, worst, trimmedIndices };
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

const STANDARD_SIZES: Record<number, string> = {
  5: "Ao5",
  12: "Ao12",
  50: "Ao50",
  100: "Ao100",
};

/**
 * Format a selection of solves into the standard three-section export text.
 *
 * @param solves         — the selected solves, in chronological order (oldest → newest)
 * @param allSolveCount  — total solves in the current context (for consecutive check)
 * @param selectIndices  — indices of selected solves within the full list (for consecutive check)
 */
export function formatSolveExport(
  solves: Solve[],
  allSolveCount: number,
  selectIndices: number[],
): string {
  if (solves.length === 0) return "";

  // --- Header logic ---
  const isConsecutive = checkIsConsecutive(selectIndices);
  const isStandardSize = solves.length in STANDARD_SIZES;
  const useAoLabel = isConsecutive && isStandardSize;
  const label = useAoLabel ? STANDARD_SIZES[solves.length] : "Trimmed Avg";

  // --- Stats computation ---
  const { average, best, worst, trimmedIndices } = computeTrimmedAverage(solves);
  const avgStr = average === null ? "DNF" : `${formatTime(average)}s`;
  const bestStr = best === null ? "—" : formatTime(best);
  const worstStr = worst === null ? "DNF" : formatTime(worst);

  // --- Time List ---
  const lines: string[] = [];

  // Section 1: Stats Summary
  lines.push(`${label}: ${avgStr} (Best: ${bestStr} | Worst: ${worstStr})`);

  // Blank line separator
  lines.push("");

  // Section 2: Time List
  lines.push("Time List:");
  solves.forEach((s, i) => {
    // Build the time display string with penalty notation:
    //   OK  → "0.13"
    //   +2  → "0.15+"  (final time + trailing +)
    //   DNF → "DNF(0.23)"  (shows raw time in parens)
    let timeStr: string;
    if (s.penalty === -1) {
      timeStr = `DNF(${formatTime(s.time)})`;
    } else if (s.penalty === 2) {
      timeStr = `${formatTime(s.time + 2000)}+`;
    } else {
      timeStr = formatTime(s.time);
    }

    const isTrimmed = trimmedIndices.has(i);

    // Right-align the index at 2 digits, pad time to fixed width
    const idx = String(i + 1).padStart(2, " ");
    const paddedTime = isTrimmed
      ? `(${timeStr})`.padEnd(14, " ")
      : timeStr.padEnd(14, " ");

    lines.push(`${idx}. ${paddedTime}${s.scramble || ""}`);
  });

  // Separator line
  lines.push("-".repeat(40));

  // Section 3: Footer
  const dates = solves.map((s) => s.date);
  const dateStr = formatDateRange(dates);
  lines.push(`cubein.one · ${dateStr}`);

  return lines.join("\n");
}
