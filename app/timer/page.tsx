"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";

import TimerHeader from "@/components/timer/TimerHeader";
import ScrambleDisplay from "@/components/timer/ScrambleDisplay";
import TimerFocus from "@/components/timer/TimerFocus";
import ManualTimeInput from "@/components/timer/ManualTimeInput";
import StatsPanel from "@/components/timer/StatsPanel";
import ScrambleViewer from "@/components/timer/ScrambleViewer";
import SolveDetailModal from "@/components/timer/SolveDetailModal";
import SettingsDrawer from "@/components/timer/SettingsDrawer";
import HistoryModal from "@/components/timer/HistoryModal";
import AverageDetailModal from "@/components/timer/AverageDetailModal";
import CaseFilterModal from "@/components/timer/CaseFilterModal";

import {
  addSolve,
  deleteSolve,
  updateSolvePenalty,
  listSolves,
  listAllSessions,
  ensureDefaultSession,
  createSession,
  renameSession,
  deleteSession,
  countSolvesInSession,
  migrateLegacySolves,
  migrateSessionsToPerEvent,
  defaultSessionIdFor,
} from "@/lib/db";
import { type Penalty, type Solve, type Session, type TimerEvent, type TimerMode, type InputMode } from "@/lib/timer-types";
import { algData2x2, type AlgCase } from "@/data/algs";
import { algData3x3 } from "@/data/algs3x3";
import { genLocalScramble } from "@/lib/scramble-fallback";

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
  Megaminx: "minx",
  Pyraminx: "pyram",
  Skewb: "skewb",
  "Square-1": "sq1",
};

// ============================================================================
// /timer — single-page lightweight timer.
//
// New features implemented:
//   1. Short press = Inspection; long hold + release = start solving.
//   2. Scramble banner fades out while "running", fades back in on stop and
//      auto-advances to the next scramble in the history.
//   3. HistoryFlow shows the last 10 solves with a compact scroll.
//   4. HistoryFlow has "Select" mode with checkboxes and an in-line
//      "Confirm delete" 2-step batch-delete button.
//      Single solve "Delete solve" button in SolveDetailModal also now
//      has a built-in confirm step.
//   5. ScrambleDisplay uses [← Last] [Next →] navigation over a history
//      buffer + a "New" pill to generate fresh scrambles.
//   6. Typing mode: type a time (or penalty command) and press Enter.
//      Toggle between Timer and Typing in Settings.
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

type Phase =
  | "idle"
  | "holding"
  | "ready"
  | "inspecting"
  | "ready2"
  | "running"
  | "stopped";

export default function TimerPage() {
  // ----- Page state -----------------------------------------------------
  const [event, setEvent] = useState<TimerEvent>("3x3x3");
  const [mode, setMode] = useState<TimerMode>("WCA");
  const [activeSessionId, setActiveSessionId] = useState<string>(
    defaultSessionIdFor("3x3x3"),
  );

  // --- One-time migration: back-fill sessionId on legacy solves + split
  //     the old global default session into per-event defaults. ---
  useEffect(() => {
    (async () => {
      await migrateSessionsToPerEvent();
      await migrateLegacySolves();
      // Ensure a default session exists for the initial event.
      await ensureDefaultSession(event);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Active session persistence (localStorage, keyed per-event) ---
  // Each puzzle remembers its own last-used session so switching puzzles
  // never leaks a 3x3x3 session into 2x2x2 (or vice versa).
  // Also ensures this event's default session record exists in the DB the
  // first time the user opens the puzzle.
  useEffect(() => {
    (async () => {
      await ensureDefaultSession(event);
      const stored = localStorage.getItem(`activeSessionId-${event}`);
      if (stored) {
        setActiveSessionId(stored);
      } else {
        setActiveSessionId(defaultSessionIdFor(event));
      }
    })();
  }, [event]);

  // Persist the active session id for this event. Uses the effective id
  // (which falls back to the event's default when the stored id is stale),
  // but this effect is declared after `effectiveSessionId` is computed below.
  // --- Sessions list (live query, scoped to the active event) ---
  const sessions = useLiveQuery(
    async () => listAllSessions(event),
    [event],
    [] as Session[],
  ) ?? [];

  // --- Solve counts per session (for the dropdown badges) ---
  const solveCounts = useLiveQuery(
    async () => {
      const counts: Record<string, number> = {};
      for (const s of sessions) {
        counts[s.id] = await countSolvesInSession(s.id, event);
      }
      return counts;
    },
    [sessions, event],
    {} as Record<string, number>,
  ) ?? {};

  // Current session object (for display name / denormalized field).
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // If the active session id doesn't belong to the current event's session
  // list (e.g. after switching puzzles or if a stored id is stale), fall back
  // to this event's default session so the UI always has a valid selection.
  const effectiveSessionId = activeSession ? activeSessionId : defaultSessionIdFor(event);
  const effectiveSessionName = activeSession?.name ?? "Default Session";

  // Persist the (effective) active session id for this event.
  useEffect(() => {
    localStorage.setItem(`activeSessionId-${event}`, effectiveSessionId);
  }, [event, effectiveSessionId]);

  // Scramble history buffer (shared across all 专项). The current scramble
  // displayed is scramblesHistory[scrambleIdx], newest is at the end.
  const [scramblesHistory, setScramblesHistory] = useState<string[]>([]);
  const [scrambleIdx, setScrambleIdx] = useState<number>(-1);
  const [scrambleLoading, setScrambleLoading] = useState<boolean>(false);

  // Current phase from TimerFocus — used to hide scramble during running.
  const [phase, setPhase] = useState<Phase>("idle");

  // Settings
  const [inspectionEnabled, setInspectionEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Input mode: space-bar Timer vs manual Typing. Persisted so the user's
  // preferred entry surface survives reloads; read in an effect to avoid any
  // SSR/client hydration mismatch.
  const [inputMode, setInputMode] = useState<InputMode>("timer");

  // When switching to Typing mode, WCA Inspection and Voice Cues are locked
  // off (they don't apply). We snapshot the current values so they can be
  // restored when the user switches back to Timer mode.
  const savedInspectionRef = useRef(true);
  const savedVoiceRef = useRef(true);

  const handleChangeInputMode = useCallback(
    (mode: InputMode) => {
      if (mode === "typing") {
        savedInspectionRef.current = inspectionEnabled;
        savedVoiceRef.current = voiceEnabled;
        setInspectionEnabled(false);
        setVoiceEnabled(false);
      } else {
        setInspectionEnabled(savedInspectionRef.current);
        setVoiceEnabled(savedVoiceRef.current);
      }
      setInputMode(mode);
    },
    [inspectionEnabled, voiceEnabled],
  );

  // If the page loads directly into typing mode (from localStorage), ensure
  // inspection/voice are off — the saved refs default to true so a later
  // switch back to Timer will restore them.
  useEffect(() => {
    const stored = localStorage.getItem("timer-input-mode");
    if (stored === "typing") {
      setInputMode("typing");
      setInspectionEnabled(false);
      setVoiceEnabled(false);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("timer-input-mode", inputMode);
  }, [inputMode]);

  // Drawer / modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyInitialSolveId, setHistoryInitialSolveId] = useState<number | null>(null);
  const [avgDetail, setAvgDetail] = useState<{
    type: "ao5" | "ao12" | "ao50" | "ao100";
    kind: "best" | "current";
  } | null>(null);
  const [selectedSolve, setSelectedSolve] = useState<Solve | null>(null);
  const [caseFilterOpen, setCaseFilterOpen] = useState(false);

  // ----- Case filter state (per event+mode, persisted in localStorage) ----
  const caseFilterKey = `timer-caseFilter-${event}-${mode}`;
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(caseFilterKey);
      if (stored) return new Set(JSON.parse(stored));
    } catch {}
    return new Set();
  });

  // Reset filter when event/mode changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`timer-caseFilter-${event}-${mode}`);
      if (stored) setSelectedCaseIds(new Set(JSON.parse(stored)));
      else setSelectedCaseIds(new Set());
    } catch {
      setSelectedCaseIds(new Set());
    }
  }, [event, mode]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(caseFilterKey, JSON.stringify(Array.from(selectedCaseIds)));
    } catch {}
  }, [caseFilterKey, selectedCaseIds]);

  // ----- Derived: modes + case counts for the current event/mode --------
  const modes = useMemo(() => modesForEvent(event), [event]);
  const modeCases = useMemo(() => casesForMode(event, mode), [event, mode]);
  const filterTotal = modeCases.length;
  // When the filter set is empty, treat it as "all selected" (default behavior).
  const filterSelected = selectedCaseIds.size > 0
    ? modeCases.filter((c) => selectedCaseIds.has(c.id)).length
    : filterTotal;

  // ----- Live data ------------------------------------------------------
  const solves = useLiveQuery(
    async () => listSolves(event, effectiveSessionId, effectiveSessionName),
    [event, effectiveSessionId, effectiveSessionName],
    [] as Solve[],
  ) ?? [];

  // Latest solve mirror — lets the penalty-command handler read the most
  // recent solve without putting the live `solves` array in its callback
  // deps (which would re-create the callback on every render).
  const latestSolveRef = useRef<Solve | null>(null);
  useEffect(() => {
    latestSolveRef.current = solves.length > 0 ? solves[solves.length - 1] : null;
  }, [solves]);

  // ----- Scramble generation + history ---------------------------------
  // cubing.js is loaded from the official CDN at runtime via native ESM.
  // If the CDN module or its web worker fails to load (network, CORS,
  // browser restrictions), fall back to a local pseudo-random generator
  // so the timer never shows a blank scramble.
  const generateOne = useCallback(async (): Promise<string> => {
    try {
      const mod = await import(
        /* webpackIgnore: true */
        "https://cdn.cubing.net/v0/js/cubing/scramble"
      );
      const alg = await mod.randomScrambleForEvent(CUBING_EVENT_ID[event]);
      return String(alg.toString());
    } catch (e) {
      console.warn("[scramble] CDN generation failed, using local fallback:", e);
      return genLocalScramble(event);
    }
  }, [event]);

  /** Push a brand-new scramble onto the history and point index at it. */
  const pushNewScramble = useCallback(async () => {
    setScrambleLoading(true);
    try {
      const s = await generateOne();
      setScramblesHistory((prev) => {
        const next = [...prev, s];
        // Keep history bounded; 200 entries is plenty for Last/Next.
        const bounded = next.length > 200 ? next.slice(next.length - 200) : next;
        // Always set the current index to the newest entry right after push.
        setScrambleIdx(bounded.length - 1);
        return bounded;
      });
    } catch (e) {
      console.error("Scramble generation failed", e);
    } finally {
      setScrambleLoading(false);
    }
  }, [generateOne]);

  // Initialize scramble on mount + when puzzle changes.
  useEffect(() => {
    // When event changes, wipe history (different puzzle scrambles aren't
    // interchangeable for Last/Next).
    setScramblesHistory([]);
    setScrambleIdx(-1);
    // Kick off a fresh scramble for the puzzle.
    (async () => {
      setScrambleLoading(true);
      try {
        const s = await generateOne();
        setScramblesHistory([s]);
        setScrambleIdx(0);
      } catch (e) {
        console.error("Scramble generation failed", e);
      } finally {
        setScrambleLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  /**
   * Generate a fresh scramble, append it to the history, and focus it.
   * Shared by the space-bar solve flow and the manual-typing solve flow.
   */
  const advanceScramble = useCallback(async () => {
    setScrambleLoading(true);
    try {
      const s = await generateOne();
      setScramblesHistory((prev) => {
        const next = [...prev, s];
        const bounded = next.length > 200 ? next.slice(next.length - 200) : next;
        setScrambleIdx(bounded.length - 1);
        return bounded;
      });
    } catch (e) {
      console.error("Scramble generation failed", e);
    } finally {
      setScrambleLoading(false);
    }
  }, [generateOne]);

  /**
   * Scramble navigation.
   *  - Last (delta = -1): step back one entry in the history buffer.
   *  - Next (delta = +1): always generate a fresh scramble and append it to
   *    the history — equivalent to a "refresh". Infinite clicks allowed.
   */
  const handleScrambleNav = useCallback(
    (delta: -1 | 1) => {
      if (delta === 1) {
        void pushNewScramble();
      } else {
        setScrambleIdx((i) => Math.max(0, i - 1));
      }
    },
    [pushNewScramble],
  );

  const currentScramble =
    scrambleIdx >= 0 && scrambleIdx < scramblesHistory.length
      ? scramblesHistory[scrambleIdx]
      : "";

  // ----- Solve recording ----------------------------------------------
  const handleSolve = useCallback(
    async (result: { time: number; penalty: Penalty; inspectionTime: number }) => {
      await addSolve({
        event,
        session: effectiveSessionName,
        sessionId: effectiveSessionId,
        time: result.time,
        penalty: result.penalty,
        scramble: currentScramble,
        inspectionTime: result.inspectionTime,
        date: Date.now(),
      });
      // Generate the next scramble so the user lands on a new one.
      await advanceScramble();
    },
    [event, effectiveSessionId, effectiveSessionName, currentScramble, advanceScramble],
  );

  /**
   * Manual entry path: a parsed solve from ManualTimeInput is persisted with
   * its raw text + isPsc=false, then the scramble advances for the next solve.
   */
  const handleManualSolve = useCallback(
    async ({ time, penalty, rawInput }: { time: number; penalty: Penalty; rawInput: string }) => {
      await addSolve({
        event,
        session: effectiveSessionName,
        sessionId: effectiveSessionId,
        time,
        penalty,
        scramble: currentScramble,
        rawInput,
        isPsc: false,
        date: Date.now(),
      });
      await advanceScramble();
    },
    [event, effectiveSessionId, effectiveSessionName, currentScramble, advanceScramble],
  );

  /**
   * Standalone "+" / "d" commands: apply +2 / DNF to the most recent solve
   * in the current session. Reads the latest solve from a ref so the callback
   * identity stays stable.
   */
  const handlePenaltyCommand = useCallback(
    async (penalty: 2 | -1) => {
      const latest = latestSolveRef.current;
      if (!latest || latest.id === undefined) return;
      await updateSolvePenalty(latest.id, penalty);
    },
    [],
  );

  const handleDelete = useCallback(async (id: number) => {
    await deleteSolve(id);
    setSelectedSolve(null);
  }, []);

  const handlePenaltyChange = useCallback(
    async (id: number, penalty: Penalty) => {
      await updateSolvePenalty(id, penalty);
      setSelectedSolve((prev) =>
        prev && prev.id === id ? { ...prev, penalty } : prev,
      );
    },
    [],
  );

  // When the puzzle changes, reset mode (modes are puzzle-specific).
  // The active session is swapped by the per-event persistence effect above,
  // so a 3x3x3 session never leaks into 2x2x2 (or vice versa).
  const handleEventChange = useCallback((e: TimerEvent) => {
    setEvent(e);
    setMode("WCA");
  }, []);

  // When the mode changes, just regenerate the scramble for the new mode.
  const handleModeChange = useCallback((m: TimerMode) => {
    setMode(m);
  }, []);

  // --- Session CRUD handlers ---
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleCreateSession = useCallback(
    async (name: string) => {
      const s = await createSession(name, event);
      setActiveSessionId(s.id);
    },
    [event],
  );

  const handleRenameSession = useCallback(async (id: string, name: string) => {
    await renameSession(id, name);
  }, []);

  const handleDeleteSession = useCallback(
    async (id: string) => {
      await deleteSession(id, event);
      // If the deleted session was active, fall back to this event's default.
      if (id === effectiveSessionId) {
        setActiveSessionId(defaultSessionIdFor(event));
      }
    },
    [effectiveSessionId, event],
  );

  // Track whether the scramble banner should be visible:
  // - Hide ONLY during running (timer is active, user focusing on the cube)
  // - Keep visible during ready/ready2 so the layout doesn't shift and the
  //   timer number stays put while the user holds Space.
  const scrambleVisible = phase !== "running";

  // During running, hide ALL non-timer UI elements for distraction-free solving.
  const isRunning = phase === "running";

  return (
    // Outer wrapper — locks the viewport (no vertical scroll) and centers
    // the content column. bg-[#E5E5E5] is the calm grey canvas.
    <div className="w-full h-screen overflow-hidden bg-[#E5E5E5] flex justify-center font-[family-name:var(--font-geist-sans)] text-[#2C2C2C]">
      <div
        className="timer-page-root w-full h-full px-4 py-3 transition-all duration-200 sm:px-12 sm:py-4 md:px-[6vw] flex flex-col gap-2 max-w-[min(1400px,92vw)]"
      >
        {/* ---------- Header (hidden during running) ---------- */}
        <div
          className={`flex-shrink-0 transition-all duration-200 ${
            isRunning ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
        <TimerHeader
          event={event}
          events={EVENTS}
          mode={mode}
          modes={modes}
          sessions={sessions}
          activeSessionId={effectiveSessionId}
          solveCounts={solveCounts}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          filterSelected={filterSelected}
          filterTotal={filterTotal}
          onEventChange={handleEventChange}
          onModeChange={handleModeChange}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenCaseFilter={() => setCaseFilterOpen(true)}
        />
        </div>

        {/* ---------- Scramble banner (fades out during running, keeps height to avoid layout shift) ---------- */}
        <div
          className={`flex flex-shrink-0 justify-center overflow-hidden transition-all duration-300 ${
            scrambleVisible
              ? "min-h-[140px] opacity-100"
              : "min-h-[140px] opacity-0"
          }`}
        >
          <div className="w-full">
            <ScrambleDisplay
              scramble={currentScramble}
              loading={scrambleLoading}
              event={event}
              historyIndex={scrambleIdx}
              onNav={handleScrambleNav}
            />
          </div>
        </div>

        {/* ---------- Main area: Center Timer or Typing input ---------- */}
        <div className="flex flex-1 min-h-0 items-center justify-center">
          {inputMode === "typing" ? (
            <ManualTimeInput
              onSubmit={handleManualSolve}
              onPenaltyCommand={handlePenaltyCommand}
            />
          ) : (
            <TimerFocus
              inspectionEnabled={inspectionEnabled}
              voiceEnabled={voiceEnabled}
              idleDisplaySolve={solves.length > 0 ? solves[solves.length - 1] : null}
              onSolve={handleSolve}
              onRequestNextScramble={() => {
                if (
                  scramblesHistory.length === 0 ||
                  scrambleIdx === scramblesHistory.length - 1
                ) {
                  void pushNewScramble();
                } else {
                  setScrambleIdx((i) =>
                    Math.min(i + 1, scramblesHistory.length - 1),
                  );
                }
              }}
              onPhaseChange={setPhase}
            />
          )}
        </div>

        {/* ---------- Bottom bar: Stats (left) | Preview (right) — hidden during running ---------- */}
        <div
          className={`flex flex-shrink-0 items-end justify-between transition-all duration-200 ${
            isRunning ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <StatsPanel
            solves={solves}
            onSingleClick={(solveId) => {
              setHistoryInitialSolveId(solveId);
              setHistoryOpen(true);
            }}
            onAverageClick={(type, kind) => {
              setAvgDetail({ type, kind });
            }}
          />
          <ScrambleViewer puzzle={event} scramble={currentScramble} />
        </div>
      </div>

      {/* ---------- Back link (fixed, top-left) — hidden during running ---------- */}
      <Link
        href="/"
        className={`fixed left-6 top-6 z-10 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#999] transition-all duration-200 hover:text-[#2C2C2C] ${
          isRunning ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        &lt;
      </Link>

      {/* ---------- Modals & Drawers ---------- */}
      <SettingsDrawer
        open={settingsOpen}
        inputMode={inputMode}
        inspectionEnabled={inspectionEnabled}
        voiceEnabled={voiceEnabled}
        onToggleInspection={setInspectionEnabled}
        onToggleVoice={setVoiceEnabled}
        onChangeInputMode={handleChangeInputMode}
        onClose={() => setSettingsOpen(false)}
        solves={solves}
        sessionName={effectiveSessionName}
        sessions={sessions}
        event={event}
      />

      {selectedSolve && selectedSolve.id !== undefined && (
        <SolveDetailModal
          solve={selectedSolve}
          onClose={() => setSelectedSolve(null)}
          onPenaltyChange={handlePenaltyChange}
          onDelete={handleDelete}
        />
      )}

      <HistoryModal
        open={historyOpen}
        solves={solves}
        event={event}
        initialSolveId={historyInitialSolveId}
        onClose={() => {
          setHistoryOpen(false);
          setHistoryInitialSolveId(null);
        }}
        onPenaltyChange={handlePenaltyChange}
        onDeleteSolve={handleDelete}
      />

      <AverageDetailModal
        open={avgDetail !== null}
        solves={solves}
        type={avgDetail?.type ?? "ao5"}
        kind={avgDetail?.kind ?? "current"}
        onClose={() => setAvgDetail(null)}
      />

      <CaseFilterModal
        open={caseFilterOpen}
        modeLabel={`${event.replace("x", "×").replace("×3", "3")}${mode !== "WCA" ? ` ${mode}` : ""}`}
        cases={modeCases}
        selectedIds={selectedCaseIds}
        onClose={() => setCaseFilterOpen(false)}
        onApply={(ids) => setSelectedCaseIds(ids)}
      />
    </div>
  );
}
