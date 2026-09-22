"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MenuIcon from "@/components/MenuIcon";

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
        <span className="text-[0.8rem] font-normal uppercase tracking-[0.35em] text-[#444] sm:text-sm">
          Cube in One
        </span>
        <span className="hidden" aria-hidden>
          <MenuIcon />
        </span>
      </header>

      <main
        data-search-home
        className="search-home-main flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 transition-all duration-200 sm:px-10"
      >
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

          {/* Quick entry — 4 square cards (1:1) */}
          <div className="mt-8 grid w-full max-w-3xl grid-cols-4 gap-2 sm:gap-3">
            {/* Timer */}
            <Link
              href="/timer"
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-black/[0.04] bg-black/[0.015] transition-all duration-200 hover:border-black/10 hover:bg-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#555] transition-colors group-hover:text-[#333]" aria-hidden>
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5" />
                <path d="M9 2h6" />
                <path d="M12 5V2" />
              </svg>
              <div className="text-center">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#333]">
                  Timer
                </h3>
                <p className="mt-0.5 text-[0.55rem] text-[#BBB]">
                  Ready? GO!
                </p>
              </div>
            </Link>

            {/* Algs */}
            <Link
              href="/algs"
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-black/[0.04] bg-black/[0.015] transition-all duration-200 hover:border-black/10 hover:bg-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#555] transition-colors group-hover:text-[#333]" aria-hidden>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <div className="text-center">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#333]">
                  Algs
                </h3>
                <p className="mt-0.5 text-[0.55rem] text-[#BBB]">
                  EG, CFOP, and more...
                </p>
              </div>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-black/[0.04] bg-black/[0.015] transition-all duration-200 hover:border-black/10 hover:bg-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#555] transition-colors group-hover:text-[#333]" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="text-center">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#333]">
                  About
                </h3>
                <p className="mt-0.5 text-[0.55rem] text-[#BBB]">
                  Who, what & why
                </p>
              </div>
            </Link>

            {/* Tools — faded / coming soon */}
            <div
              className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 opacity-40 transition-all duration-300 hover:opacity-100 hover:border-black/20 hover:bg-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#999] transition-colors group-hover:text-[#666]" aria-hidden>
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5z" />
              </svg>
              <div className="text-center">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#999] transition-colors group-hover:text-[#666]">
                  Tools
                </h3>
                <p className="mt-0.5 text-[0.55rem] text-[#CCC] transition-colors group-hover:text-[#AAA]">
                  Coming soon... but when? Idk lol
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
