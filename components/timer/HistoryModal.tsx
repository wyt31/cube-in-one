"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { formatTime, type Penalty, type Solve, type TimerEvent } from "@/lib/timer-types";
import { updateSolveNote } from "@/lib/db";
import { formatSolveExport } from "@/lib/export-format";

// ============================================================================
// HistoryModal – large grid-cards modal opened from the "HISTORY" capsule.
//
// Layout:
//   - 3-4 column responsive grid of solve cards (index + big time + ts).
//   - Click a card → inline 1st-level "Detail Panel" appears.
//   - Detail shows: full scramble (+ copy), exact time, Note textarea.
//   - No direct scramble display on the grid cards (prevents long 7x7/Mega
//     scrambles from blowing up card dimensions).
// ============================================================================

export interface HistoryModalProps {
  open: boolean;
  solves: Solve[];          // current session solves (ascending date order)
  event: TimerEvent;       // puzzle type for twisty-player rendering
  onClose: () => void;
  onPenaltyChange: (id: number, penalty: Penalty) => void;
  onDeleteSolve: (id: number) => void;
  /** When set, auto-open the detail page for this solve on mount. */
  initialSolveId?: number | null;
}

// ---- Portal host (shared instance) ----------------------------------------
let host: HTMLDivElement | null = null;
function ensureHost(): HTMLDivElement | null {
  if (typeof document === "undefined") return null;
  if (!host) {
    host = document.createElement("div");
    host.id = "__history_modal_root";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "110";
    host.style.pointerEvents = "none";
    document.body.appendChild(host);
  }
  return host;
}

// ---- Shared animation constants (GPU-only: opacity + transform) ----------
const DIALOG_TRANSITION: React.CSSProperties = {
  transition: "opacity 150ms ease-out, transform 150ms ease-out",
  transform: "translate3d(0,0,0)",
  willChange: "transform, opacity",
  backfaceVisibility: "hidden",
};
const BACKDROP_TRANSITION: React.CSSProperties = {
  transition: "opacity 150ms ease-out",
  willChange: "opacity",
};

// ---- Small helpers ---------------------------------------------------------

/**
 * Format a solve time for the card front, embedding the penalty state:
 *   clean  → "6.90"
 *   +2     → "8.90+"        (final time with trailing plus)
 *   DNF    → "DNF (6.90)"   (label + raw time in parens)
 */
function displayTime(s: Solve): string {
  const raw = formatTime(s.time);
  if (s.penalty === 2) {
    const final = formatTime(s.time + 2000);
    return `${final}+`;
  }
  if (s.penalty === -1) return `DNF (${raw})`;
  return raw;
}

function dateLabel(epoch: number): string {
  const d = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Map our friendly TimerEvent to the puzzle id that <twisty-player> accepts.
 * (Same mapping used by ScrambleViewer.tsx on the main timer page.)
 */
function puzzleIdForEvent(puzzle: TimerEvent): string {
  switch (puzzle) {
    case "2x2x2":
    case "3x3x3":
    case "4x4x4":
    case "5x5x5":
    case "6x6x6":
    case "7x7x7":
      return puzzle;
    case "3x3x3 OH":
    case "3x3x3 BF":
      return "3x3x3";
    case "Clock":
      return "clock";
    case "Megaminx":
      return "megaminx";
    case "Pyraminx":
      return "pyraminx";
    case "Skewb":
      return "skewb";
    case "Square-1":
      return "square1";
    default:
      return "3x3x3";
  }
}

// ---- 2D Scramble Preview (cubing.js <twisty-player>) ----------------------
function ScramblePreview({ puzzle, scramble }: { puzzle: TimerEvent; scramble: string }) {
  const puzzleId = useMemo(() => puzzleIdForEvent(puzzle), [puzzle]);
  if (!scramble) {
    return (
      <div className="flex h-40 items-center justify-center text-[0.6rem] uppercase tracking-[0.15em] text-neutral-300">
        No scramble
      </div>
    );
  }
  return (
    <div className="h-40 w-full overflow-hidden rounded-2xl border border-black/[0.05] bg-[#FBFAF7]">
      <twisty-player
        puzzle={puzzleId}
        alg={scramble}
        visualization="2D"
        background="none"
        control-panel="none"
        style={
          {
            width: "100%",
            height: "100%",
            ["--twisty-player-particle-count" as string]: "0",
          } as CSSProperties
        }
      />
    </div>
  );
}

// ---- Time Filter ----------------------------------------------------------
type TimeFilter = "all" | "today" | "week" | "custom";

/** Format a YYYY-MM-DD string as MM/DD for the pill label. */
function fmtDatePill(ymd: string): string {
  const [, m, d] = ymd.split("-");
  return `${m}/${d}`;
}

/**
 * Compute [start, end] epoch ms for the given filter.
 * Returns null for "all" (no filtering).
 * "week" = Monday 00:00 of the current week → now.
 * "custom" = start date 00:00:00 → end date 23:59:59.
 *   When start == end (same day), this naturally becomes a single-day query.
 */
function computeDateRange(
  filter: TimeFilter,
  customStart: string,
  customEnd: string,
): [number, number] | null {
  if (filter === "all") return null;
  const now = new Date();
  if (filter === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return [start, now.getTime()];
  }
  if (filter === "week") {
    // Monday = 1, Sunday = 0.  Compute days since Monday.
    const day = now.getDay();
    const daysSinceMon = day === 0 ? 6 : day - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMon);
    return [monday.getTime(), now.getTime()];
  }
  if (filter === "custom" && customStart && customEnd) {
    // Ensure start ≤ end; swap if user picked them backwards.
    const lo = customStart <= customEnd ? customStart : customEnd;
    const hi = customStart <= customEnd ? customEnd : customStart;
    const start = new Date(lo + "T00:00:00").getTime();
    const end = new Date(hi + "T00:00:00").getTime() + 24 * 60 * 60 * 1000 - 1;
    return [start, end];
  }
  return null;
}

// ---- UI subcomponents ------------------------------------------------------

/**
 * Compute a single solve's final effective time.
 * DNF: null (excluded from Best/Avg math; kept in count for Worst display).
 * +2 : time + 2000.
 */
function effectiveTimeMs(s: Solve): number | null {
  if (s.penalty === -1) return null;
  return s.time + (s.penalty === 2 ? 2000 : 0);
}

/**
 * Ao5-style trimmed mean:
 *   - drop 1 best + 1 worst from the effective values (DNFs count as infinity
 *     for worst, so one DNF gets dropped if present).
 *   - if the remaining middle slice still contains any DNF, result is DNF.
 *   - returns number in ms, or null for DNF-mean.
 */
function trimmedAverage(selected: Solve[]): number | null {
  const raw = selected.map(effectiveTimeMs);
  const n = raw.length;
  if (n < 3) return null;
  // Build list with indices so we can track DNFs post-drop.
  const ranked = raw
    .map((t, i) => ({ i, t, dnf: t === null }))
    .sort((a, b) => {
      if (a.dnf && b.dnf) return 0;
      if (a.dnf) return 1; // DNF comes last (worst)
      if (b.dnf) return -1;
      return a.t! - b.t!;
    });
  // Drop one best (front) + one worst (back).
  const middle = ranked.slice(1, n - 1);
  // If any middle item is DNF → average is DNF.
  if (middle.some((x) => x.dnf)) return null;
  const sum = middle.reduce((acc, x) => acc + (x.t ?? 0), 0);
  return Math.round(sum / middle.length);
}

function selectionStats(selected: Solve[]) {
  const withTime = selected
    .map((s) => ({ s, t: effectiveTimeMs(s) }))
    .filter((x): x is { s: Solve; t: number } => x.t !== null);
  const best = withTime.length > 0 ? withTime.reduce((a, b) => (a.t < b.t ? a : b)) : null;
  const worstVal = selected.reduce<{ s: Solve | null; t: number | null }>(
    (acc, s) => {
      const t = effectiveTimeMs(s);
      if (acc.t === null) return { s, t };
      if (t === null) return { s, t }; // DNF = worst
      return acc.t < t ? { s, t } : acc;
    },
    { s: null, t: null }
  );
  const worst = worstVal.s;
  const avg = trimmedAverage(selected);

  // Raw mean: arithmetic mean of all *valid* (non-DNF) effective times.
  // If everything is DNF → null.  We also expose successCount / total for
  // the "58/64" success-rate chip beside the raw mean value.
  const successCount = withTime.length;
  const rawMean =
    successCount > 0
      ? Math.round(withTime.reduce((acc, x) => acc + x.t, 0) / successCount)
      : null;

  return { best, worst, avg, rawMean, successCount, total: selected.length };
}

function formatTimeOrDnf(ms: number | null): string {
  return ms == null ? "DNF" : formatTime(ms);
}

/**
 * Dynamic label for the trimmed-average column:
 *   N=5  → "Ao5"
 *   N=12 → "Ao12"
 *   N=50 → "Ao50"
 *   N=100 → "Ao100"
 *   other → "TRIMMED AVG"
 * This mirrors WCA naming (Ao5/Ao12/Ao50/Ao100 are the canonical averages).
 */
function trimmedAvgLabel(n: number): string {
  if (n === 5) return "Ao5";
  if (n === 12) return "Ao12";
  if (n === 50) return "Ao50";
  if (n === 100) return "Ao100";
  return "TRIMMED AVG";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#E8E8E4] bg-white px-2.5 py-1 text-[0.6rem] font-medium text-neutral-500 transition-colors hover:border-neutral-800 hover:text-neutral-800"
    >
      {copied ? (
        <span className="text-green-600">Copied</span>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function NoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

// ============================================================================
// HistoryModal — main export
// ============================================================================
export default function HistoryModal({ open, solves, event, onClose, onPenaltyChange, onDeleteSolve, initialSolveId }: HistoryModalProps) {
  // mount + enter two-phase (mirrors TrainerModal for GPU performance).
  const [mount, setMount] = useState(open);
  const [enter, setEnter] = useState(false);

  // Selected solve for inline detail pane; null = grid view only.
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Local draft for the Note textarea, flushed to DB on blur.
  const [noteDraft, setNoteDraft] = useState<string>("");

  // ---------- Multi-select mode -------------------------------------------
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // Confirm for bulk delete (mirrors single-solve 2-step confirm flow).
  const [bulkDeleteConfirming, setBulkDeleteConfirming] = useState(false);
  const [bulkCopyTicked, setBulkCopyTicked] = useState(false);

  // ---------- Time filter ------------------------------------------------
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Sync: any time we leave multi-select, clean the selection + confirm flags.
  // Also clear any in-grid checkbox highlight state.
  useEffect(() => {
    if (!selectMode) {
      setSelectedIds(new Set());
      setBulkDeleteConfirming(false);
      setBulkCopyTicked(false);
    }
  }, [selectMode]);

  // If user opens a detail pane, temporarily suspend select mode interactions
  // (don't throw away selection, though).
  useEffect(() => {
    if (selectedId != null) {
      setBulkDeleteConfirming(false);
    }
  }, [selectedId]);

  // 2-step timeout for the bulk delete confirm.
  useEffect(() => {
    if (!bulkDeleteConfirming) return;
    const t = window.setTimeout(() => setBulkDeleteConfirming(false), 3500);
    return () => window.clearTimeout(t);
  }, [bulkDeleteConfirming]);

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredOrdered.map((o) => o.solve.id).filter((x): x is number => x != null);
    setSelectedIds(new Set(allIds));
  };
  const handleDeselectAll = () => setSelectedIds(new Set());

  const handleCopySelected = async () => {
    // Collect selected solves in display order (newest-first → reverse to chronological)
    const picks = filteredOrdered
      .filter((o) => o.solve.id != null && selectedIds.has(o.solve.id));
    if (picks.length === 0) return;

    // Solves in chronological order (oldest → newest) for the export function
    const chronologicalSolves = [...picks].reverse().map((p) => p.solve);
    // Indices into the full filtered list (for consecutive check)
    const allIndices = filteredOrdered.map((_, i) => i);
    const selectedIndices = picks.map((p) => filteredOrdered.indexOf(p));

    try {
      await navigator.clipboard.writeText(
        formatSolveExport(chronologicalSolves, allIndices.length, selectedIndices),
      );
      setBulkCopyTicked(true);
      setTimeout(() => setBulkCopyTicked(false), 1600);
    } catch {
      /* no-op */
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!bulkDeleteConfirming) {
      setBulkDeleteConfirming(true);
      return;
    }
    // Apply deletions one-by-one via the existing prop callback (so the
    // session store handles it consistently with other deletes).  Order doesn't
    // matter here; iterate a stable snapshot.
    const ids = Array.from(selectedIds);
    setSelectedIds(new Set());
    setBulkDeleteConfirming(false);
    for (const id of ids) onDeleteSolve(id);
  };

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRootRef = useRef<HTMLDivElement | null>(null);

  // Mount / enter toggling ---------------------------------------------------
  useEffect(() => {
    let raf1: number | undefined;
    let raf2: number | undefined;
    let t: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMount(true);
      // reset UI view every open — start on grid or auto-open detail if requested
      setSelectedId(initialSolveId ?? null);
      setNoteDraft("");
      setTimeFilter("all");
      setCustomStart("");
      setCustomEnd("");
      setSelectMode(false);
      setSelectedIds(new Set());
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEnter(true));
      });
    } else {
      setEnter(false);
      t = setTimeout(() => setMount(false), 160);
    }

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (t) clearTimeout(t);
    };
  }, [open, initialSolveId]);

  // Esc + body scroll lock + main blur ---------------------------------------
  useEffect(() => {
    if (!mount) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedId !== null) {
          setSelectedId(null);
        } else {
          onClose();
        }
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-history-open", "1");
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.removeAttribute("data-history-open");
    };
  }, [mount, selectedId, onClose]);

  // Keep note draft in sync when user clicks a different card.
  useEffect(() => {
    if (selectedId == null) return;
    const s = solves.find((x) => x.id === selectedId);
    setNoteDraft(s?.note ?? "");
    // We intentionally resync whenever the selected solve id changes, or when
    // the solves list updates (e.g. penalty changes reflect in same id).
  }, [selectedId, solves]);

  const handleNoteBlur = () => {
    if (selectedId == null) return;
    void updateSolveNote(selectedId, noteDraft);
  };

  // --- Penalty toggle: tristate — click active penalty to revert to OK ---
  const handlePenaltyToggle = (target: Penalty) => {
    if (selectedId == null) return;
    const s = solves.find((x) => x.id === selectedId);
    if (!s) return;
    // If already in this penalty state, revert to OK (0); otherwise set target.
    onPenaltyChange(selectedId, s.penalty === target ? 0 : target);
  };

  // --- Delete with two-step confirm + click-away to cancel ---------------
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!deleteConfirming) return;
    const t = window.setTimeout(() => setDeleteConfirming(false), 3500);
    return () => window.clearTimeout(t);
  }, [deleteConfirming]);

  // Click-away: clicking anywhere outside the delete button cancels confirm.
  useEffect(() => {
    if (!deleteConfirming) return;
    const onAway = (e: MouseEvent) => {
      const btn = deleteBtnRef.current;
      if (btn && btn.contains(e.target as Node)) return;
      setDeleteConfirming(false);
    };
    document.addEventListener("mousedown", onAway, true);
    return () => document.removeEventListener("mousedown", onAway, true);
  }, [deleteConfirming]);

  // Reset confirm state when switching solves or closing detail.
  useEffect(() => {
    setDeleteConfirming(false);
  }, [selectedId]);

  const handleDeleteClick = () => {
    if (selectedId == null) return;
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    onDeleteSolve(selectedId);
    setDeleteConfirming(false);
    setSelectedId(null);
  };

  // Click backdrop outside the content root → close --------------------------
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    const box = contentRootRef.current;
    if (box && box.contains(e.target as Node)) return;
    if (e.target === overlayRef.current || e.currentTarget === overlayRef.current) {
      onClose();
    }
  };
  const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

  const hostEl = useMemo(() => ensureHost(), []);

  // Solves passed in are chronological (oldest → newest).  Display newest
  // first so the latest solve sits in the top-left slot.  Index counts down
  // from solves.length for the "session solve number" label.
  // (Hook declaration kept ABOVE any early return — React Hooks order rule.)
  const ordered = useMemo(() => {
    const out = [...solves].sort((a, b) => b.date - a.date);
    return out.map((s, idx) => ({
      solve: s,
      sessionIndex: solves.length - idx,
    }));
  }, [solves]);

  // --- Time-filtered view of ordered (for grid display) ---
  const dateRange = useMemo(
    () => computeDateRange(timeFilter, customStart, customEnd),
    [timeFilter, customStart, customEnd],
  );
  const filteredOrdered = useMemo(() => {
    if (!dateRange) return ordered;
    const [start, end] = dateRange;
    return ordered.filter((o) => o.solve.date >= start && o.solve.date <= end);
  }, [ordered, dateRange]);

  const selectedSolve = selectedId != null
    ? solves.find((s) => s.id === selectedId) ?? null
    : null;

  const selectedSolvesArr = useMemo(
    () => filteredOrdered.filter((o) => o.solve.id != null && selectedIds.has(o.solve.id)).map((o) => o.solve),
    [filteredOrdered, selectedIds]
  );
  const stats = useMemo(() => selectionStats(selectedSolvesArr), [selectedSolvesArr]);

  if (!mount || !hostEl) return null;

  const cardsVisible = !selectedSolve;
  const showStatsBar = selectMode && selectedIds.size >= 3;
  const showEmptyFilter = ordered.length > 0 && filteredOrdered.length === 0;

  // ----------- Styles (only opacity/scale animate) -------------------------
  const dialogStyle: React.CSSProperties = {
    ...DIALOG_TRANSITION,
    opacity: enter ? 1 : 0,
    transform: enter
      ? "translate3d(0,0,0) scale(1)"
      : "translate3d(0,0,0) scale(0.96)",
  };
  const backdropStyle: React.CSSProperties = {
    ...BACKDROP_TRANSITION,
    opacity: enter ? 1 : 0,
  };

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayMouseDown}
      aria-hidden={!enter}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: enter ? "auto" : "none",
        ...backdropStyle,
      }}
      className="bg-black/40"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Session history"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...dialogStyle,
        }}
      >
        <div
          ref={contentRootRef}
          onMouseDown={stopBubble}
          className="relative flex h-[80vh] min-h-[600px] w-[min(1100px,92vw)] min-h-0 flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        >
          {/* ---------- Header ---------- */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.05] px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-neutral-800">
                Session History
              </h2>
              <span className="rounded-full bg-black/[0.03] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.65rem] text-neutral-400">
                {filteredOrdered.length}{filteredOrdered.length !== ordered.length && ` / ${ordered.length}`} solve{filteredOrdered.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* ---------- Time filter segmented control ---------- */}
              {ordered.length > 0 && selectedId === null && (
                <div className="flex items-center gap-1 rounded-full border border-black/[0.06] bg-[#F6F5F1] p-0.5">
                  {([
                    { key: "all", label: "All" },
                    { key: "today", label: "Today" },
                    { key: "week", label: "This Week" },
                    { key: "custom", label: "Custom…" },
                  ] as const).map((seg) => {
                    // Dynamic pill text for "custom": show date range or "CUSTOM RANGE".
                    const pillLabel =
                      seg.key === "custom" && timeFilter === "custom"
                        ? customStart && customEnd
                          ? customStart === customEnd
                            ? fmtDatePill(customStart)
                            : `${fmtDatePill(customStart)} – ${fmtDatePill(customEnd)}`
                          : "CUSTOM RANGE"
                        : seg.label;
                    return (
                      <button
                        key={seg.key}
                        type="button"
                        onClick={() => {
                          // When entering custom mode, default both dates to today.
                          if (seg.key === "custom" && !customStart) {
                            const today = new Date();
                            const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                            setCustomStart(ymd);
                            setCustomEnd(ymd);
                          }
                          setTimeFilter(seg.key);
                        }}
                        aria-pressed={timeFilter === seg.key}
                        className={`flex h-7 items-center rounded-full px-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] transition-all ${
                          timeFilter === seg.key
                            ? "bg-white text-neutral-800 shadow-sm"
                            : "text-neutral-400 hover:text-neutral-500"
                        }`}
                      >
                        {pillLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Custom date range pickers (appear when custom is active) */}
              {timeFilter === "custom" && selectedId === null && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    aria-label="Start date"
                    className="h-8 rounded-full border border-black/[0.08] bg-white px-3 text-[0.65rem] text-neutral-800 focus:outline-none focus:border-neutral-800/40"
                  />
                  <span className="text-[0.6rem] text-neutral-400">→</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    aria-label="End date"
                    className="h-8 rounded-full border border-black/[0.08] bg-white px-3 text-[0.65rem] text-neutral-800 focus:outline-none focus:border-neutral-800/40"
                  />
                </div>
              )}
              {/* ---------- Select Mode toggle (hidden in detail view) ---------- */}
              {filteredOrdered.length > 0 && selectedId === null && (
                <button
                  type="button"
                  onClick={() => setSelectMode((v) => !v)}
                  aria-pressed={selectMode}
                  aria-label={selectMode ? "Exit multi-select" : "Enter multi-select"}
                  className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition-all ${
                    selectMode
                      ? "border-neutral-800 bg-neutral-800 text-white shadow-sm"
                      : "border-black/[0.08] bg-white text-neutral-500 hover:border-neutral-800/50 hover:text-neutral-800"
                  }`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {selectMode ? "Select ON" : "Select"}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close history"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-neutral-400 transition-all hover:border-black/10 hover:text-neutral-800"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ---------- Multi-select toolbar (visible only in Select Mode) ---------- */}
          {selectMode && filteredOrdered.length > 0 && (
            <div
              className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-black/[0.04] bg-[#FBFAF7]/80 px-6 py-3 sm:px-8"
              style={{ backdropFilter: "blur(6px)" }}
            >
              {/* Left: count + All / None */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 min-w-[2.5rem] items-center justify-center rounded-full bg-neutral-800 px-2 font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.65rem] font-semibold text-white"
                  >
                    {selectedIds.size}
                  </span>
                  <span className="text-[0.62rem] uppercase tracking-[0.2em] text-neutral-400">
                    selected / {filteredOrdered.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={selectedIds.size === filteredOrdered.length}
                    className="rounded-full border border-black/[0.06] bg-white px-2.5 py-1 text-[0.6rem] font-medium text-neutral-500 transition-colors hover:border-neutral-800/40 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    disabled={selectedIds.size === 0}
                    className="rounded-full border border-black/[0.06] bg-white px-2.5 py-1 text-[0.6rem] font-medium text-neutral-500 transition-colors hover:border-neutral-800/40 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    None
                  </button>
                </div>
              </div>

              {/* Right: Copy + Delete */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySelected}
                  disabled={selectedIds.size === 0}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:border-neutral-800/50 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bulkCopyTicked ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Selected
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    bulkDeleteConfirming
                      ? "border-[#C04848] bg-[#C04848] text-white shadow-sm"
                      : "border-black/[0.08] bg-white text-neutral-400 hover:border-[#C04848] hover:text-[#C04848]"
                  }`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  </svg>
                  {bulkDeleteConfirming ? `Confirm (${selectedIds.size})?` : `Delete (${selectedIds.size})`}
                </button>
              </div>
            </div>
          )}

          {/* ---------- Body: Grid view (with optional Detail overlay) ----------
               Uses a nested flex column so the scrollable area receives a concrete
               height from the outer max-h-[85vh] constraint (via min-h-0 at every
               level), avoiding the "flex children don't overflow" bug that would
               either hide the grid or prevent scrolling.
          */}
          <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
            {/* Empty state: no solves at all */}
            {ordered.length === 0 ? (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-2 text-center text-neutral-400">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 14" />
                </svg>
                <p className="text-[0.7rem] font-light tracking-wide">
                  No solves yet — do a solve first to see it here.
                </p>
              </div>
            ) : showEmptyFilter ? (
              /* Empty state: time filter yields nothing */
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-2 text-center text-neutral-400">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="text-[0.7rem] font-light tracking-wide">
                  No solves in this time range.
                </p>
                <button
                  type="button"
                  onClick={() => setTimeFilter("all")}
                  className="mt-1 rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[0.58rem] font-medium uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:border-neutral-800/40 hover:text-neutral-800"
                >
                  Show All
                </button>
              </div>
            ) : (
              <div
                className={`custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 transition-opacity duration-200 sm:px-8 ${
                  showStatsBar ? "pb-24" : "pb-6"
                } ${cardsVisible ? "opacity-100" : "pointer-events-none opacity-20"}`}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {filteredOrdered.map(({ solve, sessionIndex }) => {
                    const id = solve.id;
                    const detailSelected = id === selectedId;
                    const inBasket = id != null && selectedIds.has(id);
                    return (
                      <button
                        key={id ?? sessionIndex}
                        type="button"
                        onClick={() => {
                          if (selectMode && id != null) {
                            toggleSelectId(id);
                            return;
                          }
                          if (id !== undefined) setSelectedId(id);
                        }}
                        className={`group relative flex aspect-[5/4] w-full flex-col items-start justify-between overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                          inBasket
                            ? "border-neutral-800/40 bg-[#FAFAF3] shadow-[0_10px_28px_-14px_rgba(0,0,0,0.28)] ring-2 ring-[#2C2C2C]/10"
                            : detailSelected
                            ? "border-neutral-800/30 bg-[#FAFAF6] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)]"
                            : "border-black/[0.05] bg-[#FBFAF7] hover:border-black/[0.1] hover:bg-white hover:shadow-[0_8px_20px_-16px_rgba(0,0,0,0.25)]"
                        }`}
                      >
                        {/* Row 1: index (top-left) OR checkbox (when select mode) + note icon (top-right) */}
                        <div className="flex w-full items-start justify-between gap-2">
                          {selectMode ? (
                            <span
                              role="checkbox"
                              aria-checked={inBasket}
                              aria-label={`Toggle select solve ${sessionIndex}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (id != null) toggleSelectId(id);
                              }}
                              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                                inBasket
                                  ? "border-neutral-800 bg-neutral-800 text-white shadow-sm"
                                  : "border-black/[0.15] bg-white text-transparent group-hover:border-neutral-800/40"
                              }`}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : (
                            <span className="rounded-full bg-black/[0.04] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.6rem] text-neutral-400">
                              #{String(sessionIndex).padStart(2, "0")}
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-1.5">
                            {inBasket && !selectMode ? (
                              <span className="rounded-full bg-neutral-800/90 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.55rem] font-bold uppercase tracking-wider text-white">
                                selected
                              </span>
                            ) : null}
                            {!!solve.note && solve.note.trim().length > 0 && (
                              <span
                                aria-label="Has note"
                                title={solve.note.length > 36 ? solve.note.slice(0, 36) + "…" : solve.note}
                                className="text-[#C9B892]"
                              >
                                <NoteIcon />
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Row 2: big time */}
                        <div
                          className={`font-[family-name:var(--font-geist-mono)] tracking-tight ${
                            solve.penalty === -1
                              ? "text-neutral-800"
                              : solve.penalty === 2
                              ? "text-neutral-800"
                              : "text-neutral-800"
                          }`}
                          style={{ fontSize: "clamp(1.4rem, 2.2vw, 2rem)", lineHeight: 1.05 }}
                        >
                          {displayTime(solve)}
                        </div>

                        {/* Row 3: timestamp */}
                        <div className="w-full text-[0.6rem] font-light text-[#A9A39A] opacity-70">
                          {dateLabel(solve.date)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------- Selection stats bar (≥3 picks, slide up from bottom) ---------- */}
            {showStatsBar && (
              <div
                aria-live="polite"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] px-4 pb-2 sm:px-6 sm:pb-3"
              >
                <div
                  className="pointer-events-auto mx-auto flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white/95 px-4 py-3 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] sm:px-6"
                  style={{
                    backdropFilter: "blur(8px)",
                    animation: "statsBarSlideUp 180ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    {/* Trimmed Avg (dynamic label: Ao5 / Ao12 / Ao50 / Ao100 / TRIMMED AVG) */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                        {trimmedAvgLabel(selectedIds.size)}
                      </span>
                      <span
                        className={`font-[family-name:var(--font-geist-mono)] tabular-nums ${
                          stats.avg == null ? "text-[#C04848]" : "text-neutral-800"
                        }`}
                        style={{ fontSize: "1.25rem", lineHeight: 1 }}
                      >
                        {formatTimeOrDnf(stats.avg)}
                      </span>
                    </div>
                    <span className="hidden h-5 w-px bg-black/[0.08] sm:inline-block" />
                    {/* Raw Mean + success rate chip */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                        Raw Mean
                      </span>
                      <span
                        className="font-[family-name:var(--font-geist-mono)] tabular-nums text-neutral-800"
                        style={{ fontSize: "1.25rem", lineHeight: 1 }}
                      >
                        {formatTimeOrDnf(stats.rawMean)}
                      </span>
                      {stats.total > 0 && stats.successCount < stats.total && (
                        <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.55rem] font-medium text-neutral-400">
                          {stats.successCount}/{stats.total}
                        </span>
                      )}
                    </div>
                    <span className="hidden h-5 w-px bg-black/[0.08] sm:inline-block" />
                    {/* Best */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                        Best
                      </span>
                      <span
                        className="font-[family-name:var(--font-geist-mono)] tabular-nums text-[#2563eb]"
                        style={{ fontSize: "1.05rem", lineHeight: 1 }}
                      >
                        {stats.best ? displayTime(stats.best.s) : "—"}
                      </span>
                    </div>
                    <span className="hidden h-5 w-px bg-black/[0.08] sm:inline-block" />
                    {/* Worst */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                        Worst
                      </span>
                      <span
                        className={`font-[family-name:var(--font-geist-mono)] tabular-nums ${
                          stats.worst && stats.worst.penalty === -1 ? "text-[#C04848]" : "text-neutral-800"
                        }`}
                        style={{ fontSize: "1.05rem", lineHeight: 1 }}
                      >
                        {stats.worst ? displayTime(stats.worst) : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.22em] text-neutral-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M3 3v18h18" />
                      <path d="M7 14l4-4 4 4 5-5" />
                    </svg>
                    {selectedIds.size}-solve free selection
                  </div>
                </div>
              </div>
            )}

            {/* Inline Detail Panel — appears as first-level overlay inside modal body */}
            {selectedSolve && (
              <div
                aria-label="Solve details"
                className="absolute inset-0 z-10 flex min-h-0 flex-col border-l-0 border-t border-black/[0.05] bg-white"
                style={{ animation: "tabEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
              >
                {/* Detail header */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.05] px-6 py-4 sm:px-8">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      aria-label="Back to list"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-neutral-400 transition-all hover:border-black/10 hover:text-neutral-800"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                    </button>
                    <div>
                      <div
                        className="font-[family-name:var(--font-geist-mono)] tracking-tight text-neutral-800"
                        style={{ fontSize: "1.35rem", lineHeight: 1.1 }}
                      >
                        {displayTime(selectedSolve)}
                      </div>
                      <div className="mt-0.5 text-[0.6rem] font-light text-[#A9A39A]">
                        {dateLabel(selectedSolve.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail scroll body: Scramble preview + text + Note */}
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                  {/* --- Quick action buttons: +2 / DNF / Delete --- */}
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePenaltyToggle(2)}
                      className={`rounded-full border px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition-all ${
                        selectedSolve.penalty === 2
                          ? "border-neutral-800 bg-neutral-800 text-white"
                          : "border-black/[0.1] bg-white text-neutral-500 hover:border-neutral-800 hover:text-neutral-800"
                      }`}
                    >
                      +2
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePenaltyToggle(-1)}
                      className={`rounded-full border px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition-all ${
                        selectedSolve.penalty === -1
                          ? "border-[#C04848] bg-[#C04848] text-white"
                          : "border-black/[0.1] bg-white text-neutral-500 hover:border-[#C04848] hover:text-[#C04848]"
                      }`}
                    >
                      DNF
                    </button>
                    <button
                      ref={deleteBtnRef}
                      type="button"
                      onClick={handleDeleteClick}
                      className={`ml-auto rounded-full border px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition-all ${
                        deleteConfirming
                          ? "border-[#C04848] bg-[#C04848] text-white"
                          : "border-black/[0.1] bg-white text-neutral-400 hover:border-[#C04848] hover:text-[#C04848]"
                      }`}
                    >
                      {deleteConfirming ? "Confirm delete?" : "Delete"}
                    </button>
                  </div>

                  {/* --- 2D Scramble preview (cubing.js twisty-player) --- */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                        Scramble Preview
                      </h3>
                      {selectedSolve.scramble && <CopyButton text={selectedSolve.scramble} />}
                    </div>
                    <ScramblePreview puzzle={event} scramble={selectedSolve.scramble} />
                  </section>

                  {/* --- Scramble text --- */}
                  <section className="mt-6 space-y-3">
                    <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                      Scramble
                    </h3>
                    <div className="rounded-2xl border border-black/[0.05] bg-[#FBFAF7] p-4 font-[family-name:var(--font-geist-mono)] text-[0.78rem] leading-relaxed tracking-tight text-neutral-800 break-words whitespace-normal">
                      {selectedSolve.scramble || "—"}
                    </div>
                  </section>

                  {/* --- Note textarea --- */}
                  <section className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                        Notes
                      </h3>
                      <span className="text-[0.6rem] font-light text-neutral-400">
                        Review & reflect
                      </span>
                    </div>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onBlur={handleNoteBlur}
                      placeholder="What went well? What would you do differently next time…"
                      spellCheck={false}
                      rows={5}
                      className="w-full resize-y rounded-2xl border border-black/[0.05] bg-[#FBFAF7] px-4 py-3 text-[0.75rem] leading-relaxed text-neutral-800 outline-none transition-colors placeholder:text-[#C4BCB0] focus:border-black/20 focus:bg-white"
                    />
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    hostEl
  );
}
