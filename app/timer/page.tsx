"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";

import TimerHeader from "@/components/timer/TimerHeader";
import ScrambleDisplay from "@/components/timer/ScrambleDisplay";
import TimerFocus from "@/components/timer/TimerFocus";
import StatsPanel from "@/components/timer/StatsPanel";
import ScrambleViewer from "@/components/timer/ScrambleViewer";
import HistoryFlow from "@/components/timer/HistoryFlow";
import SolveDetailModal from "@/components/timer/SolveDetailModal";
import SettingsDrawer from "@/components/timer/SettingsDrawer";

import { db, addSolve, deleteSolve, updateSolvePenalty } from "@/lib/db";
import { type Penalty, type Solve, type TimerEvent, type TimerMode } from "@/lib/timer-types";
import { algData2x2, type AlgCase } from "@/data/algs";
import { algData3x3 } from "@/data/algs3x3";

/**
 * Maps our friendly TimerEvent names to cubing.js event IDs accepted by
 * `randomScrambleForEvent`. Kept local since lib/scramble.ts was removed.
 */
const CUBING_EVENT_ID: Record<TimerEvent, string> = {
  "2x2x2": "222",
  "3x3x3": "333",
  "4x4x4": "444",
  "5x5x5": "555",
  "6x6x6": "666",
  "7x7x7": "777",
  "3x3x3 OH": "333oh",
  "3x3x3 BF": "333bf",
  Clock: "clock",
  Megaminx: "minigsm",
  Pyraminx: "pyram",
  Skewb: "skewb",
  "Square-1": "sq1",
};

// ============================================================================
// /timer — single-page lightweight timer.
//
// Layout (viewport-locked, no vertical scroll):
//   ┌──────────────────────────────────────────────┐
//   │            [ 3x3x3 ▾ ] [ WCA ▾ ]     ⚙        │  Header
//   │              [ Filter Cases N/M ]             │  (专项 only)
//   ├──────────────────────────────────────────────┤
//   │           Scramble  (max-w-2xl centered)      │
//   ├──────────────────────────────────────────────┤
//   │                                               │
//   │             Timer Focus (huge, hi-contrast)   │
//   │                                               │
//   ├────────────────────┬─────────────────────────┤
//   │  Stats matrix      │  History Flow          │
//   │  (frameless)       │  Preview (120×90)      │
//   └────────────────────┴─────────────────────────┘
// ============================================================================

/** All supported puzzles, in toolbar display order. */
const EVENTS: TimerEvent[] = [
  "2x2x2",
  "3x3x3",
  "4x4x4",
  "5x5x5",
  "6x6x6",
  "7x7x7",
  "3x3x3 OH",
  "3x3x3 BF",
  "Clock",
  "Megaminx",
  "Pyraminx",
  "Skewb",
  "Square-1",
];

/** Modes available for a given puzzle. */
function modesForEvent(event: TimerEvent): TimerMode[] {
  switch (event) {
    case "2x2x2":
      return ["WCA", "CLL", "EG1", "EG2", "TCLL", "TCLL+", "TCLL-", "LS"];
    case "3x3x3":
      return ["WCA", "OLL", "PLL", "LL"];
    default:
      return ["WCA"];
  }
}

/** Algorithm cases belonging to a 专项 mode (empty for WCA). */
function casesForMode(event: TimerEvent, mode: TimerMode): AlgCase[] {
  if (mode === "WCA") return [];
  const pool =
    event === "2x2x2" ? algData2x2 : event === "3x3x3" ? algData3x3 : [];
  switch (mode) {
    case "CLL":
      return pool.filter((c) => c.set === "CLL");
    case "EG1":
      return pool.filter((c) => c.set === "EG1");
    case "EG2":
      return pool.filter((c) => c.set === "EG2");
    case "TCLL":
      return pool.filter((c) => c.set === "TCLL");
    case "TCLL+":
      return pool.filter((c) => c.set === "TCLL" && c.group === "TCLL+");
    case "TCLL-":
      return pool.filter((c) => c.set === "TCLL" && c.group === "TCLL-");
    case "LS":
      return pool.filter((c) => c.set === "LS");
    case "OLL":
      return pool.filter((c) => c.set === "OLL");
    case "PLL":
      return pool.filter((c) => c.set === "PLL");
    case "LL":
      return pool.filter((c) => c.set === "OLL" || c.set === "PLL");
    default:
      return [];
  }
}

export default function TimerPage() {
  // ----- Page state -----------------------------------------------------
  const [event, setEvent] = useState<TimerEvent>("3x3x3");
  const [mode, setMode] = useState<TimerMode>("WCA");
  const [session, setSession] = useState<string>("Default");
  const [scramble, setScramble] = useState<string>("");
  const [scrambleLoading, setScrambleLoading] = useState<boolean>(false);

  // Settings
  const [inspectionEnabled, setInspectionEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Drawer / modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSolve, setSelectedSolve] = useState<Solve | null>(null);

  // ----- Derived: modes + case counts for the current event/mode --------
  const modes = useMemo(() => modesForEvent(event), [event]);
  const modeCases = useMemo(() => casesForMode(event, mode), [event, mode]);
  const filterTotal = modeCases.length;
  // No case-filter UI yet — all cases for the mode are considered selected.
  const filterSelected = filterTotal;

  // ----- Live data ------------------------------------------------------
  // useLiveQuery auto-subscribes to Dexie — UI refreshes on every DB write.
  const solves = useLiveQuery(
    async () => {
      const list = await db.solves.where({ event, session }).toArray();
      // chronological (oldest first) for AoX math
      list.sort((a, b) => a.date - b.date);
      return list;
    },
    [event, session],
    [] as Solve[],
  ) ?? [];

  // ----- Scramble generation -------------------------------------------
  // cubing.js is imported dynamically inside the function so the rest of the
  // app never touches cubing's module graph at load time.
  const fetchScramble = useCallback(async () => {
    setScrambleLoading(true);
    try {
      const { randomScrambleForEvent } = await import("cubing/scramble");
      const alg = await randomScrambleForEvent(CUBING_EVENT_ID[event]);
      setScramble(alg.toString());
    } catch (e) {
      console.error("Scramble generation failed", e);
      setScramble("");
    } finally {
      setScrambleLoading(false);
    }
  }, [event]);

  useEffect(() => {
    fetchScramble();
  }, [fetchScramble]);

  // ----- Solve recording ----------------------------------------------
  const handleSolve = useCallback(
    async (result: { time: number; penalty: Penalty; inspectionTime: number }) => {
      await addSolve({
        event,
        session,
        time: result.time,
        penalty: result.penalty,
        scramble,
        inspectionTime: result.inspectionTime,
        date: Date.now(),
      });
      // Generate the next scramble automatically.
      fetchScramble();
    },
    [event, session, scramble, fetchScramble],
  );

  const handleDelete = useCallback(async (id: number) => {
    await deleteSolve(id);
    setSelectedSolve(null);
  }, []);

  const handlePenaltyChange = useCallback(
    async (id: number, penalty: Penalty) => {
      await updateSolvePenalty(id, penalty);
      // Live query will refresh — but the in-memory selectedSolve is stale.
      setSelectedSolve((prev) =>
        prev && prev.id === id ? { ...prev, penalty } : prev,
      );
    },
    [],
  );

  // When the puzzle changes, reset mode/session (modes are puzzle-specific).
  const handleEventChange = useCallback((e: TimerEvent) => {
    setEvent(e);
    setMode("WCA");
    setSession("Default");
  }, []);

  // When the mode changes, just regenerate the scramble for the new mode.
  const handleModeChange = useCallback((m: TimerMode) => {
    setMode(m);
  }, []);

  // Solve list newest-first for display in the history flow.
  const solvesDesc = [...solves].reverse();

  return (
    // Outer wrapper — locks the viewport (no vertical scroll) and centers
    // the content column. bg-[#E5E5E5] is the calm grey canvas.
    <div className="w-full h-screen overflow-hidden bg-[#E5E5E5] flex justify-center font-[family-name:var(--font-geist-sans)] text-[#2C2C2C]">
      <div className="w-full max-w-5xl h-full p-6 flex flex-col justify-between">
        {/* ---------- Header ---------- */}
        <TimerHeader
          event={event}
          events={EVENTS}
          mode={mode}
          modes={modes}
          inspectionEnabled={inspectionEnabled}
          filterSelected={filterSelected}
          filterTotal={filterTotal}
          onEventChange={handleEventChange}
          onModeChange={handleModeChange}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* ---------- Scramble banner ---------- */}
        <div className="flex justify-center py-1">
          <div className="w-full max-w-2xl">
            <ScrambleDisplay
              scramble={scramble}
              loading={scrambleLoading}
              onRefresh={fetchScramble}
            />
          </div>
        </div>

        {/* ---------- Center Focus: Timer (absorbs the middle space) ---------- */}
        <div className="flex flex-1 min-h-0 items-center justify-center py-2">
          <TimerFocus
            inspectionEnabled={inspectionEnabled}
            voiceEnabled={voiceEnabled}
            onSolve={handleSolve}
            onRequestNextScramble={fetchScramble}
          />
        </div>

        {/* ---------- Bottom row: Stats (L) + History+Preview (R) ---------- */}
        <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-end">
          <StatsPanel solves={solves} />

          {/* Right column: History on top, Preview below — pinned bottom-right */}
          <div className="flex flex-col items-end gap-2">
            <HistoryFlow solves={solvesDesc} onSelect={setSelectedSolve} />
            <ScrambleViewer puzzle={event} scramble={scramble} />
          </div>
        </div>
      </div>

      {/* ---------- Back link (fixed, top-left) ---------- */}
      <Link
        href="/"
        className="fixed left-6 top-6 z-10 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#999] transition-colors hover:text-[#2C2C2C]"
      >
        &lt;
      </Link>

      {/* ---------- Modals & Drawers ---------- */}
      <SettingsDrawer
        open={settingsOpen}
        inspectionEnabled={inspectionEnabled}
        voiceEnabled={voiceEnabled}
        onToggleInspection={setInspectionEnabled}
        onToggleVoice={setVoiceEnabled}
        onClose={() => setSettingsOpen(false)}
      />

      {selectedSolve && selectedSolve.id !== undefined && (
        <SolveDetailModal
          solve={selectedSolve}
          onClose={() => setSelectedSolve(null)}
          onPenaltyChange={handlePenaltyChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
