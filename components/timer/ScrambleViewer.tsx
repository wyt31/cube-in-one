"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { TimerEvent } from "@/lib/timer-types";

// ============================================================================
// Bottom-Right scramble viewer — always visible (no toggle).
// Renders a <twisty-player> with the current scramble applied so the user
// can preview the scrambled state.
//
// Default visualization is "2D" (standard unfolded net). A small 2D/3D
// toggle sits in the bottom-right corner of the preview card.
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

type VizMode = "2D" | "3D";

export default function ScrambleViewer({
  puzzle,
  scramble,
}: ScrambleViewerProps) {
  const [viz, setViz] = useState<VizMode>("2D");

  // Map our friendly TimerEvent to the puzzle id twisty-player accepts.
  // twisty-player uses puzzle IDs (not event IDs) — see cubing.js wcaEvents:
  //   minx  → puzzleID "megaminx"
  //   pyram → puzzleID "pyraminx"
  //   sq1   → puzzleID "square1"
  // NxN cubes happen to share the same name for both.
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
        return "megaminx";
      case "Pyraminx":
        return "pyraminx";
      case "Skewb":
        return "skewb";
      case "Square-1":
        return "square1";
      default:
        return "3x3x3";
    }
  }, [puzzle]);

  return (
    <div className="relative h-[165px] w-[165px] flex-shrink-0 overflow-hidden rounded-xl border border-[#E8E8E4] bg-white/70 p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:h-[175px] sm:w-[200px] md:h-[185px] md:w-[220px]">
      {scramble ? (
        <>
          {/* twisty-player height reduced by ~18px to leave room for the
              2D/3D toggle at the bottom — prevents the unfolded net (2D)
              or 3D model from being occluded by the toggle pill. */}
          <twisty-player
            puzzle={puzzleId}
            alg={scramble}
            visualization={viz}
            background="none"
            control-panel="none"
            style={
              {
                width: "100%",
                height: "calc(100% - 18px)",
                ["--twisty-player-particle-count" as string]: "0",
              } as CSSProperties
            }
          />
          {/* 2D / 3D toggle — bottom-right corner of the preview card */}
          <div className="absolute bottom-1.5 right-1.5 z-10 flex items-center gap-0.5 rounded-full border border-black/[0.08] bg-white/90 p-0.5 shadow-sm backdrop-blur-sm">
            {(["2D", "3D"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViz(mode)}
                aria-pressed={viz === mode}
                aria-label={`Switch to ${mode} visualization`}
                className={`flex h-5 w-7 items-center justify-center rounded-full text-[0.55rem] font-bold tracking-wide transition-all ${
                  viz === mode
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-800"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-center text-[0.55rem] uppercase tracking-[0.15em] text-neutral-300">
          No scramble
        </div>
      )}
    </div>
  );
}
