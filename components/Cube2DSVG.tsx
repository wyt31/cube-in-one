"use client";

// Cube2DSVG.tsx
//
// Self-contained, pure-vector 2D Rubik's cube sticker renderer.
// - 2x2 and 3x3 support (driven by `dimension`).
// - Strictly flat: no 3D perspective distortion, only <svg> + <rect>.
// - U face in the center, 4 extremely thin side bars hugging its edges
//   (top=B / right=R / bottom=F / left=L).
// - Stickers get subtle rounded corners, uniform gaps and a hairline dark
//   border. Ignored / un-highlighted stickers render as a dim dark gray
//   (#333333) so the same component can power CLL/EG/OLL/F2L masks later.
//
// cubing.js is never imported here — rendering is 100% in-house vector work.

import { useEffect, useState } from "react";
import {
  getCubeStateFromScramble,
  type CubeDimension,
  type CubeState,
  type ResolverOptions,
} from "@/components/cubeStateResolver";

export interface Cube2DSVGProps {
  /** Puzzle order: 2 or 3 (default 2). */
  dimension?: CubeDimension;
  /** U face sticker colors (4 for 2x2, 9 for 3x3). */
  top: string[];
  /** Side bar colors: top(B)/right(R)/bottom(F)/left(L).
   *  8 entries for 2x2, 12 for 3x3. */
  sides: string[];
  /** Display width (e.g. "120px" or "100%"). Defaults to "100%". */
  width?: string | number;
  /** Hex color used for null / missing stickers. */
  ignoredColor?: string;
}

const STICKER = 1; // unit size of one sticker cell
const GAP = 0.06; // gap between adjacent stickers
const BAR_GAP = 0.06; // gap between U face and side bars
const BAR_THICKNESS = 0.34; // extremely thin side bars
const RX = 0.08; // subtle rounded corner
const BAR_RX = 0.05; // slightly tighter corner for thin bars
const STROKE = "#1a1a1a";
const STROKE_WIDTH = 0.028;
const DEFAULT_IGNORED = "#333333";

interface RectSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  color: string;
  key: string;
}

function buildLayout(dimension: CubeDimension, top: string[], sides: string[], ignoredColor: string): RectSpec[] {
  const n = dimension;
  const u0 = BAR_THICKNESS + BAR_GAP; // top-left of U face grid
  const cellStride = STICKER + GAP;
  const rects: RectSpec[] = [];

  const safe = (arr: string[], i: number): string => (arr[i] ?? ignoredColor);

  // U face: left -> right, top -> bottom.
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const idx = r * n + c;
      rects.push({
        x: u0 + c * cellStride,
        y: u0 + r * cellStride,
        w: STICKER,
        h: STICKER,
        rx: RX,
        color: safe(top, idx),
        key: `u-${idx}`,
      });
    }
  }

  // Side bar helper.
  const barStickerSize = STICKER; // bars use the same cell stride as U
  const pushBar = (group: number, indexInBar: number, x: number, y: number, vertical: boolean) => {
    const sideIdx = group * n + indexInBar;
    rects.push({
      x,
      y,
      w: vertical ? BAR_THICKNESS : barStickerSize,
      h: vertical ? barStickerSize : BAR_THICKNESS,
      rx: BAR_RX,
      color: safe(sides, sideIdx),
      key: `s-${sideIdx}`,
    });
  };

  // Top bar (B) — horizontal, left -> right, sits above the U face.
  for (let i = 0; i < n; i++) {
    pushBar(0, i, u0 + i * cellStride, 0, false);
  }
  // Right bar (R) — vertical, top -> bottom, sits to the right of U.
  for (let i = 0; i < n; i++) {
    pushBar(1, i, u0 + n * STICKER + (n - 1) * GAP + BAR_GAP, u0 + i * cellStride, true);
  }
  // Bottom bar (F) — horizontal, left -> right, sits below the U face.
  for (let i = 0; i < n; i++) {
    pushBar(2, i, u0 + i * cellStride, u0 + n * STICKER + (n - 1) * GAP + BAR_GAP, false);
  }
  // Left bar (L) — vertical, top -> bottom, sits to the left of U.
  for (let i = 0; i < n; i++) {
    pushBar(3, i, 0, u0 + i * cellStride, true);
  }

  return rects;
}

export default function Cube2DSVG({
  dimension = 2,
  top,
  sides,
  width = "100%",
  ignoredColor = DEFAULT_IGNORED,
}: Cube2DSVGProps) {
  const n = dimension;
  const total =
    2 * BAR_THICKNESS +
    2 * BAR_GAP +
    n * STICKER +
    (n - 1) * GAP;

  const rects = buildLayout(dimension, top, sides, ignoredColor);

  return (
    <svg
      viewBox={`0 0 ${total.toFixed(4)} ${total.toFixed(4)}`}
      width={width}
      height={width}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${dimension}x${dimension} cube 2D sticker diagram`}
      style={{ display: "block" }}
    >
      {rects.map((r) => (
        <rect
          key={r.key}
          x={r.x.toFixed(4)}
          y={r.y.toFixed(4)}
          width={r.w.toFixed(4)}
          height={r.h.toFixed(4)}
          rx={r.rx}
          ry={r.rx}
          fill={r.color}
          stroke={STROKE}
          strokeWidth={STROKE_WIDTH}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Async wrapper: pass a Scramble string, auto-resolve via cubing.js, render.
// Keeps <Cube2DSVG> itself pure (top/sides only) while letting card views
// simply hand over a scramble. cubing.js is used purely as data backend.
// ---------------------------------------------------------------------------

export interface Cube2DScrambleViewProps {
  scramble: string;
  dimension: CubeDimension;
  options?: ResolverOptions;
  width?: string | number;
  ignoredColor?: string;
}

function emptyState(dimension: CubeDimension, ignoredColor: string): CubeState {
  const n = dimension;
  return {
    top: Array(n * n).fill(ignoredColor),
    sides: Array(4 * n).fill(ignoredColor),
  };
}

export function Cube2DScrambleView({
  scramble,
  dimension,
  options,
  width = "100%",
  ignoredColor = DEFAULT_IGNORED,
}: Cube2DScrambleViewProps) {
  const [state, setState] = useState<CubeState>(() =>
    emptyState(dimension, ignoredColor),
  );

  useEffect(() => {
    let active = true;
    getCubeStateFromScramble(scramble, dimension, options ?? {})
      .then((resolved) => {
        if (active) setState(resolved);
      })
      .catch(() => {
        if (active) setState(emptyState(dimension, ignoredColor));
      });
    return () => {
      active = false;
    };
  }, [scramble, dimension, options, ignoredColor]);

  return (
    <Cube2DSVG
      dimension={dimension}
      top={state.top}
      sides={state.sides}
      width={width}
      ignoredColor={ignoredColor}
    />
  );
}
