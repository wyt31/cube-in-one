"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { getPuzzle, type PuzzleId } from "@/lib/timer-types";

// ============================================================================
// Bottom-Right scramble viewer — always visible (no toggle).
// Renders a <twisty-player> with the current scramble applied so the user
// can preview the scrambled state.
//
// Layout: fixed compact size (120×90) sitting in the bottom-right corner of
// the timer page, stacked under the History Flow.
//
// cubing/twisty is a heavy client-only module; we register the custom
// element inside a useEffect and gate the actual <twisty-player> render on
// a `mounted` flag so the SSR pass never emits the element.
//
// The <twisty-player> JSX intrinsic element is declared globally in
// components/CubeImage.tsx.
// ============================================================================

export interface ScrambleViewerProps {
  puzzle: PuzzleId;
  scramble: string;
}

export default function ScrambleViewer({ puzzle, scramble }: ScrambleViewerProps) {
  const [mounted, setMounted] = useState(false);

  // Register the custom element client-side only. The dynamic import is
  // invoked from inside an effect so it never runs during SSR.
  useEffect(() => {
    let cancelled = false;
    import("cubing/twisty")
      .then(() => {
        if (!cancelled) setMounted(true);
      })
      .catch((e) => console.error("cubing/twisty load failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  const cubingEvent = getPuzzle(puzzle).cubingEvent;

  return (
    <div className="h-[90px] w-[120px] flex-shrink-0 overflow-hidden rounded-xl border border-[#E8E8E4] bg-white p-0.5">
      {mounted && scramble ? (
        <twisty-player
          puzzle={cubingEvent}
          alg={scramble}
          visualization="2D"
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
        <div className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.2em] text-[#BBB]">
          {scramble ? "Loading…" : "—"}
        </div>
      )}
    </div>
  );
}
