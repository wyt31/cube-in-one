"use client";

// cubeStateResolver.ts
//
// Pure logic wrapper around cubing.js (used only as a backend data engine).
// Resolves a Scramble/Alg string into the flat color arrays consumed by the
// self-contained <Cube2DSVG/> vector component (no external UI dependency).
//
// Layout convention (matches the standard WCA last-layer 2D diagram):
//   - U face in the center (3x3 for 3x3, 2x2 for 2x2)
//   - 4 extremely thin side bars hugging the 4 edges of the U face:
//       top bar    = B face top row (left -> right)
//       right bar  = R face top row (top -> bottom)
//       bottom bar = F face top row (left -> right)
//       left bar   = L face top row (top -> bottom)

export type CubeDimension = 2 | 3;

export interface CubeState {
  /** U face stickers, left->right, top->bottom (4 for 2x2, 9 for 3x3). */
  top: string[];
  /** Side bar stickers in order: top(B) / right(R) / bottom(F) / left(L).
   *  8 entries for 2x2 (2 per bar), 12 for 3x3 (3 per bar). */
  sides: string[];
}

export interface ResolverOptions {
  /** cubing.js stickering name (e.g. "OLL" | "PLL" | "CLL" | "F2L" | "full").
   *  When provided, stickers flagged dim/ignored by the mask are rendered as
   *  `ignoredColor` — supports future CLL/EG/OLL/F2L highlight modes. */
  stickering?: string;
  /** Hex color used for dimmed/ignored stickers. */
  ignoredColor?: string;
  /** Per-sticker color overrides for fixed highlight/mask patterns.
   *  Keys are indices into `top` / `sides` arrays. */
  colorOverrides?: {
    top?: Record<number, string>;
    sides?: Record<number, string>;
  };
}

// Standard WCA face -> hex mapping (white/yellow/red/orange/green/blue).
export const WCA_COLORS: Record<string, string> = {
  U: "#FFFFFF", // white
  D: "#FFD500", // yellow
  F: "#009B48", // green
  B: "#0046AD", // blue
  L: "#FF5800", // orange
  R: "#B71234", // red
};

const DEFAULT_IGNORED = "#333333";

// ---------------------------------------------------------------------------
// Piece -> facelet -> face mapping (derived from cubing.js kpuzzle SVG defs).
// For a corner, facelet index order is [U/D-face, side-face-1, side-face-2].
// ---------------------------------------------------------------------------

const CORNER_FACES: Record<number, [string, string, string]> = {
  0: ["U", "R", "F"], // URF
  1: ["U", "B", "R"], // UBR
  2: ["U", "L", "B"], // ULB
  3: ["U", "F", "L"], // ULF
  4: ["D", "F", "R"], // DFR
  5: ["D", "L", "F"], // DLF
  6: ["D", "B", "L"], // DBL
  7: ["D", "R", "B"], // DRB
};

const EDGE_FACES: Record<number, [string, string]> = {
  0: ["U", "F"],
  1: ["U", "R"],
  2: ["U", "B"],
  3: ["U", "L"],
  4: ["D", "F"],
  5: ["D", "R"],
  6: ["D", "B"],
  7: ["D", "L"],
  8: ["F", "R"],
  9: ["F", "L"],
  10: ["B", "R"],
  11: ["B", "L"],
};

const CENTER_FACES: Record<number, string> = {
  0: "U",
  1: "L",
  2: "F",
  3: "R",
  4: "B",
  5: "D",
};

const CORNER_ORIENTATIONS = 3;
const EDGE_ORIENTATIONS = 2;

interface StickerRef {
  orbit: "CORNERS" | "EDGES" | "CENTERS";
  pos: number;
  face: number;
}

// 3x3 sticker layout: U face (9) + 4 side bars (12).
const LAYOUT_3X3: { top: StickerRef[]; sides: StickerRef[] } = {
  top: [
    { orbit: "CORNERS", pos: 2, face: 0 },
    { orbit: "EDGES", pos: 2, face: 0 },
    { orbit: "CORNERS", pos: 1, face: 0 },
    { orbit: "EDGES", pos: 3, face: 0 },
    { orbit: "CENTERS", pos: 0, face: 0 },
    { orbit: "EDGES", pos: 1, face: 0 },
    { orbit: "CORNERS", pos: 3, face: 0 },
    { orbit: "EDGES", pos: 0, face: 0 },
    { orbit: "CORNERS", pos: 0, face: 0 },
  ],
  sides: [
    // Top bar (B) left -> right
    { orbit: "CORNERS", pos: 2, face: 2 },
    { orbit: "EDGES", pos: 2, face: 1 },
    { orbit: "CORNERS", pos: 1, face: 1 },
    // Right bar (R) top -> bottom
    { orbit: "CORNERS", pos: 1, face: 2 },
    { orbit: "EDGES", pos: 1, face: 1 },
    { orbit: "CORNERS", pos: 0, face: 1 },
    // Bottom bar (F) left -> right
    { orbit: "CORNERS", pos: 3, face: 1 },
    { orbit: "EDGES", pos: 0, face: 1 },
    { orbit: "CORNERS", pos: 0, face: 2 },
    // Left bar (L) top -> bottom
    { orbit: "CORNERS", pos: 2, face: 1 },
    { orbit: "EDGES", pos: 3, face: 1 },
    { orbit: "CORNERS", pos: 3, face: 2 },
  ],
};

// 2x2 sticker layout: U face (4) + 4 side bars (8).
const LAYOUT_2X2: { top: StickerRef[]; sides: StickerRef[] } = {
  top: [
    { orbit: "CORNERS", pos: 2, face: 0 },
    { orbit: "CORNERS", pos: 1, face: 0 },
    { orbit: "CORNERS", pos: 3, face: 0 },
    { orbit: "CORNERS", pos: 0, face: 0 },
  ],
  sides: [
    // Top bar (B)
    { orbit: "CORNERS", pos: 2, face: 2 },
    { orbit: "CORNERS", pos: 1, face: 1 },
    // Right bar (R)
    { orbit: "CORNERS", pos: 1, face: 2 },
    { orbit: "CORNERS", pos: 0, face: 1 },
    // Bottom bar (F)
    { orbit: "CORNERS", pos: 3, face: 1 },
    { orbit: "CORNERS", pos: 0, face: 2 },
    // Left bar (L)
    { orbit: "CORNERS", pos: 2, face: 1 },
    { orbit: "CORNERS", pos: 3, face: 2 },
  ],
};

// Facelet stickering masks that should still display the real color.
const VISIBLE_MASKS = new Set([
  "regular",
  "oriented",
  "experimentalOriented2",
]);

// A single facelet mask entry: either a bare mesh mask string, or an object
// describing primary + hint masks (cubing.js StickeringMask variants).
type FaceletMaskValue = string | { mask?: string; hintMask?: string };

function isFaceletDimmed(mask: FaceletMaskValue | undefined): boolean {
  if (mask == null) return false;
  const value: string = typeof mask === "string" ? mask : mask.mask ?? "";
  return !VISIBLE_MASKS.has(value);
}

function faceOf(orbit: StickerRef["orbit"], piece: number, facelet: number): string {
  if (orbit === "CORNERS") return CORNER_FACES[piece][facelet];
  if (orbit === "EDGES") return EDGE_FACES[piece][facelet];
  return CENTER_FACES[piece];
}

function numOrientationsFor(orbit: StickerRef["orbit"]): number {
  if (orbit === "CORNERS") return CORNER_ORIENTATIONS;
  if (orbit === "EDGES") return EDGE_ORIENTATIONS;
  return 1; // centers: rotation does not change the single face color
}

interface PatternLike {
  patternData: Record<
    string,
    { pieces: number[]; orientation: number[] }
  >;
}

interface StickeringMaskLike {
  orbits?: Record<
    string,
    { pieces?: Array<{ facelets?: FaceletMaskValue[] } | null> }
  >;
}

function readSticker(
  pattern: PatternLike,
  ref: StickerRef,
  ignoredColor: string,
  mask?: StickeringMaskLike | null,
): string {
  // Apply stickering mask first (mask is position-based, not piece-based).
  if (mask) {
    const orbitMask = mask.orbits?.[ref.orbit];
    const pieceMask = orbitMask?.pieces?.[ref.pos];
    const faceletMask = pieceMask?.facelets?.[ref.face];
    if (faceletMask !== undefined && isFaceletDimmed(faceletMask)) {
      return ignoredColor;
    }
  }

  const orbitData = pattern.patternData[ref.orbit];
  if (!orbitData) return ignoredColor;

  const piece = orbitData.pieces[ref.pos];
  const orientation = orbitData.orientation[ref.pos] ?? 0;
  const numOri = numOrientationsFor(ref.orbit);

  // The facelet physically sitting at (pos, face) shows the piece's facelet
  // at index (face - orientation) mod numOrientations.
  const sourceFacelet =
    ((ref.face - orientation) % numOri + numOri) % numOri;
  const face = faceOf(ref.orbit, piece, sourceFacelet);
  return WCA_COLORS[face] ?? ignoredColor;
}

/**
 * Resolve a Scramble/Alg string into flat top + side color arrays for
 * <Cube2DSVG/>. cubing.js is used purely as an in-memory computation engine.
 */
export async function getCubeStateFromScramble(
  scramble: string,
  dimension: CubeDimension,
  options: ResolverOptions = {},
): Promise<CubeState> {
  const ignoredColor = options.ignoredColor ?? DEFAULT_IGNORED;
  const layout = dimension === 2 ? LAYOUT_2X2 : LAYOUT_3X3;

  // Dynamically import cubing.js (client-side, avoids SSR cost).
  const puzzles = await import("cubing/puzzles");
  const loader = dimension === 2 ? puzzles.cube2x2x2 : puzzles.cube3x3x3;
  const kpuzzle = await loader.kpuzzle();
  const defaultPattern = kpuzzle.defaultPattern();
  let pattern: PatternLike;
  try {
    pattern = defaultPattern.applyAlg(scramble || "") as PatternLike;
  } catch {
    // Invalid/unsupported alg string -> fall back to a solved cube so the
    // card still renders instead of crashing the whole page.
    pattern = defaultPattern as PatternLike;
  }

  let mask: StickeringMaskLike | null = null;
  const stickeringMaskFn = loader.stickeringMask;
  if (options.stickering && options.stickering !== "full" && stickeringMaskFn) {
    try {
      mask = (await stickeringMaskFn(options.stickering)) as StickeringMaskLike;
    } catch {
      mask = null;
    }
  }

  const top = layout.top.map((ref) =>
    readSticker(pattern, ref, ignoredColor, mask),
  );
  const sides = layout.sides.map((ref) =>
    readSticker(pattern, ref, ignoredColor, mask),
  );

  // Apply caller-provided fixed color overrides (CLL/EG/OLL/F2L highlight).
  if (options.colorOverrides) {
    const { top: topOv, sides: sidesOv } = options.colorOverrides;
    if (topOv) for (const k of Object.keys(topOv)) top[+k] = topOv[+k];
    if (sidesOv) for (const k of Object.keys(sidesOv)) sides[+k] = sidesOv[+k];
  }

  return { top, sides };
}
