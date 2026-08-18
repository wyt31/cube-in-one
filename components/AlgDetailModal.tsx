"use client";

import { useState, useEffect } from "react";
import { type AlgCase } from "@/data/algs";
import AlgCardCube from "@/components/AlgCardCube";

// ==========================================================================
// AlgDetailModal
//
// Layout:
//   - container: max-h-[85vh] max-w-xl flex flex-col
//   - header (cube + title + tag multi-select + setup scramble): flex-shrink-0
//   - formula list: flex-1 overflow-y-auto, smooth internal scroll
//
// Formula visual hierarchy:
//   - main alg: highlighted block (bg-neutral-100/80), 2px left accent border,
//     bold large font — clearly differentiated from variants
//   - variant algs: minimal single-row white card, small grey font
//
// Tag highlight (AND strong intersection):
//   - no tag selected  -> every formula 100% (isMatch = true)
//   - tag(s) selected  -> only formulas carrying ALL selected tags stay lit
//     (isMatch = true); the rest fade to opacity-25
//   - formula rows render NO badge tags — kept deliberately clean
// ==========================================================================

export interface AlgDetailModalProps {
  alg: AlgCase;
  /** Tag palette for the top-right multi-select, supplied per cube tier. */
  availableTags?: string[];
  onClose: () => void;
}

interface FormulaRow {
  key: string;
  alg: string;
  tags?: string[];
  primary?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#E8E8E4] bg-white px-2.5 py-1.5 text-[0.65rem] font-medium text-[#666] transition-all hover:border-[#2C2C2C] hover:text-[#2C2C2C] active:scale-95"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// Single formula row. `isMatch` is injected so callers can layer custom
// highlight styles on top of the default opacity behaviour.
function FormulaRowView({ row, isMatch }: { row: FormulaRow; isMatch: boolean }) {
  if (row.primary) {
    // Main alg: highlighted block, 2px left accent border, bold large font.
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border-l-2 border-[#2C2C2C] border-r border-t border-b border-[#E8E8E4] bg-neutral-100/80 p-4 transition-all duration-200 ${
          isMatch ? "opacity-100" : "opacity-25"
        }`}
      >
        <code className="block break-all font-[family-name:var(--font-geist-mono)] text-base font-bold leading-relaxed tracking-wide text-[#1A1A1A]">
          {row.alg}
        </code>
        <CopyButton text={row.alg} />
      </div>
    );
  }
  // Variant alg: minimal single row, small font, clean card.
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-[#F0F0EE] bg-white p-3 transition-all duration-200 ${
        isMatch ? "opacity-100" : "opacity-25"
      }`}
    >
      <code className="block break-all font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed tracking-wide text-[#666]">
        {row.alg}
      </code>
      <CopyButton text={row.alg} />
    </div>
  );
}

export default function AlgDetailModal({
  alg,
  availableTags = [],
  onClose,
}: AlgDetailModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Reset the multi-select whenever a different card is opened.
  useEffect(() => {
    setSelectedTags([]);
  }, [alg.id]);

  // Esc closes the modal.
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Body scroll lock: disable background scrolling while modal is open,
  // and restore the original overflow on close / unmount.
  useEffect(() => {
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // AND strong intersection: a formula matches when it carries EVERY selected
  // tag. With no selection, all formulas match (100% display).
  const isMatch = (tags?: string[]) => {
    if (selectedTags.length === 0) return true;
    if (!tags || tags.length === 0) return false;
    return selectedTags.every((t) => tags.includes(t));
  };

  // Build the formula list: main alg first (primary), then alternatives.
  const rows: FormulaRow[] = [];
  rows.push({ key: "main", alg: alg.recommended, tags: alg.recommendedTags, primary: true });
  if (alg.altAlgs && alg.altAlgs.length > 0) {
    alg.altAlgs.forEach((a, i) =>
      rows.push({ key: `alt-${i}`, alg: a.alg, tags: a.tags }),
    );
  } else if (alg.others && alg.others.length > 0) {
    alg.others.forEach((a, i) => rows.push({ key: `alt-${i}`, alg: a }));
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm transition-opacity" />

      <div
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#E8E8E4] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — pinned, flex-shrink-0 */}
        <div className="flex flex-shrink-0 flex-col gap-4 border-b border-[#F0F0EE] p-6 pr-12">
          <div className="flex items-start gap-5">
            <div className="flex aspect-square w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#F0F0EE] bg-[#FBFBFA] p-2">
              <AlgCardCube alg={alg} className="h-full w-full" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-light tracking-wide text-[#2C2C2C]">
                {alg.name}
              </h2>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-[#A0A09A]">
                {alg.cube} · {alg.set} · {alg.group}
              </p>
            </div>

            {/* Top-right tag multi-select (per-tier palette) */}
            {availableTags.length > 0 && (
              <div className="flex flex-shrink-0 flex-wrap justify-end gap-1.5">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-2.5 py-1 text-[0.6rem] font-medium tracking-wide transition-all ${
                        active
                          ? "border-[#2C2C2C] bg-[#2C2C2C] text-white"
                          : "border-[#E8E8E4] bg-white text-[#888] hover:border-[#CCC]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-[#BBB] transition-colors hover:text-[#2C2C2C]"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Setup scramble — pinned in header, single-line light card + Copy */}
          {alg.setup && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F0F0EE] bg-[#FAFAF8] px-3 py-2">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="flex-shrink-0 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-[#A0A09A]">
                  Setup
                </span>
                <code className="block truncate font-[family-name:var(--font-geist-mono)] text-xs text-[#888]">
                  {alg.setup}
                </code>
              </div>
              <CopyButton text={alg.setup} />
            </div>
          )}
        </div>

        {/* Formula list — flex-1, scrolls internally when overflowing */}
        <div className="flex-1 overflow-y-auto p-6 pr-2">
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <FormulaRowView
                key={row.key}
                row={row}
                isMatch={isMatch(row.tags)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
