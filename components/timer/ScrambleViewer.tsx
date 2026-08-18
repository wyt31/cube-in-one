"use client";

import { useEffect, type CSSProperties } from "react";

// ============================================================================
// Bottom-Right scramble viewer — always visible (no toggle).
// Renders a <twisty-player> with the current scramble applied so the user
// can preview the scrambled state.
//
// The <twisty-player> JSX intrinsic element is declared globally in
// components/CubeImage.tsx.
// ============================================================================

export interface ScrambleViewerProps {
  puzzle: "2x2" | "3x3" | "4x4" | "5x5";
  scramble: string;
}

export default function ScrambleViewer({ puzzle, scramble }: ScrambleViewerProps) {
  // Register the custom element client-side only.
  useEffect(() => {
    import("cubing/twisty");
  }, []);

  const puzzleId =
    puzzle === "2x2"
      ? "2x2x2"
      : puzzle === "3x3"
      ? "3x3x3"
      : puzzle === "4x4"
      ? "4x4x4"
      : "5x5x5";

  return (
    <div className="h-40 w-40 overflow-hidden rounded-2xl border border-[#E8E8E4] bg-[#FBFBFA] p-1 sm:h-52 sm:w-52">
      {scramble ? (
        <twisty-player
          puzzle={puzzleId}
          alg={scramble}
          visualization="3D"
          background="none"
          control-panel="none"
          style={
            {
              width: "100%",
              height: "100%",
              ["--twisty-player-particle-count" as string]: "0",
            } as CSSProperties
          }
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[0.6rem] uppercase tracking-[0.2em] text-[#BBB]">
          No scramble
        </div>
      )}
    </div>
  );
}
