"use client";

import { useEffect, useState } from "react";
import { formatTime, type Penalty, type Solve } from "@/lib/timer-types";

// ============================================================================
// Solve Detail Modal — opens when a row in the History Flow is clicked.
// Shows the solve's scramble, time, and date, and offers three penalty
// buttons (Clean / +2 / DNF) plus a delete action.
// ============================================================================

export interface SolveDetailModalProps {
  solve: Solve;
  onClose: () => void;
  onPenaltyChange: (id: number, penalty: Penalty) => void;
  onDelete: (id: number) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#E8E8E4] bg-white px-2.5 py-1 text-[0.6rem] font-medium text-[#666] transition-all hover:border-[#2C2C2C] hover:text-[#2C2C2C] active:scale-95"
    >
      {copied ? (
        <span className="text-green-600">Copied</span>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

const PENALTY_OPTIONS: { label: string; value: Penalty }[] = [
  { label: "Clean", value: 0 },
  { label: "+2", value: 2 },
  { label: "DNF", value: -1 },
];

export default function SolveDetailModal({
  solve,
  onClose,
  onPenaltyChange,
  onDelete,
}: SolveDetailModalProps) {
  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Body scroll lock while open.
  useEffect(() => {
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, []);

  const finalMs =
    solve.penalty === -1
      ? null
      : solve.penalty === 2
      ? solve.time + 2000
      : solve.time;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm transition-opacity" />

      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#E8E8E4] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-tab-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex flex-shrink-0 items-start gap-5 border-b border-[#F0F0EE] p-6 pr-12">
          <div className="min-w-0 flex-1">
            <h2 className="font-[family-name:var(--font-geist-mono)] text-2xl font-light tabular-nums tracking-wide text-[#2C2C2C]">
              {finalMs === null ? "DNF" : formatTime(finalMs)}
            </h2>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[#A0A09A]">
              {solve.event} · {solve.session} ·{" "}
              {new Date(solve.date).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 text-[#BBB] transition-colors hover:text-[#2C2C2C]"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body — scramble */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="mb-2 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#888]">
            Scramble
          </h4>
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[#F0F0EE] bg-[#FBFBFA] p-4">
            <code className="block break-all font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed tracking-wide text-[#555]">
              {solve.scramble || "—"}
            </code>
            {solve.scramble && <CopyButton text={solve.scramble} />}
          </div>

          {solve.inspectionTime !== undefined && (
            <p className="mt-3 text-[0.6rem] tracking-wide text-[#BBB]">
              Inspection: {(solve.inspectionTime / 1000).toFixed(1)}s
            </p>
          )}
        </div>

        {/* Footer — penalty + delete */}
        <div className="flex-shrink-0 border-t border-[#F0F0EE] p-6">
          <h4 className="mb-3 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#888]">
            Penalty
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {PENALTY_OPTIONS.map((opt) => {
              const active = solve.penalty === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() =>
                    solve.id !== undefined &&
                    onPenaltyChange(solve.id, opt.value)
                  }
                  className={`rounded-xl border px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.15em] transition-all ${
                    active
                      ? "border-[#2C2C2C] bg-[#2C2C2C] text-white"
                      : "border-[#E8E8E4] bg-white text-[#666] hover:border-[#2C2C2C] hover:text-[#2C2C2C]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              if (solve.id !== undefined) {
                onDelete(solve.id);
                onClose();
              }
            }}
            className="mt-4 w-full rounded-xl border border-[#E8E8E4] bg-white py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#888] transition-all hover:border-[#C44] hover:text-[#C44]"
          >
            Delete solve
          </button>
        </div>
      </div>
    </div>
  );
}
