"use client";

import { useMemo, useState } from "react";
import MenuIcon from "@/components/MenuIcon";

const TAGS = ["2x2 EG-1", "CLL", "PLL", "OLL"] as const;

const MOCK_RESULTS = [
  {
    id: "eg1-right-bar",
    name: "EG-1 — Right Bar",
    formula: "R U R' U' R' F R F'",
    tags: ["2x2", "EG-1"],
  },
  {
    id: "eg1-left-bar",
    name: "EG-1 — Left Bar",
    formula: "F R' F' R U R U' R'",
    tags: ["2x2", "EG-1"],
  },
  {
    id: "cll-h",
    name: "CLL — H Case",
    formula: "R U R' U R U' R' U R U2 R'",
    tags: ["2x2", "CLL"],
  },
  {
    id: "cll-sune",
    name: "CLL — Sune",
    formula: "R U R' U R U2 R'",
    tags: ["2x2", "CLL"],
  },
  {
    id: "pll-t",
    name: "PLL — T Perm",
    formula: "R U R' U' R' F R2 U' R' U' R U R' F'",
    tags: ["3x3", "PLL"],
  },
  {
    id: "pll-ua",
    name: "PLL — Ua Perm",
    formula: "R U' R U R U R U' R' U' R2",
    tags: ["3x3", "PLL"],
  },
  {
    id: "oll-27",
    name: "OLL — 27",
    formula: "R U R' U R U2 R'",
    tags: ["3x3", "OLL"],
  },
  {
    id: "oll-21",
    name: "OLL — 21",
    formula: "R U2 R' U' R U R' U' R U' R'",
    tags: ["3x3", "OLL"],
  },
];

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0 text-[#999]"
      aria-hidden
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12.5 12.5L16 16"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchHome() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return MOCK_RESULTS.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.formula.toLowerCase().includes(trimmed) ||
        item.tags.some((tag) => tag.toLowerCase().includes(trimmed))
    );
  }, [query]);

  const showResults = query.trim().length > 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F9F9F9] font-[family-name:var(--font-geist-sans)] text-[#333]">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-[0.65rem] font-normal uppercase tracking-[0.35em] text-[#444] sm:text-xs">
          Cube in One
        </span>
        <MenuIcon />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 sm:px-10">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl font-extralight uppercase tracking-[0.35em] sm:text-4xl">
            Cube in One
          </h1>
          <p className="mt-5 text-xs font-normal tracking-[0.2em] text-[#666] sm:text-sm">
Fewer Clicks, More Practice
          </p>

          <div className="relative mt-12">
            <div className="flex items-center gap-3 rounded-full border border-[#E8E2D9] bg-white/80 px-5 py-3.5 shadow-[0_2px_16px_rgba(51,51,51,0.06)] backdrop-blur-sm transition-shadow focus-within:border-[#C5D4BC]/80 focus-within:shadow-[0_4px_24px_rgba(51,51,51,0.08)] sm:px-6 sm:py-4">
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search algorithms, cases (e.g. EG-1, CLL, PLL, OLL)..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#333] placeholder:text-[#AAA] focus:outline-none sm:text-[0.9rem]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 text-[#BBB] transition-colors hover:text-[#666]"
                >
                  <ClearIcon />
                </button>
              )}
            </div>

            {showResults && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-10 overflow-hidden rounded-2xl border border-[#E8E2D9] bg-white/95 shadow-[0_8px_32px_rgba(51,51,51,0.08)] backdrop-blur-md">
                {results.length > 0 ? (
                  <ul className="divide-y divide-[#F0EBE3]">
                    {results.map((item) => (
                      <li
                        key={item.id}
                        className="px-5 py-4 text-left transition-colors hover:bg-[#F9F9F9]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium tracking-wide text-[#333]">
                            {item.name}
                          </p>
                          <div className="flex shrink-0 gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[#F0EBE3] px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-[#888]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-xs tracking-wide text-[#777]">
                          {item.formula}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-6 text-sm text-[#999]">
                    No matching cases found.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full border border-[#E8E2D9] bg-white/60 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-[#666] transition-all hover:border-[#C5D4BC] hover:bg-[#F0EBE3]/50 hover:text-[#444]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
