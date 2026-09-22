// ==========================================================================
// Aggregate algorithm dataset + category tree.
//
// Category structure (Tier 1 = `set`, Tier 2 = `group`):
//   2x2: PBL | CLL | EG1 | EG2 | LEG | TCLL [TCLL+, TCLL-] | LS [LS1..LS9]
//   3x3: F2L | OLL (57) | PLL (21)
// ==========================================================================

import { allTwoByTwoAlgs } from "./algs/2x2";
import type { TwoByTwoAlg, Tier, AlgItem } from "./algs/types";
import { tierWeight } from "./algs/types";
import { algData3x3 } from "./algs3x3";

export type CubeType = "2x2" | "3x3";
export type ViewMode = "2D" | "3D";

// A single formula variant carrying its tier. Consumed by the detail modal
// to render tier-ranked formula lists with TierBadge accents.
export interface AlgVariant {
  alg: string;
  tier: Tier;
  note?: string;
}

export interface AlgCase {
  id: string;
  name: string;
  cube: CubeType;
  set: string;       // Tier 1: "CLL", "EG1", "TCLL", "OLL", ...
  group: string;     // Tier 2: "Sune", "TCLL+", "LS1", "Cross", "T", ...
  setup: string;
  recommended: string;       // top-ranked alg (highest tier) — card preview
  recommendedTier?: Tier;    // tier of the recommended alg
  others?: string[];         // 3x3 legacy plain alt list (kept for 3x3 compat)
  altAlgs?: AlgVariant[];    // remaining candidate algs with tier (2x2)
  viewMode: ViewMode;
  stickering?: string;
  tags: string[];            // 3x3 legacy tag metadata (kept for 3x3 compat)
}

export type { Tier, AlgItem };

export const CUBES: CubeType[] = ["2x2", "3x3"];

// Category tree: sets in display order, with optional sub-groups that the
// page should expose as a Tier-2 filter row when present.
// When `groups` is `undefined` the page auto-derives from algData.group values
// and prepends "All" (old behaviour). Explicit ordering is provided for sets
// whose groups are semantic categories rather than free-form tags (TCLL, LS).
export interface CategorySpec {
  name: string;
  groups?: string[] | undefined;
}

export const CATEGORIES: Record<CubeType, CategorySpec[]> = {
  "2x2": [
    { name: "PBL"  },
    { name: "CLL"  },
    { name: "EG1"  },
    { name: "EG2"  },
    { name: "LEG1"  },
    { name: "TCLL", groups: ["TCLL+", "TCLL-"] },
    { name: "LS",   groups: ["LS1","LS2","LS3","LS4","LS5","LS6","LS7","LS8","LS9"] },
  ],
  "3x3": [
    { name: "F2L" },
    { name: "OLL" },
    { name: "PLL" },
  ],
};

// Rendering engine route rules:
//   2x2 PBL      -> twisty-player (3D, whole-cube permutation)
//   3x3 F2L      -> twisty-player (3D, F2L stickering mask)
//   everything   -> self-contained Cube2DSVG (flat 2D vector)
export const RENDER_WITH_TWISTY: ReadonlyArray<{ cube: CubeType; set: string }> = [
  { cube: "2x2", set: "PBL" },
  { cube: "3x3", set: "F2L" },
];

export function shouldRenderWithTwisty(cube: CubeType, set: string): boolean {
  return RENDER_WITH_TWISTY.some((r) => r.cube === cube && r.set === set);
}

// ---------------------------------------------------------------------------
// 2x2 data bridge: allTwoByTwoAlgs (TwoByTwoAlg[]) -> AlgCase[].
//
// The CSV files contain *solution* algorithms. To render the case visually
// (2D SVG + cubing.js, or twisty-player for PBL) we need a setup *scramble*
// that produces the case from a solved cube = the inverse of the solution.
// `invertCubeAlg` is a small syntactic inverter (reverse order + invert each
// move / group, expand exponents). Choice expressions like "(U/U')" are
// dropped (rare, only in a few H/Pi algs) — the rendered case is still valid.
// ---------------------------------------------------------------------------
function invertMove(m: string): string {
  const baseMatch = m.match(/^([RLUDFBxyzrludfb]w?)/);
  if (!baseMatch) return m;
  const base = baseMatch[1];
  const has2 = /2/.test(m);
  const hasPrime = /'/.test(m);
  if (has2 && hasPrime) return base + "2"; // R2' -> R2
  if (has2) return base + "2";            // R2  -> R2
  if (hasPrime) return base;              // R'  -> R
  return base + "'";                      // R   -> R'
}

function invertCubeAlg(input: string): string {
  if (!input) return "";
  const s = input.trim();
  const tokens: Array<{ t: "move" | "group"; text: string; exp?: number }> = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "\t") { i++; continue; }
    if (c === "(") {
      let depth = 1, j = i + 1;
      while (j < s.length && depth > 0) {
        if (s[j] === "(") depth++;
        else if (s[j] === ")") depth--;
        if (depth === 0) break;
        j++;
      }
      const inner = s.slice(i + 1, j);
      i = j + 1;
      let exp: number | undefined;
      const expMatch = s.slice(i).match(/^\d+/);
      if (expMatch) { exp = parseInt(expMatch[0], 10); i += expMatch[0].length; }
      // choice expressions ("(U/U')") are not real algs -> drop.
      if (inner.includes("/")) continue;
      tokens.push({ t: "group", text: inner, exp });
      continue;
    }
    const moveMatch = s.slice(i).match(/^([RLUDFBxyzrludfb])(w)?(2)?(')?/);
    if (moveMatch) {
      tokens.push({ t: "move", text: moveMatch[0] });
      i += moveMatch[0].length;
      continue;
    }
    i++; // skip unknown char
  }

  const out: string[] = [];
  for (let k = tokens.length - 1; k >= 0; k--) {
    const tok = tokens[k];
    if (tok.t === "move") {
      out.push(invertMove(tok.text));
    } else {
      const innerInv = invertCubeAlg(tok.text);
      if (tok.exp) {
        // expand the exponent to keep cubing.js happy (no "(...)N" syntax).
        for (let n = 0; n < tok.exp; n++) out.push(innerInv);
      } else {
        // AUF-style "(U2)" group -> emit the bare inverted move(s).
        out.push(innerInv);
      }
    }
  }
  return out.join(" ").trim();
}

function twoByTwoToAlgCase(a: TwoByTwoAlg): AlgCase {
  // Rank candidate algs within the case by tier weight (S > A > B).
  // Stable sort preserves original source order across equal tiers.
  const sortedAlgs: AlgItem[] = [...a.algs].sort(
    (x, y) => tierWeight[y.tier] - tierWeight[x.tier],
  );

  const top = sortedAlgs[0];
  const rest = sortedAlgs.slice(1);

  return {
    id: a.id,
    name: a.name,
    cube: "2x2",
    set: a.category,
    group: a.subCategory ?? a.case ?? "—",
    setup: invertCubeAlg(top.alg),
    recommended: top.alg,
    recommendedTier: top.tier,
    altAlgs: rest.map((item) => ({
      alg: item.alg,
      tier: item.tier,
      note: item.note,
    })),
    viewMode: a.category === "PBL" ? "3D" : "2D",
    tags: [],
  };
}

export const algData2x2: AlgCase[] = allTwoByTwoAlgs.map(twoByTwoToAlgCase);

export const algData: AlgCase[] = [...algData2x2, ...algData3x3];
