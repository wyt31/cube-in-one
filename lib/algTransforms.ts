// ---------------------------------------------------------------------------
// Formula transforms behind the modal's Reverse / Mirror action buttons.
//
// Kept self-contained on purpose: the modal only ever calls
// `applyAlgTransforms`, so the exact notation rules can be tuned here later
// without touching any UI code.
//
//   reverse — the inverse of the alg: reverse the unit order and flip every
//             move's direction (prime).  R U R'  ->  R U' R'
//   mirror  — reflection across the M slice (the plane between L and R):
//             swap L<->R bases and flip the direction of face moves.
//             R U R'  ->  L' U' L
//             Rotations follow the same reflection: x maps to itself
//             (x -> x, x' -> x', x2 -> x2) because it spins about the mirror
//             axis, while y and z flip direction (y -> y', z -> z').
//
// Both are involutions and commute, so they can be toggled independently or
// together.
// ---------------------------------------------------------------------------

// Faces that live on the opposite side of the M-slice mirror.
const MIRROR_SWAP: Record<string, string> = {
  R: "L",
  L: "R",
  r: "l",
  l: "r",
};

// Rotations that lie ON the mirror axis keep their direction: x -> x,
// x' -> x', x2 -> x2. Every other base flips direction under the mirror.
const MIRROR_NO_FLIP = new Set(["x"]);

// A single move token: base + optional 180° amount + optional prime.
interface MoveToken {
  base: string;
  amount: string;
  prime: boolean;
}

const MOVE_RE = /^([A-Za-z]w?|[xyz])([0-9]*)(['’]?)$/;

function parseMove(token: string): MoveToken | null {
  const m = MOVE_RE.exec(token);
  if (!m) return null;
  return { base: m[1], amount: m[2] ?? "", prime: (m[3] ?? "") !== "" };
}

function stringifyMove(t: MoveToken): string {
  // A 180° turn is its own inverse, so a prime on it is meaningless.
  const prime = t.amount === "2" ? false : t.prime;
  return `${t.base}${t.amount}${prime ? "'" : ""}`;
}

// Split an alg into top-level chunks: parenthesised groups stay intact so
// things like `(U)` or `(R U R')` are treated as a single unit.
function splitChunks(alg: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < alg.length) {
    const ch = alg[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "(") {
      const end = alg.indexOf(")", i);
      if (end === -1) {
        chunks.push(alg.slice(i));
        break;
      }
      chunks.push(alg.slice(i, end + 1));
      i = end + 1;
    } else {
      let j = i;
      while (j < alg.length && !/\s/.test(alg[j]) && alg[j] !== "(") j++;
      chunks.push(alg.slice(i, j));
      i = j;
    }
  }
  return chunks;
}

function transformChunk(chunk: string, mirror: boolean, reverse: boolean): string {
  if (chunk.startsWith("(") && chunk.endsWith(")")) {
    const inner = chunk.slice(1, -1);
    return `(${transformChunks(inner, mirror, reverse)})`;
  }
  const move = parseMove(chunk);
  if (!move) return chunk;

  if (mirror) {
    const base = move.base;
    move.base = MIRROR_SWAP[base] ?? base;
    // x spins about the mirror axis, so it keeps its direction; every other
    // move flips (U/D/F/B, and L/R after the base swap).
    if (!MIRROR_NO_FLIP.has(base)) {
      move.prime = !move.prime;
    }
  }
  if (reverse) {
    move.prime = !move.prime;
  }
  return stringifyMove(move);
}

function transformChunks(alg: string, mirror: boolean, reverse: boolean): string {
  let chunks = splitChunks(alg);
  if (reverse) chunks = chunks.reverse();
  return chunks.map((c) => transformChunk(c, mirror, reverse)).join(" ");
}

export function applyAlgTransforms(
  alg: string,
  opts: { reverse?: boolean; mirror?: boolean }
): string {
  const { reverse = false, mirror = false } = opts;
  // No-op when idle: return the original string untouched so spacing/notation
  // is byte-identical to the source data.
  if (!reverse && !mirror) return alg;
  return transformChunks(alg, mirror, reverse);
}