"use client";

import { useEffect, useRef, useState } from "react";
import {
  PUZZLES,
  getModes,
  isSpecializedMode,
  type ModeId,
  type ModeOption,
  type PuzzleId,
} from "@/lib/timer-types";

// ============================================================================
// Top Header for the timer page.
//
//   Centered capsule toolbar (no labels):
//     [ 3x3x3 ▾ ]  [ WCA ▾ ]  [ 🧩 Filter Cases (8/21) ▾ ]
//
//   The Filter Cases capsule only appears in specialized modes; when it
//   appears the puzzle/mode capsules naturally shift left because the
//   group is centered as a whole.
//
//   Right side: a minimal gear icon that opens the Settings drawer.
// ============================================================================

export interface TimerHeaderProps {
  puzzle: PuzzleId;
  onPuzzleChange: (p: PuzzleId) => void;
  mode: ModeId;
  onModeChange: (m: ModeId) => void;
  selectedCases: Set<number>;
  onToggleCase: (caseIndex: number) => void;
  onResetCases: () => void;
  onOpenSettings: () => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <polyline points="3 4.5 6 7.5 9 4.5" />
    </svg>
  );
}

function CapsuleDropdown({
  trigger,
  children,
  open,
  onToggle,
  onClose,
  align = "center",
  panelClassName = "",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  align?: "center" | "right";
  panelClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Defer attaching so the click that opened the dropdown doesn't close it.
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  const alignClass =
    align === "right"
      ? "left-0 top-full origin-top-left"
      : "left-1/2 top-full -translate-x-1/2";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-white px-3 py-1.5 text-[0.7rem] font-medium tracking-wide text-[#2C2C2C] transition-all hover:border-[#2C2C2C]"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-2 max-h-72 min-w-[10rem] overflow-y-auto rounded-2xl border border-[#E8E8E4] bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] ${alignClass} ${panelClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.7rem] tracking-wide transition-colors ${
        active
          ? "bg-[#2C2C2C] text-white"
          : "text-[#2C2C2C] hover:bg-[#2C2C2C]/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

export default function TimerHeader({
  puzzle,
  onPuzzleChange,
  mode,
  onModeChange,
  selectedCases,
  onToggleCase,
  onResetCases,
  onOpenSettings,
}: TimerHeaderProps) {
  const [openPuzzle, setOpenPuzzle] = useState(false);
  const [openMode, setOpenMode] = useState(false);
  const [openCases, setOpenCases] = useState(false);

  const modes: ModeOption[] = getModes(puzzle);
  const currentMode = modes.find((m) => m.id === mode) ?? modes[0];
  const currentPuzzle = PUZZLES.find((p) => p.id === puzzle) ?? PUZZLES[1];
  const showFilter = isSpecializedMode(mode) && currentMode.totalCases > 0;
  const total = currentMode.totalCases;

  // Only one dropdown open at a time. Clicking the same one toggles it closed.
  const openOne = (which: "puzzle" | "mode" | "cases") => {
    if (which === "puzzle") {
      setOpenPuzzle((v) => !v);
      setOpenMode(false);
      setOpenCases(false);
    } else if (which === "mode") {
      setOpenPuzzle(false);
      setOpenMode((v) => !v);
      setOpenCases(false);
    } else {
      setOpenPuzzle(false);
      setOpenMode(false);
      setOpenCases((v) => !v);
    }
  };

  return (
    <header className="relative flex w-full items-center justify-center py-4">
      <div className="flex items-center gap-2">
        {/* ---------- Puzzle capsule ---------- */}
        <CapsuleDropdown
          open={openPuzzle}
          onToggle={() => openOne("puzzle")}
          onClose={() => setOpenPuzzle(false)}
          trigger={
            <>
              <span>{currentPuzzle.label}</span>
              <ChevronIcon open={openPuzzle} />
            </>
          }
        >
          {PUZZLES.map((p) => (
            <DropdownItem
              key={p.id}
              active={p.id === puzzle}
              onClick={() => {
                onPuzzleChange(p.id);
                setOpenPuzzle(false);
              }}
            >
              <span>{p.label}</span>
            </DropdownItem>
          ))}
        </CapsuleDropdown>

        {/* ---------- Mode capsule ---------- */}
        <CapsuleDropdown
          open={openMode}
          onToggle={() => openOne("mode")}
          onClose={() => setOpenMode(false)}
          trigger={
            <>
              <span>{currentMode.label}</span>
              <ChevronIcon open={openMode} />
            </>
          }
        >
          {modes.map((m) => (
            <DropdownItem
              key={m.id}
              active={m.id === mode}
              onClick={() => {
                onModeChange(m.id);
                setOpenMode(false);
              }}
            >
              <span>{m.label}</span>
              {m.totalCases > 0 && (
                <span
                  className={`text-[0.6rem] tabular-nums ${
                    m.id === mode ? "text-white/60" : "text-[#A0A09A]"
                  }`}
                >
                  {m.totalCases}
                </span>
              )}
            </DropdownItem>
          ))}
        </CapsuleDropdown>

        {/* ---------- Filter Cases capsule (specialized modes only) ---------- */}
        {showFilter && (
          <CapsuleDropdown
            open={openCases}
            onToggle={() => openOne("cases")}
            onClose={() => setOpenCases(false)}
            panelClassName="min-w-[16rem]"
            trigger={
              <>
                <span aria-hidden>🧩</span>
                <span className="text-[#2C2C2C]">
                  Filter Cases ({selectedCases.size}/{total})
                </span>
                <ChevronIcon open={openCases} />
              </>
            }
          >
            <div className="flex items-center justify-between gap-3 px-2 py-1">
              <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#888]">
                {currentMode.label} · {total} cases
              </span>
              <button
                type="button"
                onClick={onResetCases}
                className="text-[0.6rem] uppercase tracking-[0.15em] text-[#888] transition-colors hover:text-[#2C2C2C]"
              >
                Select all
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1 p-1">
              {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
                const on = selectedCases.has(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onToggleCase(n)}
                    aria-pressed={on}
                    className={`flex h-7 items-center justify-center rounded-md text-[0.65rem] tabular-nums transition-colors ${
                      on
                        ? "bg-[#2C2C2C] text-white"
                        : "bg-[#F0F0EE] text-[#A0A09A] hover:bg-[#E8E8E4] hover:text-[#2C2C2C]"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </CapsuleDropdown>
        )}
      </div>

      {/* ---------- Settings gear (right-aligned) ---------- */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Open settings"
        className="absolute right-0 flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-white px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#666] transition-all hover:border-[#2C2C2C] hover:text-[#2C2C2C]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </button>
    </header>
  );
}
