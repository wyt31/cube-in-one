"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuIcon from "@/components/MenuIcon";
import ThemeToggle from "@/components/ThemeToggle";
import AlgCardCube from "@/components/AlgCardCube";
import { algData, type AlgCase } from "@/data/algs";

// Normalize: lowercase + strip all whitespace for fuzzy matching.
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

// Multi-field fuzzy search across the entire algorithm dataset.
// Matches: name, subGroup, set, group, recommended alg, altAlgs,
// altAlgs notes, others (3x3), and tags.
function searchAlgs(query: string, max = 5): AlgCase[] {
  const q = normalize(query);
  if (!q) return [];

  return algData
    .filter((alg) => {
      if (normalize(alg.name).includes(q)) return true;
      if (alg.subGroup && normalize(alg.subGroup).includes(q)) return true;
      if (normalize(alg.set).includes(q)) return true;
      if (normalize(alg.group).includes(q)) return true;
      if (normalize(alg.recommended).includes(q)) return true;
      if (alg.altAlgs?.some((a) => normalize(a.alg).includes(q))) return true;
      if (alg.altAlgs?.some((a) => a.note && normalize(a.note).includes(q)))
        return true;
      if (alg.others?.some((o) => normalize(o).includes(q))) return true;
      if (alg.tags?.some((t) => normalize(t).includes(q))) return true;
      return false;
    })
    .slice(0, max);
}

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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchAlgs(query), [query]);

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  const showDropdown = isDropdownOpen && query.trim().length > 0;

  const navigateToAlg = useCallback(
    (alg: AlgCase) => {
      const params = new URLSearchParams();
      params.set("cube", alg.cube);
      params.set("set", alg.set);
      if (alg.set === "TCLL" && alg.group) {
        params.set("group", alg.group);
      }
      router.push(`/algs?${params.toString()}`);
    },
    [router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[highlightedIndex] ?? results[0];
      if (target) navigateToAlg(target);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F9F9F9] font-[family-name:var(--font-geist-sans)] text-[#333] dark:bg-[#0A0B0D] dark:text-neutral-200">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="hidden" aria-hidden>
          <MenuIcon />
        </span>
        <ThemeToggle />
      </header>

      <main
        data-search-home
        className="search-home-main flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 transition-all duration-200 sm:px-10"
      >
        <div className="w-full max-w-xl text-center">
          <h1 className="text-4xl font-light uppercase tracking-[0.35em] sm:text-5xl dark:text-neutral-100">
            Cube in One
          </h1>

          <div ref={containerRef} className="relative mt-12">
            <div className="flex items-center gap-3 rounded-full border border-[#E8E2D9] bg-white/80 px-6 py-4 shadow-[0_2px_16px_rgba(51,51,51,0.06)] backdrop-blur-sm transition-shadow focus-within:border-[#C5D4BC]/80 focus-within:shadow-[0_4px_24px_rgba(51,51,51,0.08)] sm:px-7 sm:py-4.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] dark:focus-within:border-[#C5D4BC]/40">
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search algorithms, cases (e.g. EG-1, CLL, PLL, OLL)..."
                className="min-w-0 flex-1 bg-transparent text-base text-[#333] placeholder:text-[#AAA] focus:outline-none sm:text-[0.95rem] dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="shrink-0 text-[#BBB] transition-colors hover:text-[#666] dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                  <ClearIcon />
                </button>
              ) : (
                <kbd className="hidden shrink-0 rounded border border-[#E8E2D9] bg-[#F9F9F9] px-1.5 py-0.5 text-[0.6rem] font-medium text-[#AAA] sm:inline-block dark:border-white/10 dark:bg-white/5 dark:text-neutral-500">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Spotlight-style dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-[#E8E2D9] bg-white shadow-[0_8px_32px_rgba(51,51,51,0.10)] dark:border-white/5 dark:bg-[#1A1C1E]">
                {results.length > 0 ? (
                  <ul className="py-1.5">
                    {results.map((alg, i) => (
                      <li key={alg.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlightedIndex(i)}
                          onClick={() => navigateToAlg(alg)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                            i === highlightedIndex
                              ? "bg-[#F5F5F2] dark:bg-white/5"
                              : ""
                          }`}
                        >
                          {/* Cube thumbnail */}
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#F0F0EE] bg-[#FBFBFA] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-white/5">
                            <AlgCardCube
                              alg={alg}
                              className="h-full w-full"
                            />
                          </div>

                          {/* Case name + category */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold tracking-wide text-neutral-800 dark:text-neutral-200">
                              {alg.name}
                            </p>
                            <p className="truncate text-xs tracking-wide text-neutral-400">
                              {alg.cube} · {alg.set}
                              {alg.subGroup ? ` · ${alg.subGroup}` : ""}
                            </p>
                          </div>

                          {/* Inkan badge for TCLL */}
                          {alg.set === "TCLL" && (
                            <span
                              className={`flex-shrink-0 rounded-[3px] border px-2 py-0.5 text-[0.65rem] font-bold tracking-wider select-none ${
                                alg.group === "TCLL+"
                                  ? "border-[#4A6B5D] bg-[#4A6B5D]/8 text-[#4A6B5D]"
                                  : "border-[#A65B4C] bg-[#A65B4C]/8 text-[#A65B4C]"
                              }`}
                            >
                              {alg.group}
                            </span>
                          )}

                          {/* Formula preview */}
                          <code className="hidden flex-shrink-0 truncate font-[family-name:var(--font-geist-mono)] text-xs font-medium tracking-wide text-neutral-400 sm:block sm:max-w-[140px]">
                            {alg.recommended}
                          </code>
                        </button>
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
          <div className="mt-10 grid w-full max-w-3xl grid-cols-4 gap-2.5 sm:gap-3">
            {/* Timer */}
            <Link
              href="/timer"
              className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-black/[0.04] bg-black/[0.015] shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#555] transition-colors group-hover:text-[#333] dark:text-neutral-400 dark:group-hover:text-neutral-200" aria-hidden>
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5" />
                <path d="M9 2h6" />
                <path d="M12 5V2" />
              </svg>
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#333] dark:text-neutral-200">
                  Timer
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#BBB] dark:text-neutral-500">
                  Ready? GO!
                </p>
              </div>
            </Link>

            {/* Algs */}
            <Link
              href="/algs"
              className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-black/[0.04] bg-black/[0.015] shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#555] transition-colors group-hover:text-[#333] dark:text-neutral-400 dark:group-hover:text-neutral-200" aria-hidden>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#333] dark:text-neutral-200">
                  Algs
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#BBB] dark:text-neutral-500">
                  EG, CFOP, and more...
                </p>
              </div>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-black/[0.04] bg-black/[0.015] shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/15 dark:hover:bg-white/[0.05] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#555] transition-colors group-hover:text-[#333] dark:text-neutral-400 dark:group-hover:text-neutral-200" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#333] dark:text-neutral-200">
                  About
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#BBB] dark:text-neutral-500">
                  Who, what & why
                </p>
              </div>
            </Link>

            {/* Tools — faded / coming soon */}
            <div
              className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 opacity-40 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-100 hover:border-black/20 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[#999] transition-colors group-hover:text-[#666] dark:text-neutral-500 dark:group-hover:text-neutral-400" aria-hidden>
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5z" />
              </svg>
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#999] transition-colors group-hover:text-[#666] dark:text-neutral-500 dark:group-hover:text-neutral-400">
                  Tools
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#CCC] transition-colors group-hover:text-[#AAA] dark:text-neutral-600 dark:group-hover:text-neutral-500">
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
