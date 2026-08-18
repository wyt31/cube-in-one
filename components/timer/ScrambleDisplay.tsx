"use client";

// ============================================================================
// Top-Center scramble banner.
// Shows the active scramble in large mono text and offers a refresh button.
// Async generation is delegated to the parent so this component stays dumb.
// ============================================================================

export interface ScrambleDisplayProps {
  scramble: string;
  loading: boolean;
  onRefresh: () => void;
}

export default function ScrambleDisplay({
  scramble,
  loading,
  onRefresh,
}: ScrambleDisplayProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 text-center">
      <div className="flex items-center gap-3">
        <span className="text-[0.55rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Scramble
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Generate new scramble"
          className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-white px-2.5 py-1 text-[0.55rem] font-medium uppercase tracking-[0.18em] text-[#888] transition-all hover:border-[#2C2C2C] hover:text-[#2C2C2C] disabled:opacity-40"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? "animate-spin" : ""}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
          {loading ? "..." : "New"}
        </button>
      </div>

      <p className="min-h-[2.4rem] font-[family-name:var(--font-geist-mono)] text-base leading-relaxed tracking-wide text-[#2C2C2C] sm:text-xl">
        {scramble || (loading ? "Generating…" : "—")}
      </p>
    </div>
  );
}
