"use client";

import {
  shouldRenderWithTwisty,
  type AlgCase,
} from "@/data/algs";
import CubeImage from "@/components/CubeImage";
import { Cube2DScrambleView } from "@/components/Cube2DSVG";

export interface AlgCardCubeProps {
  alg: AlgCase;
  className?: string;
}

// Renders the cube view per the routing table:
//   2x2 PBL  -> twisty-player (3D, full cube)
//   3x3 F2L  -> twisty-player (3D, F2L mask)
//   default  -> self-contained 2D SVG (Cube2DSVG + resolver)
export default function AlgCardCube({ alg, className = "" }: AlgCardCubeProps) {
  const useTwisty = shouldRenderWithTwisty(alg.cube, alg.set);

  if (useTwisty) {
    return (
      <CubeImage
        puzzle={alg.cube}
        setup={alg.setup}
        viewMode={alg.viewMode}
        stickering={alg.stickering}
        className={className}
      />
    );
  }

  // Self-contained 2D vector rendering (cubing.js used only as resolver).
  // If the set exposes a stickering mask concept, forward it as the
  // cubing.js stickering name so ignored/dim stickers become #333333 gray.
  const stickering =
    alg.stickering === "OLL" ||
    alg.stickering === "PLL" ||
    alg.stickering === "CLL" ||
    alg.stickering === "F2L"
      ? alg.stickering
      : undefined;

  return (
    <div className={className}>
      <Cube2DScrambleView
        scramble={alg.setup}
        dimension={alg.cube === "2x2" ? 2 : 3}
        options={stickering ? { stickering } : undefined}
        width="100%"
      />
    </div>
  );
}
