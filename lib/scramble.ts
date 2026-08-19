// ============================================================================
// Async scramble generation via cubing.js.
//
// cubing.js is kept as a backend-only dependency (per project convention —
// no UI surface). The dynamic import is isolated here so the rest of the app
// never touches cubing's module graph directly.
//
// Robustness contract:
//   - generateScramble() NEVER throws and never hangs forever.
//   - On any error (or a 15s safety timeout that only triggers when cubing.js
//     truly hangs) it resolves to a static fallback scramble string so the
//     UI never gets stuck on "Generating…".
//   - The optional `_mode` parameter is accepted for future case-specific
//     (专项) scramble generation but currently only WCA random scrambles are
//     produced — the mode is reserved, not yet wired into cubing.js.
// ============================================================================

import type { TimerEvent, TimerMode } from "./timer-types";

/**
 * Maps our friendly TimerEvent names to cubing.js event IDs accepted by
 * `randomScrambleForEvent`.
 */
export const CUBING_EVENT_ID: Record<TimerEvent, string> = {
  "2x2x2": "222",
  "3x3x3": "333",
  "4x4x4": "444",
  "5x5x5": "555",
  "6x6x6": "666",
  "7x7x7": "777",
  "3x3x3 OH": "333oh",
  "3x3x3 BF": "333bf",
  Clock: "clock",
  Megaminx: "minigsm",
  Pyraminx: "pyram",
  Skewb: "skewb",
  "Square-1": "sq1",
};

/**
 * Static fallback scrambles used when cubing.js fails or times out.
 * These are short, valid-looking sequences per event so the UI always has
 * something to render and the twisty-player can still preview the puzzle.
 */
const FALLBACK_SCRAMBLE: Record<TimerEvent, string> = {
  "2x2x2": "R U R' U' F R2 U' R2 U R2 F'",
  "3x3x3": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U'",
  "4x4x4": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U' Rw U Rw' U'",
  "5x5x5": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U' Rw U Rw' U' 3Rw U 3Rw' U'",
  "6x6x6": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U' 3Rw U 3Rw' U'",
  "7x7x7": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U' 3Rw U 3Rw' U'",
  "3x3x3 OH": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U'",
  "3x3x3 BF": "R U R' U' F R2 U' R2 U R2 F' U2 R U R' U'",
  Clock: "U R U' R' U R U' R' U R U' R' U R U' R' U R U' R'",
  Megaminx: "R++ D++ R-- D++ R++ D-- R-- D++ R++ D-- R-- D++",
  Pyraminx: "R U R' U' L R U R' U' L'",
  Skewb: "R U R' U' L R L' R U R' U' L R L'",
  "Square-1": "(0,5)/(1,2)/(-3,0)/(3,0)/(0,-1)/(2,0)/(-3,0)/(0,2)/(0,-2)/(3,0)",
};

/** Safety timeout: if cubing.js hasn't resolved within this, use the fallback. */
const SCRAMBLE_TIMEOUT_MS = 15000;

/**
 * Generate a fresh random scramble for the given WCA event.
 * Always resolves — never rejects, never hangs forever.
 *
 * @param event  Friendly event name (e.g. "3x3x3 OH", "Square-1").
 * @param _mode  Optional training mode (reserved for future case-specific
 *               scramble generation; currently unused).
 */
export async function generateScramble(
  event: TimerEvent,
  _mode?: TimerMode,
): Promise<string> {
  const eventId = CUBING_EVENT_ID[event] ?? "333";
  const fallback = FALLBACK_SCRAMBLE[event] ?? FALLBACK_SCRAMBLE["3x3x3"];

  try {
    const { randomScrambleForEvent } = await import("cubing/scramble");

    // Race the real generation against a safety timeout so a hung cubing.js
    // call can never freeze the UI on "Generating…". The timeout is long
    // enough (15s) that legitimate cold-start generation on big cubes (6x6/7x7)
    // completes normally without tripping the fallback.
    const result = await Promise.race([
      randomScrambleForEvent(eventId),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`scramble-timeout:${eventId}`)),
          SCRAMBLE_TIMEOUT_MS,
        ),
      ),
    ]);

    const str = (result as { toString(): string }).toString();
    return str || fallback;
  } catch (e) {
    console.warn(
      `[scramble] generation failed for ${eventId} (mode=${_mode ?? "WCA"}), using fallback:`,
      e,
    );
    return fallback;
  }
}
