// ============================================================================
// Async scramble generation via cubing.js.
//
// We keep cubing.js as a backend-only dependency (per project convention —
// no UI surface), and isolate the dynamic import here so the rest of the
// app never touches cubing's module graph directly.
// ============================================================================

import type { TimerEvent } from "./timer-types";

/**
 * Generate a fresh random scramble for the given WCA event.
 * Returns the scramble as a *string* (ready to feed back into cubing.js for
 * twisty-player rendering or into Cube2DScrambleView).
 */
export async function generateScramble(event: TimerEvent): Promise<string> {
  // Dynamically import — cubing.js is heavy and only needed on the client.
  const { randomScrambleForEvent } = await import("cubing/scramble");
  const alg = await randomScrambleForEvent(event);
  return alg.toString();
}
