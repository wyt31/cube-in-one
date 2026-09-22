"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { parseTimeInput } from "@/lib/parseTime";
import { type Penalty } from "@/lib/timer-types";

// ============================================================================
// ManualTimeInput — Typing-mode entry surface.
//
//   Enter  : parse + submit (new solve) OR apply penalty to latest solve.
//            The field is cleared and stays focused for continuous entry, and
//            the parent advances to the next scramble.
//   Esc    : clear the field; if already empty, blur to hand focus back.
//
// Parsing lives in lib/parseTime.ts so it can be unit-tested in isolation.
// The surface stays blank when idle — only a thin underline anchors the field,
// brightening on focus and reddening on error.
// ============================================================================

export interface ManualTimeInputProps {
  /** A freshly parsed solve to persist. Parent handles save + next scramble. */
  onSubmit: (result: { time: number; penalty: Penalty; rawInput: string }) => void;
  /** Apply +2 / DNF to the latest solve (standalone "+" / "d" commands). */
  onPenaltyCommand: (penalty: 2 | -1) => void;
}

export default function ManualTimeInput({
  onSubmit,
  onPenaltyCommand,
}: ManualTimeInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount so the user can start typing immediately.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const parsed = parseTimeInput(value);
    if (parsed.kind === "invalid") {
      setHasError(true);
      return;
    }
    setHasError(false);
    if (parsed.kind === "penalty-command") {
      onPenaltyCommand(parsed.penalty);
    } else {
      onSubmit({
        time: parsed.time,
        penalty: parsed.penalty,
        rawInput: parsed.rawInput,
      });
    }
    // Clear and re-focus for continuous entry.
    setValue("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [value, onSubmit, onPenaltyCommand]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (value) {
          setValue("");
          setHasError(false);
        } else {
          inputRef.current?.blur();
        }
      }
    },
    [handleSubmit, value],
  );

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 pb-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-4">
        <input
          ref={inputRef}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasError) setHasError(false);
          }}
          onKeyDown={handleKeyDown}
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Manual time input"
          className={`w-full bg-transparent text-center font-[family-name:var(--font-geist-mono)] text-5xl font-bold tabular-nums tracking-tight outline-none sm:text-6xl md:text-7xl lg:text-8xl ${
            hasError ? "text-red-500" : "text-neutral-800"
          }`}
        />
        {/* Thin underline — brightens on focus, dims on blur, reddens on error. */}
        <div
          className={`h-px w-72 transition-colors duration-300 ${
            hasError
              ? "bg-red-400"
              : isFocused
                ? "bg-neutral-800/40"
                : "bg-neutral-800/15"
          }`}
        />
      </div>
    </div>
  );
}
