"use client";

import { useState, useEffect, useCallback } from "react";

// Sun icon for light mode (click to switch to dark)
function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

// Moon icon for dark mode (click to switch to light)
function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Prevent hydration mismatch — render a stable placeholder until mounted
  if (!mounted) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E2D9] bg-white/80 backdrop-blur-sm">
        <div className="h-4 w-4" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E2D9] bg-white/80 text-neutral-500 backdrop-blur-sm transition-all hover:border-neutral-400 hover:text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/30 dark:hover:text-neutral-200"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
