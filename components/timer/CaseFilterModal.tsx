"use client";

import { useEffect, useRef, useState } from "react";
import type { AlgCase } from "@/data/algs";

export interface CaseFilterModalProps {
  open: boolean;
  modeLabel: string; // e.g. "3x3 OLL", "2x2 CLL"
  cases: AlgCase[];
  selectedIds: Set<string>;
  onClose: () => void;
  onApply: (ids: Set<string>) => void;
}

export default function CaseFilterModal({
  open,
  modeLabel,
  cases,
  selectedIds,
  onClose,
  onApply,
}: CaseFilterModalProps) {
  const [local, setLocal] = useState<Set<string>>(new Set(selectedIds));
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync local state when modal opens
  useEffect(() => {
    if (open) setLocal(new Set(selectedIds));
  }, [open, selectedIds]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const total = cases.length;
  const selectedCount = local.size;

  const toggle = (id: string) => {
    setLocal((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setLocal(new Set(cases.map((c) => c.id)));
  const deselectAll = () => setLocal(new Set());

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Filter ${modeLabel} cases`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex h-[80vh] min-h-[500px] w-[min(680px,92vw)] flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.06] px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-800">
              Filter {modeLabel} Cases
            </h2>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-neutral-400">
              Selected {selectedCount} / {total}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/[0.04] hover:text-neutral-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-shrink-0 items-center gap-2 px-6 py-2.5">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-full border border-[#E8E8E4] bg-white px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:border-neutral-800 hover:text-neutral-800"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="rounded-full border border-[#E8E8E4] bg-white px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:border-neutral-800 hover:text-neutral-800"
          >
            Deselect All
          </button>
        </div>

        {/* Cases grid */}
        <div
          ref={scrollRef}
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-6"
        >
          {cases.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                No case data for this set yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {cases.map((c) => {
                const isSelected = local.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-neutral-800 bg-[#FAFAF3] ring-1 ring-[#2C2C2C]/10"
                        : "border-[#EEE] bg-white opacity-50 hover:border-[#CCC] hover:opacity-80"
                    }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2C2C2C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                    <span className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] font-bold leading-tight text-neutral-800">
                      {c.name}
                    </span>
                    {c.group && c.group !== "—" && (
                      <span className="text-[0.5rem] uppercase tracking-[0.1em] text-neutral-400">
                        {c.group}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-black/[0.06] px-6 py-4">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-neutral-400">
            {selectedCount} of {total} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(local);
                onClose();
              }}
              className="rounded-full bg-neutral-800 px-5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-neutral-900"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
