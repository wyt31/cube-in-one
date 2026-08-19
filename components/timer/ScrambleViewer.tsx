"use client";

import { useMemo, type CSSProperties } from "react";
import type { TimerEvent } from "@/lib/timer-types";

// ============================================================================
// Bottom-Right scramble viewer — always visible (no toggle).
// Renders a <twisty-player> with the current scramble applied so the user
// can preview the scrambled state.
//
// Sized as a compact fixed preview (120×90) so it sits snugly in the
// bottom-right corner without crowding the central Scramble banner.
//
// The <twisty-player> custom element is registered globally by the CDN
// <script> tag in app/layout.tsx (not via `import("cubing/twisty")`, which
// Next.js's webpack cannot bundle — see issue #323). The JSX intrinsic
// element type is declared in components/CubeImage.tsx.
// ============================================================================

export interface ScrambleViewerProps {
  puzzle: TimerEvent;
  scramble: string;
}

export default function ScrambleViewer({
  puzzle,
  scramble,
}: ScrambleViewerProps) {
  // Map our friendly TimerEvent to the puzzle id twisty-player expects.
  // twisty-player uses the same puzzle id as cubing.js events for NxN cubes
  // ("3x3x3", "4x4x4", ...) and the WCA event id for the rest.
  const puzzleId = useMemo(() => {
    switch (puzzle) {
      case "2x2x2":
      case "3x3x3":
      case "4x4x4":
      case "5x5x5":
      case "6x6x6":
      case "7x7x7":
        return puzzle; // twisty-player accepts "3x3x3" etc.
      case "3x3x3 OH":
      case "3x3x3 BF":
        return "3x3x3";
      case "Clock":
        return "clock";
      case "Megaminx":
        return "minigsm";
      case "Pyraminx":
        return "pyram";
      case "Skewb":
        return "skewb";
      case "Square-1":
        return "sq1";
      default:
        return "3x3x3";
    }
  }, [puzzle]);

  return (
    <div className="h-[90px] w-[120px] flex-shrink-0 overflow-hidden rounded-xl border border-[#E8E8E4] bg-white/70 p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm">
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
        <div className="flex h-full w-full items-center justify-center text-center text-[0.55rem] uppercase tracking-[0.15em] text-[#BBB]">
          No scramble
        </div>
      )}
    </div>
  );
}
