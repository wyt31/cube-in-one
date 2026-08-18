"use client";

import { useEffect, type CSSProperties } from "react";

interface CubeImageProps {
  puzzle?: string;
  alg?: string;
  setup?: string;
  viewMode?: "2D" | "3D";
  stickering?: string;
  className?: string;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "twisty-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        puzzle?: string;
        alg?: string;
        setup?: string;
        visualization?: string;
        "experimental-stickering"?: string;
        background?: string;
        "control-panel"?: string;
        style?: CSSProperties;
      };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export default function CubeImage({
  puzzle = "3x3x3",
  alg = "",
  setup = "",
  viewMode = "3D",
  stickering,
  className = "",
}: CubeImageProps) {
  useEffect(() => {
    // Register cubing/twisty custom element at runtime, client-side only.
    import("cubing/twisty");
  }, []);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <twisty-player
        puzzle={puzzle === "2x2" ? "2x2x2" : "3x3x3"}
        alg={alg}
        setup={setup}
        visualization={viewMode === "2D" ? "experimental-2D-LL" : "3D"}
        experimental-stickering={stickering}
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
    </div>
  );
}
