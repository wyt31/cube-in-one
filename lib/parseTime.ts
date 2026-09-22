// ============================================================================
// parseTimeInput — pure, dependency-free parser for manual time entry.
//
// Supported input grammar (case-insensitive for penalty tokens):
//
//   1. Standalone penalty commands — modify the LATEST solve, no new row:
//        "+"        -> +2
//        "+2"      -> +2
//        "d"       -> DNF
//        "dnf"     -> DNF
//
//   2. A time, optionally suffixed with a penalty marker:
//        "10.52"    -> 10.52s, clean
//        "1:05.23"  -> 1:05.23, clean
//        "1052"     -> 10.52s, clean (pure-digit quick entry)
//        "12345"    -> 1:23.45, clean (pure-digit quick entry)
//        "3.57+"    -> 3.57s, +2
//        "3.57+2"   -> 3.57s, +2
//        "3.57d"    -> 3.57s, DNF
//        "3.57dnf"  -> 3.57s, DNF
//
// Pure-digit quick-entry rule: the last two digits are always centiseconds.
//   "1052"  -> "10" | "52"        -> 10.52
//   "12345" -> "1" "23" | "45"    -> 1:23.45
//   "52"    -> "" | "52"          -> 0.52
//   "5"     -> single digit is treated as whole seconds -> 5.00
//
// Times are returned in milliseconds (raw, before any +2). The penalty is
// reported separately so the caller can store it on Solve.penalty and let
// finalTime() apply the +2.
// ============================================================================

import type { Penalty } from "./timer-types";

export type ParsedInput =
  | { kind: "solve"; time: number; penalty: Penalty; rawInput: string }
  | { kind: "penalty-command"; penalty: 2 | -1; rawInput: string }
  | { kind: "invalid"; rawInput: string; reason: string };

/**
 * Parse centisecond digits into an integer in [0, 99].
 * "5" -> 50 (right-pad to two digits, so "10.5" == 10.50),
 * "52" -> 52, "523" -> 52 (truncate), "" -> 0.
 */
function parseCentiseconds(ccStr: string): number {
  if (!ccStr) return 0;
  let s = ccStr;
  if (s.length === 1) s = s + "0";
  if (s.length > 2) s = s.slice(0, 2);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Quick-entry rule for a string of pure digits (no dot, no colon).
 * The last two digits are centiseconds; preceding digits are seconds, and
 * once there are more than two preceding digits the leading portion spills
 * into minutes.
 */
function parsePureDigits(digits: string): number {
  // A lone digit is centiseconds (e.g. "1" -> 0.01s, "5" -> 0.05s).
  const cc = parseInt(digits.slice(-2), 10) || 0;
  const intPart = digits.slice(0, -2);
  if (intPart.length === 0) {
    // e.g. "52" -> 0.52s
    return cc * 10;
  }
  if (intPart.length <= 2) {
    const ss = parseInt(intPart, 10) || 0;
    return ss * 1000 + cc * 10;
  }
  // More than two integer digits -> minutes : seconds.
  const ss = parseInt(intPart.slice(-2), 10) || 0;
  const mm = parseInt(intPart.slice(0, -2), 10) || 0;
  return (mm * 60 + ss) * 1000 + cc * 10;
}

/**
 * Parse the numeric "core" (after any penalty suffix has been stripped) into
 * milliseconds. Returns null when the core is not a recognizable time.
 */
function parseTimeCore(core: string): number | null {
  const c = core.trim();
  if (!c) return null;

  // mm:ss[.cc]  (exactly one colon)
  if (c.includes(":")) {
    const parts = c.split(":");
    if (parts.length !== 2) return null;
    const mmStr = parts[0];
    const ssPart = parts[1];
    if (!/^\d+$/.test(mmStr)) return null;
    let ssStr: string;
    let ccStr: string;
    if (ssPart.includes(".")) {
      const sp = ssPart.split(".");
      if (sp.length !== 2) return null;
      ssStr = sp[0];
      ccStr = sp[1];
    } else {
      ssStr = ssPart;
      ccStr = "";
    }
    if (!/^\d*$/.test(ssStr) || !/^\d*$/.test(ccStr)) return null;
    const mm = parseInt(mmStr, 10);
    const ss = ssStr ? parseInt(ssStr, 10) : 0;
    if (ss >= 60) return null;
    const cc = parseCentiseconds(ccStr);
    return (mm * 60 + ss) * 1000 + cc * 10;
  }

  // ss.cc  (one dot)
  if (c.includes(".")) {
    const parts = c.split(".");
    if (parts.length !== 2) return null;
    const secStr = parts[0];
    const ccStr = parts[1];
    if (!/^\d*$/.test(secStr) || !/^\d*$/.test(ccStr)) return null;
    const ss = secStr ? parseInt(secStr, 10) : 0;
    const cc = parseCentiseconds(ccStr);
    return ss * 1000 + cc * 10;
  }

  // pure digits quick entry
  if (!/^\d+$/.test(c)) return null;
  return parsePureDigits(c);
}

/**
 * Main entry point. Never throws — malformed input yields `kind: "invalid"`.
 */
export function parseTimeInput(raw: string): ParsedInput {
  const rawInput = raw ?? "";
  const trimmed = rawInput.trim();
  if (!trimmed) return { kind: "invalid", rawInput, reason: "empty" };

  const lower = trimmed.toLowerCase();

  // --- Standalone penalty commands (target the latest solve) -------------
  if (lower === "+" || lower === "+2") {
    return { kind: "penalty-command", penalty: 2, rawInput };
  }
  if (lower === "d" || lower === "dnf") {
    return { kind: "penalty-command", penalty: -1, rawInput };
  }

  // --- Time with an optional trailing penalty suffix ---------------------
  let core = trimmed;
  let penalty: Penalty = 0;
  if (lower.endsWith("+2")) {
    penalty = 2;
    core = trimmed.slice(0, -2);
  } else if (lower.endsWith("+")) {
    penalty = 2;
    core = trimmed.slice(0, -1);
  } else if (lower.endsWith("dnf")) {
    penalty = -1;
    core = trimmed.slice(0, -3);
  } else if (lower.endsWith("d")) {
    penalty = -1;
    core = trimmed.slice(0, -1);
  }

  core = core.trim();
  const time = parseTimeCore(core);
  if (time === null || time < 0) {
    return { kind: "invalid", rawInput, reason: "unrecognized time" };
  }
  return { kind: "solve", time, penalty, rawInput };
}
