"use client";

import { useCallback, useEffect, useState } from "react";
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
import { generateScramble } from "@/lib/scramble";
import {
  getMode,
  type ModeId,
  type Penalty,
  type PuzzleId,
  type Solve,
} from "@/lib/timer-types";

// ============================================================================
// /timer — single-page lightweight timer.
//
// Layout (max-w-5xl centered wrapper, viewport-locked — no vertical scroll):
//   ┌──────────────────────────────────────────────┐
//   │   [ Puzzle ▾ ] [ Mode ▾ ] [ Filter ▾ ]    ⚙  │  Header
//   ├──────────────────────────────────────────────┤
//   │           Scramble  (max-w-2xl centered)      │
//   ├──────────────────────────────────────────────┤
//   │                                               │
//   │             Timer Focus (huge)                │
//   │                                               │
//   ├────────────────────┬─────────────────────────┤
//   │  Stats matrix      │  History Flow          │
//   │  (frameless)       │  ─── fade mask ───      │
//   │                    │  Preview (always on)   │
//   └────────────────────┴─────────────────────────┘
//
// Modals / drawers (no sub-routing):
//   - SettingsDrawer: inspection + voice toggles
//   - SolveDetailModal: opened from History Flow row click
// ============================================================================

const DEFAULT_SESSION = "Default";

export default function TimerPage() {
  // ----- Page state -----------------------------------------------------
  const [puzzle, setPuzzle] = useState<PuzzleId>("3x3x3");
  const [mode, setMode] = useState<ModeId>("WCA");
  const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set());
  const [session, setSession] = useState<string>(DEFAULT_SESSION);
  const [scramble, setScramble] = useState<string>("");
  const [scrambleLoading, setScrambleLoading] = useState<boolean>(false);

  // Settings
  const [inspectionEnabled, setInspectionEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Drawer / modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSolve, setSelectedSolve] = useState<Solve | null>(null);

  // ----- Live data ------------------------------------------------------
  // useLiveQuery auto-subscribes to Dexie — UI refreshes on every DB write.
  const solves = useLiveQuery(
    async () => {
      const list = await db.solves
        .where({ event: puzzle, session })
        .toArray();
      // chronological (oldest first) for AoX math
      list.sort((a, b) => a.date - b.date);
      return list;
    },
    [puzzle, session],
    [] as Solve[],
  ) ?? [];

  // ----- Case-filter management ----------------------------------------
  // When (puzzle, mode) changes, rebuild the selected-cases set so every
  // case index 1..N is selected by default.
  const totalCases = getMode(puzzle, mode).totalCases;
  useEffect(() => {
    setSelectedCases(
      new Set(Array.from({ length: totalCases }, (_, i) => i + 1)),
    );
  }, [totalCases, puzzle, mode]);

  const handleToggleCase = useCallback((n: number) => {
    setSelectedCases((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }, []);

  const handleResetCases = useCallback(() => {
    setSelectedCases(
      new Set(Array.from({ length: totalCases }, (_, i) => i + 1)),
    );
  }, [totalCases]);

  // ----- Scramble generation -------------------------------------------
  // cubing/scramble is loaded inside generateScramble via dynamic import()
  // and only invoked from this effect / handlers — never during SSR.
  const fetchScramble = useCallback(async () => {
    setScrambleLoading(true);
    try {
      const s = await generateScramble(puzzle);
      setScramble(s);
    } catch (e) {
      console.error("Scramble generation failed", e);
      setScramble("");
    } finally {
      setScrambleLoading(false);
    }
  }, [puzzle]);

  useEffect(() => {
    fetchScramble();
  }, [fetchScramble]);

  // ----- Solve recording ----------------------------------------------
  const handleSolve = useCallback(
    async (result: { time: number; penalty: Penalty; inspectionTime: number }) => {
      await addSolve({
        event: puzzle,
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
    [puzzle, session, scramble, fetchScramble],
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

  const handlePuzzleChange = useCallback((p: PuzzleId) => {
    setPuzzle(p);
    setMode("WCA");
    setSession(DEFAULT_SESSION);
  }, []);

  const handleModeChange = useCallback((m: ModeId) => {
    setMode(m);
  }, []);

  const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
  const handleCloseSolveModal = useCallback(() => setSelectedSolve(null), []);

  // Solve list newest-first for display in the history flow.
  const solvesDesc = [...solves].reverse();

  return (
    <div className="w-full h-screen overflow-hidden bg-[#E5E5E5] flex justify-center font-[family-name:var(--font-geist-sans)] text-[#2C2C2C]">
      {/* Centered inner content container — viewport-locked, no scroll */}
      <div className="w-full max-w-5xl h-full p-6 flex flex-col justify-between">
        {/* ---------- Header ---------- */}
        <TimerHeader
          puzzle={puzzle}
          onPuzzleChange={handlePuzzleChange}
          mode={mode}
          onModeChange={handleModeChange}
          selectedCases={selectedCases}
          onToggleCase={handleToggleCase}
          onResetCases={handleResetCases}
          onOpenSettings={handleOpenSettings}
        />

        {/* ---------- Scramble banner ---------- */}
        <div className="flex justify-center py-2">
          <div className="w-full max-w-2xl">
            <ScrambleDisplay
              scramble={scramble}
              loading={scrambleLoading}
              onRefresh={fetchScramble}
            />
          </div>
        </div>

        {/* ---------- Center Focus: Timer ---------- */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-4">
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

          {/* Right column: History flow on top, Preview below */}
          <div className="flex flex-col items-end gap-3">
            <HistoryFlow solves={solvesDesc} onSelect={setSelectedSolve} />
            <ScrambleViewer puzzle={puzzle} scramble={scramble} />
          </div>
        </div>
      </div>

      {/* ---------- Back link (absolute, top-left) ---------- */}
      <Link
        href="/"
        className="fixed left-6 top-6 z-10 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#BBB] transition-colors hover:text-[#2C2C2C] sm:left-8"
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
        onClose={handleCloseSettings}
      />

      {selectedSolve && selectedSolve.id !== undefined && (
        <SolveDetailModal
          solve={selectedSolve}
          onClose={handleCloseSolveModal}
          onPenaltyChange={handlePenaltyChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
