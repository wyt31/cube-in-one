// lib/solver222.ts

type CornerState = {
  cp: number[];
  co: number[];
};

type Move = {
  face: "U" | "R" | "F";
  power: 1 | 2 | 3;
  cp: number[];
  co: number[];
};

const MAX_DEPTH = 11;
const TIMEOUT_MS = 300;

const FACES = ["U", "R", "F"] as const;

// Corner order:
// 0 URF
// 1 UFL
// 2 ULB
// 3 UBR
// 4 DFR
// 5 DLF
// 6 DBL
// 7 DRB

const BASE_MOVES: Record<(typeof FACES)[number], Move> = {
  U: {
    face: "U",
    power: 1,
    cp: [3, 0, 1, 2, 4, 5, 6, 7],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  R: {
    face: "R",
    power: 1,
    cp: [4, 1, 2, 0, 7, 5, 6, 3],
    co: [2, 0, 0, 1, 1, 0, 0, 2],
  },
  F: {
    face: "F",
    power: 1,
    cp: [1, 5, 2, 3, 0, 4, 6, 7],
    co: [1, 2, 0, 0, 2, 1, 0, 0],
  },
};

function solvedState(): CornerState {
  return {
    cp: [0, 1, 2, 3, 4, 5, 6, 7],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
  };
}

function applyMove(state: CornerState, move: Move): void {
  const oldCp = state.cp.slice();
  const oldCo = state.co.slice();

  for (let i = 0; i < 8; i++) {
    state.cp[i] = oldCp[move.cp[i]];
    state.co[i] = (oldCo[move.cp[i]] + move.co[i]) % 3;
  }
}

function makePowerMove(base: Move, power: 1 | 2 | 3): Move {
  const state = solvedState();

  for (let i = 0; i < power; i++) {
    applyMove(state, base);
  }

  return {
    face: base.face,
    power,
    cp: state.cp,
    co: state.co,
  };
}

const MOVES: Move[] = FACES.flatMap((face) => {
  const base = BASE_MOVES[face];
  return [
    makePowerMove(base, 1),
    makePowerMove(base, 2),
    makePowerMove(base, 3),
  ];
});

const MOVE_NAMES = MOVES.map((m) => {
  if (m.power === 1) return m.face;
  if (m.power === 2) return `${m.face}2`;
  return `${m.face}'`;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const INVERSE_MOVE_INDEX = MOVES.map((m) => {
  const inversePower = m.power === 1 ? 3 : m.power === 3 ? 1 : 2;
  return FACES.indexOf(m.face) * 3 + (inversePower - 1);
});

function permRank(p: number[]): number {
  let rank = 0;

  for (let i = 0; i < 8; i++) {
    let smaller = 0;
    for (let j = i + 1; j < 8; j++) {
      if (p[j] < p[i]) smaller++;
    }

    rank += smaller * FACTORIAL[7 - i];
  }

  return rank;
}

function permUnrank(rank: number): number[] {
  const available = [0, 1, 2, 3, 4, 5, 6, 7];
  const result = new Array<number>(8);

  for (let i = 0; i < 8; i++) {
    const f = FACTORIAL[7 - i];
    const index = Math.floor(rank / f);
    rank %= f;
    result[i] = available.splice(index, 1)[0];
  }

  return result;
}

const FACTORIAL = [
  1,      // 0!
  1,      // 1!
  2,      // 2!
  6,      // 3!
  24,     // 4!
  120,    // 5!
  720,    // 6!
  5040,   // 7!
  40320,  // 8!
];

function oriRank(co: number[]): number {
  let rank = 0;

  for (let i = 0; i < 7; i++) {
    rank = rank * 3 + co[i];
  }

  return rank;
}

function oriUnrank(rank: number): number[] {
  const co = new Array<number>(8);
  let sum = 0;

  for (let i = 6; i >= 0; i--) {
    co[i] = rank % 3;
    rank = Math.floor(rank / 3);
    sum += co[i];
  }

  co[7] = (3 - (sum % 3)) % 3;
  return co;
}

function applyMoveToArrays(
  cp: number[],
  co: number[],
  move: Move,
): { cp: number[]; co: number[] } {
  const nextCp = new Array<number>(8);
  const nextCo = new Array<number>(8);

  for (let i = 0; i < 8; i++) {
    nextCp[i] = cp[move.cp[i]];
    nextCo[i] = (co[move.cp[i]] + move.co[i]) % 3;
  }

  return { cp: nextCp, co: nextCo };
}

/**
 * Exact distance tables for the permutation and orientation projections.
 * They are admissible IDDFS lower bounds.
 */
const PERM_DISTANCE = new Int8Array(40320);
const ORI_DISTANCE = new Int8Array(2187);

function buildPermutationDistance(): void {
  PERM_DISTANCE.fill(-1);

  const queue = new Int32Array(40320);
  let head = 0;
  let tail = 0;

  PERM_DISTANCE[0] = 0;
  queue[tail++] = 0;

  while (head < tail) {
    const rank = queue[head++];
    const depth = PERM_DISTANCE[rank];
    const cp = permUnrank(rank);

    for (const move of MOVES) {
      const next = new Array<number>(8);

      for (let i = 0; i < 8; i++) {
        next[i] = cp[move.cp[i]];
      }

      const nextRank = permRank(next);

      if (PERM_DISTANCE[nextRank] === -1) {
        PERM_DISTANCE[nextRank] = depth + 1;
        queue[tail++] = nextRank;
      }
    }
  }
}

function buildOrientationDistance(): void {
  ORI_DISTANCE.fill(-1);

  const queue = new Int16Array(2187);
  let head = 0;
  let tail = 0;

  ORI_DISTANCE[0] = 0;
  queue[tail++] = 0;

  while (head < tail) {
    const rank = queue[head++];
    const depth = ORI_DISTANCE[rank];
    const co = oriUnrank(rank);

    for (const move of MOVES) {
      const next = new Array<number>(8);

      for (let i = 0; i < 8; i++) {
        next[i] = (co[move.cp[i]] + move.co[i]) % 3;
      }

      const nextRank = oriRank(next);

      if (ORI_DISTANCE[nextRank] === -1) {
        ORI_DISTANCE[nextRank] = depth + 1;
        queue[tail++] = nextRank;
      }
    }
  }
}

buildPermutationDistance();
buildOrientationDistance();

function heuristic(state: CornerState): number {
  const p = PERM_DISTANCE[permRank(state.cp)];
  const o = ORI_DISTANCE[oriRank(state.co)];

  return Math.max(p, o);
}

function parseAlg(alg: string): string[] {
  const normalized = alg
    .replace(/[’′]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  return normalized.split(" ").map((token) => {
    if (!/^[URF](?:2|'|)?$/.test(token)) {
      throw new Error(
        `Unsupported 2x2 move "${token}". Supported moves: U U' U2 R R' R2 F F' F2`,
      );
    }

    return token;
  });
}

function moveIndex(token: string): number {
  const face = token[0] as (typeof FACES)[number];

  let power: 1 | 2 | 3;

  if (token.endsWith("2")) {
    power = 2;
  } else if (token.endsWith("'")) {
    power = 3;
  } else {
    power = 1;
  }

  return FACES.indexOf(face) * 3 + (power - 1);
}

/**
 * Invert a standard Singmaster algorithm.
 */
export function invertAlg(alg: string): string {
  const tokens = parseAlg(alg);

  return tokens
    .reverse()
    .map((token) => {
      if (token.endsWith("2")) return token;
      if (token.endsWith("'")) return token[0];
      return `${token}'`;
    })
    .join(" ");
}

function applyAlg(state: CornerState, alg: string[]): void {
  for (const token of alg) {
    applyMove(state, MOVES[moveIndex(token)]);
  }
}

function isSolved(state: CornerState): boolean {
  for (let i = 0; i < 8; i++) {
    if (state.cp[i] !== i || state.co[i] !== 0) {
      return false;
    }
  }

  return true;
}

/**
 * A very small hash for avoiding immediately repeated states.
 * Since the DFS already forbids consecutive moves on the same face,
 * this is only used for cheap duplicate suppression at shallow depths.
 */
function stateKey(state: CornerState): string {
  return state.cp.join("") + "/" + state.co.join("");
}

export function solve222(targetAlg: string): string {
  const target = parseAlg(targetAlg);

  if (target.length === 0) {
    return "";
  }

  const state = solvedState();
  applyAlg(state, target);

  if (isSolved(state)) {
    return "";
  }

  const deadline = Date.now() + TIMEOUT_MS;
  const path = new Int8Array(MAX_DEPTH);
  let timedOut = false;

  const search = (
    current: CornerState,
    remaining: number,
    lastFace: number,
    depth: number,
  ): boolean => {
    if ((depth & 7) === 0 && Date.now() >= deadline) {
      timedOut = true;
      return false;
    }

    const h = heuristic(current);

    if (h > remaining) {
      return false;
    }

    if (remaining === 0) {
      return isSolved(current);
    }

    const seen = new Set<string>();

    for (let i = 0; i < MOVES.length; i++) {
      const face = Math.floor(i / 3);

      if (face === lastFace) {
        continue;
      }

      const next = applyMoveToArrays(current.cp, current.co, MOVES[i]);
      const nextState: CornerState = {
        cp: next.cp,
        co: next.co,
      };

      const key = stateKey(nextState);

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);

      path[depth] = i;

      if (search(nextState, remaining - 1, face, depth + 1)) {
        return true;
      }

      if (timedOut) {
        return false;
      }
    }

    return false;
  };

  for (let depth = 0; depth <= MAX_DEPTH; depth++) {
    if (Date.now() >= deadline) {
      break;
    }

    if (search(state, depth, -1, 0)) {
      const solution: string[] = [];

      for (let i = 0; i < depth; i++) {
        solution.push(MOVE_NAMES[path[i]]);
      }

      return solution.join(" ");
    }

    if (timedOut) {
      break;
    }
  }

  // Guaranteed fallback: the inverse of the target algorithm solves it,
  // even if IDDFS timed out or the state is outside the restricted search depth.
  throw new Error("2x2 solver timed out or failed to find a solution within 11 moves",);
}

function randomAuf(): string {
  const auf = ["", "U", "U2", "U'"];
  return auf[Math.floor(Math.random() * auf.length)];
}

/**
 * Generate a case setup:
 *
 *   Pre-AUF + inverse(baseAlg) + Post-AUF
 *          -> Target State
 *          -> solve222(Target)
 *          -> inverse(solution)
 *          -> Setup
 */
export async function generateCaseSetup(baseAlg: string): Promise<string> {
  console.log(
  "generateCaseSetup called:",
  baseAlg,
  Date.now()
);
  const preAuf = randomAuf();
  const postAuf = randomAuf();

  const targetAlg = [
    preAuf,
    invertAlg(baseAlg),
    postAuf,
  ]
    .filter(Boolean)
    .join(" ");

  const solution = solve222(targetAlg);

  return invertAlg(solution);
}