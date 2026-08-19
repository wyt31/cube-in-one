// ============================================================================
// Async scramble generation via cubing.js.
//
// We keep cubing.js as a backend-only dependency (per project convention —
// no UI surface), and isolate the dynamic import here so the rest of the
// app never touches cubing's module graph directly.
//
// cubing.js is heavy and SSR-unsafe; the dynamic import below is only ever
// invoked from event handlers / effects, so it never runs on the server.
// ============================================================================

import { getPuzzle, type PuzzleId } from "./timer-types";

/**
 * Generate a fresh random scramble for the given WCA event.
 * Returns the scramble as a *string* (ready to feed back into cubing.js for
 * twisty-player rendering or into Cube2DScrambleView).
 */
export async function generateScramble(puzzle: PuzzleId): Promise<string> {
  // Dynamically import — cubing.js is heavy and only needed on the client.
  // The dynamic import() is only invoked at call-time inside effects/handlers,
  // so it never reaches the server bundle.
  const { randomScrambleForEvent } = await import("cubing/scramble");
  const { cubingEvent } = getPuzzle(puzzle);
  const alg = await randomScrambleForEvent(cubingEvent);
  return alg.toString();
}
