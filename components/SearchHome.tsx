"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuIcon from "@/components/MenuIcon";
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
      className="shrink-0 text-[#F5F0E6]"
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
    <div className="relative flex min-h-screen flex-col bg-[#F5F0E6] font-[family-name:var(--font-geist-sans)] text-[#434343]">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="hidden" aria-hidden>
          <MenuIcon />
        </span>
      </header>

      <main
        data-search-home
        className="search-home-main flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 transition-all duration-200 sm:px-10"
      >
        <div className="w-full max-w-xl text-center">
          <h1 className="text-4xl font-light uppercase tracking-[0.35em] sm:text-5xl">
            Cube In One
          </h1>

          <div ref={containerRef} className="relative mt-12">
            <div className="flex items-center gap-3 rounded-full border border-[#5B7B4E] bg-[#5B7B4E] px-6 py-4 shadow-[0_2px_16px_rgba(51,51,51,0.06)] backdrop-blur-sm transition-shadow focus-within:border-[#c5c56a] focus-within:shadow-[0_4px_24px_rgba(51,51,51,0.08)] sm:px-7 sm:py-4.5">
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
                className="min-w-0 flex-1 bg-transparent text-base text-[#F5F0E6] placeholder:text-[#F5F0E6] focus:outline-none sm:text-[0.95rem]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="shrink-0 text-[#BBB] transition-colors hover:text-[#666]"
                >
                  <ClearIcon />
                </button>
              )}
            </div>

            {/* Spotlight-style dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-[#E8E2D9] bg-white shadow-[0_8px_32px_rgba(51,51,51,0.10)]">
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
                              ? "bg-[#F5F5F2]"
                              : ""
                          }`}
                        >
                          {/* Cube thumbnail */}
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#F0F0EE] bg-[#FBFBFA] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                            <AlgCardCube
                              alg={alg}
                              className="h-full w-full"
                            />
                          </div>

                          {/* Case name + category */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold tracking-wide text-neutral-800">
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

          {/* Quick entry — 3 rectangle cards */}
          <div className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-4">
            {/* Timer */}
            <Link
              href="/timer"
              className="group flex items-center gap-5 px-6 py-5 rounded-2xl border border-[#D3CCB8] bg-[#E6DFC8]/70 shadow-[0_8px_24px_rgba(180,160,140,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#2D5A3F] transition-colors group-hover:text-[#2D5A3F]" aria-hidden>
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5" />
                <path d="M9 2h6" />
                <path d="M12 5V2" />
              </svg>
              <div className="text-left">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#2D5A3F]">
                  Timer
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#2D5A3F]">
                  Ready? GO!
                </p>
              </div>
            </Link>

            {/* Algs */}
            <Link
              href="/algs"
              className="group flex items-center gap-5 px-6 py-5 rounded-2xl border border-[#D3CCB8] bg-[#E6DFC8]/70 shadow-[0_8px_24px_rgba(180,160,140,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#2D5A3F] transition-colors group-hover:text-[#2D5A3F]" aria-hidden>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <div className="text-left">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#2D5A3F]">
                  Algs
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#2D5A3F]">
                  EG, CFOP, etc.
                </p>
              </div>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className="group flex items-center gap-5 px-6 py-5 rounded-2xl border border-[#D3CCB8] bg-[#E6DFC8]/70 shadow-[0_8px_24px_rgba(180,160,140,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#2D5A3F] transition-colors group-hover:text-[#2D5A3F]" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="text-left">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#2D5A3F]">
                  About
                </h3>
                <p className="mt-1 text-[0.6rem] text-[#2D5A3F]">
                  Who, what & why
                </p>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}
