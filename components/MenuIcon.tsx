"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CARDS = [
  { label: "Timer", color: "#A3B18A", href: "/timer" },
  { label: "About", color: "#8E9AAF", href: "/about" },
  { label: "Algs", color: "#CB997E", href: "/algs" },
  { label: "Settings", color: "#DDBEA9", href: "/settings" },
] as const;

export default function MenuIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative z-50">
      <div
        role="button"
        tabIndex={0}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((open) => !open);
          }
        }}
        className={`group grid cursor-pointer grid-cols-2 grid-rows-2 outline-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? "h-44 w-44 gap-2.5"
            : "h-7 w-7 gap-[2px] hover:opacity-80 hover:scale-105"
        }`}
        style={{
          transform: isOpen
            ? "rotate(90deg) scale(1.05)"
            : "rotate(0deg) scale(1)",
        }}
      >
        {CARDS.map((card, index) => (
          <div
            key={card.label}
            className={`flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? "rounded-2xl border border-[#EBE7E0] bg-white/90 opacity-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] backdrop-blur-md"
                : "rounded-[3px] opacity-100"
            }`}
            style={{
              backgroundColor: isOpen ? "#FFFFFF" : card.color,
              transform: isOpen ? "rotate(-90deg)" : "rotate(0deg)",
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
          >
            <span
              className={`text-[0.65rem] font-medium tracking-[0.15em] text-[#555555] transition-all duration-500 ${
                isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 50 + 200}ms` : "0ms",
              }}
            >
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {isOpen && (
        <nav
          className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2.5"
          style={{ transform: "rotate(90deg) scale(1.05)" }}
          aria-label="Quick menu"
        >
          {CARDS.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="pointer-events-auto rounded-2xl transition-colors hover:bg-black/[0.02]"
              aria-label={card.label}
              onClick={(event) => event.stopPropagation()}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
