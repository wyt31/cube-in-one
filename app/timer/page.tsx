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

import { db, addSolve, deleteSolve, updateSolvePenalty, listSessions } from "@/lib/db";
import { generateScramble } from "@/lib/scramble";
import { type Penalty, type Solve, type TimerEvent } from "@/lib/timer-types";

// ============================================================================
// /timer — single-page lightweight timer.
//
// Layout (max-w-5xl centered wrapper):
//   ┌──────────────────────────────────────────────┐
//   │   [ Puzzle | Mode | Case ]        ⚙          │  Header
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

const EVENTS: TimerEvent[] = ["2x2x2", "3x3x3", "4x4x4", "5x5x5"];

const PUZZLE_LABEL: Record<TimerEvent, "2x2" | "3x3" | "4x4" | "5x5"> = {
  "2x2x2": "2x2",
  "3x3x3": "3x3",
  "4x4x4": "4x4",
  "5x5x5": "5x5",
};

export default function TimerPage() {
  // ----- Page state -----------------------------------------------------
  const [event, setEvent] = useState<TimerEvent>("3x3x3");
  const [session, setSession] = useState<string>("Default");
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
        .where({ event, session })
        .toArray();
      // chronological (oldest first) for AoX math
      list.sort((a, b) => a.date - b.date);
      return list;
    },
    [event, session],
    [] as Solve[],
  ) ?? [];

  const sessionNames = useLiveQuery(
    () => listSessions(event),
    [event],
    ["Default"],
  ) ?? ["Default"];

  // ----- Scramble generation -------------------------------------------
  const fetchScramble = useCallback(async () => {
    setScrambleLoading(true);
    try {
      const s = await generateScramble(event);
      setScramble(s);
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

  const handleEventChange = useCallback((e: TimerEvent) => {
    setEvent(e);
    setSession("Default");
  }, []);

  // Solve list newest-first for display in the history flow.
  const solvesDesc = [...solves].reverse();

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-[family-name:var(--font-geist-sans)] text-[#2C2C2C]">
      {/* Centered outer wrapper — max-w-5xl keeps the layout calm on wide screens */}
      <div className="mx-auto flex h-screen w-full max-w-5xl flex-col justify-between px-6 py-6 sm:px-8">
        {/* ---------- Header ---------- */}
        <TimerHeader
          event={event}
          events={EVENTS}
          session={session}
          sessions={sessionNames}
          inspectionEnabled={inspectionEnabled}
          onEventChange={handleEventChange}
          onSessionChange={setSession}
          onToggleInspection={() => setInspectionEnabled((v) => !v)}
          onOpenSettings={() => setSettingsOpen(true)}
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
        <div className="flex flex-1 items-center justify-center py-4">
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
            <ScrambleViewer puzzle={PUZZLE_LABEL[event]} scramble={scramble} />
          </div>
        </div>
      </div>

      {/* ---------- Back link (absolute, bottom-left) ---------- */}
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
