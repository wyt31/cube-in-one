import type { TimerEvent } from "@/lib/timer-types";

// ============================================================================
// Local scramble fallback generator.
//
// cubing.js (loaded from the CDN) is the primary source of WCA-compliant
// scrambles. When the CDN module or its web worker fails to load (network
// hiccup, CORS, browser worker restrictions), this module generates a
// pseudo-random scramble locally so the timer never shows a blank scramble.
//
// These are NOT cryptographically random-state scrambles — they are random
// move sequences. Suitable as a fallback for casual practice only.
// ============================================================================

const MOVES_333 = ["U", "D", "L", "R", "F", "B"];
const MOVES_222 = ["U", "R", "F"];
const MOVES_444 = ["U", "D", "L", "R", "F", "B", "Uw", "Dw", "Lw", "Rw", "Fw", "Bw"];
const MOVES_555 = ["U", "D", "L", "R", "F", "B", "Uw", "Dw", "Lw", "Rw", "Fw", "Bw"];
const MOVES_666 = ["U", "D", "L", "R", "F", "B", "Uw", "Dw", "Lw", "Rw", "Fw", "Bw", "3Uw", "3Dw", "3Lw", "3Rw", "3Fw", "3Bw"];
const MOVES_777 = ["U", "D", "L", "R", "F", "B", "Uw", "Dw", "Lw", "Rw", "Fw", "Bw", "3Uw", "3Dw", "3Lw", "3Rw", "3Fw", "3Bw"];
const MOVES_SKEWB = ["U", "L", "R", "B"];

const SUFFIXES = ["", "'", "2"];
const SUFFIXES_BIG = ["", "'", "2", "2'"];

function rand(n: number): number {
  return Math.floor(Math.random() * n);
}

function pick<T>(arr: T[]): T {
  return arr[rand(arr.length)];
}

/**
 * Generate a random move sequence for NxN cubes (3x3 and larger).
 * Avoids consecutive moves on the same face and its wide counterpart.
 */
function genCubeScramble(moves: string[], length: number, useBigSuffix = false): string {
  const result: string[] = [];
  let lastFace = "";
  for (let i = 0; i < length; i++) {
    let move: string;
    let face: string;
    do {
      move = pick(moves);
      // Extract the base face letter for conflict detection
      face = move.replace(/^3?/, "").replace(/w$/, "").charAt(0);
    } while (face === lastFace);
    lastFace = face;
    const suffix = useBigSuffix ? pick(SUFFIXES_BIG) : pick(SUFFIXES);
    result.push(move + suffix);
  }
  return result.join(" ");
}

function gen222Scramble(): string {
  const result: string[] = [];
  let lastFace = "";
  for (let i = 0; i < 10; i++) {
    let move: string;
    do {
      move = pick(MOVES_222);
    } while (move === lastFace);
    lastFace = move;
    result.push(move + pick(SUFFIXES));
  }
  return result.join(" ");
}

function genClockScramble(): string {
  // Simplified clock scramble (not WCA-compliant, but usable)
  const pins = ["UR", "DR", "DL", "UL", "U", "R", "D", "L", "ALL"];
  const result: string[] = [];
  for (const pin of pins) {
    const turns = rand(7) - 3; // -3 to +3
    const suffix = turns === 0 ? "" : turns > 0 ? "+" : "-";
    result.push(`${pin}${Math.abs(turns)}${suffix}`);
  }
  return result.join(" ");
}

function genPyraminxScramble(): string {
  const result: string[] = [];
  let lastFace = "";
  const faces = ["U", "L", "R", "B"];
  for (let i = 0; i < 8; i++) {
    let face: string;
    do {
      face = pick(faces);
    } while (face === lastFace);
    lastFace = face;
    result.push(face + pick(SUFFIXES));
  }
  // Add optional tip moves
  const tips = ["u", "l", "r", "b"];
  for (const tip of tips) {
    if (Math.random() > 0.5) {
      result.push(tip + pick(["", "'"]));
    }
  }
  return result.join(" ");
}

function genSkewbScramble(): string {
  const result: string[] = [];
  let lastFace = "";
  for (let i = 0; i < 10; i++) {
    let face: string;
    do {
      face = pick(MOVES_SKEWB);
    } while (face === lastFace);
    lastFace = face;
    result.push(face + pick(SUFFIXES));
  }
  return result.join(" ");
}

function genMegaminxScramble(): string {
  // Simplified megaminx scramble
  const faces = ["U", "R", "D", "L", "F", "BL", "BR", "FL", "FR", "UL", "UR", "DL", "DR"];
  const result: string[] = [];
  let lastFace = "";
  for (let i = 0; i < 30; i++) {
    let face: string;
    do {
      face = pick(faces);
    } while (face === lastFace);
    lastFace = face;
    result.push(face + pick(["++", "--"]));
  }
  return result.join(" ");
}

function genSq1Scramble(): string {
  // Very simplified Square-1 scramble
  const result: string[] = ["("];
  for (let i = 0; i < 12; i++) {
    const top = rand(8) - 4;
    const bottom = rand(8) - 4;
    result.push(`${top},${bottom}`);
    if (i < 11) result.push("/");
  }
  result.push(")");
  return result.join(" ");
}

export function genLocalScramble(event: TimerEvent): string {
  switch (event) {
    case "2x2x2":
      return gen222Scramble();
    case "3x3x3":
    case "3x3x3 OH":
    case "3x3x3 BF":
      return genCubeScramble(MOVES_333, 20);
    case "4x4x4":
      return genCubeScramble(MOVES_444, 40, true);
    case "5x5x5":
      return genCubeScramble(MOVES_555, 60, true);
    case "6x6x6":
      return genCubeScramble(MOVES_666, 80, true);
    case "7x7x7":
      return genCubeScramble(MOVES_777, 100, true);
    case "Clock":
      return genClockScramble();
    case "Megaminx":
      return genMegaminxScramble();
    case "Pyraminx":
      return genPyraminxScramble();
    case "Skewb":
      return genSkewbScramble();
    case "Square-1":
      return genSq1Scramble();
    default:
      return genCubeScramble(MOVES_333, 20);
  }
}
