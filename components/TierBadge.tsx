"use client";

import type { Tier } from "@/data/algs";

// ==========================================================================
// TierBadge
//
// Renders a compact pill that ranks an algorithm by tier (S / A / B).
// Tier palette:
//   S — amber / gold, premium feel (subtle gradient + soft glow)
//   A — cool sky blue
//   B — neutral low-key zinc gray
// `dark:` variants keep the badge legible on dark backgrounds.
// ==========================================================================

const TIER_STYLES: Record<
  Tier,
  {
    wrapper: string;
    label: string;
    dot: string;
  }
> = {
  S: {
    wrapper:
      "bg-gradient-to-b from-amber-50 to-amber-100/70 text-amber-700 border-amber-200/80 " +
      "dark:from-amber-950 dark:to-amber-900/60 dark:text-amber-300 dark:border-amber-800/70 " +
      "shadow-[0_1px_2px_rgba(217,119,6,0.18)]",
    label: "S",
    dot: "bg-amber-400 dark:bg-amber-500",
  },
  A: {
    wrapper:
      "bg-sky-50 text-sky-700 border-sky-200 " +
      "dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800/70",
    label: "A",
    dot: "bg-sky-400 dark:bg-sky-500",
  },
  B: {
    wrapper:
      "bg-zinc-100 text-zinc-600 border-zinc-200 " +
      "dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    label: "B",
    dot: "bg-zinc-400 dark:bg-zinc-500",
  },
};

export interface TierBadgeProps {
  tier: Tier;
  /** Show the trailing "Tier" word; default true. */
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function TierBadge({
  tier,
  showLabel = true,
  size = "sm",
  className = "",
}: TierBadgeProps) {
  const style = TIER_STYLES[tier];
  const sizing =
    size === "sm"
      ? "px-2 py-0.5 text-[0.6rem] gap-1"
      : "px-2.5 py-1 text-[0.65rem] gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide ${style.wrapper} ${sizing} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
      {showLabel && (
        <span className="font-normal opacity-60">Tier</span>
      )}
    </span>
  );
}
