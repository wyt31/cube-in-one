"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cueAt8s, cueAt12s, speak } from "@/lib/speech";
import { formatTime, type Penalty } from "@/lib/timer-types";

// ============================================================================
// TimerFocus — the core timer state machine.
//
// Lifecycle (WCA-flavoured):
//
//   idle
//     │  user holds space / touches screen
//     ▼
//   holding        (awaiting 250ms hold to register intent)
//     │  hold confirmed → green "ready"
//     ▼
//   ready
//     │  release
//     ▼
//   inspecting     (15s WCA inspection; voice cues at 8s + 12s)
//     │   T <= 15s + spacebar down   → ready2 (hold to start solve)
//     │   T >  15s                    → +2 penalty, still inspecting
//     │   T >  17s                    → DNF, back to idle
//     ▼
//   ready2
//     │  release   → running
//   running
//     │  press     → stopped
//   stopped
//     │  short release / press → idle (and a new solve is recorded upstream)
//
// Keyboard:
//   Spacebar hold (mousedown equivalent) drives every state transition.
// Touch:
//   Single tap on the focus surface mirrors a press-release cycle.
// ============================================================================

type Phase =
  | "idle"
  | "holding"
  | "ready"
  | "inspecting"
  | "ready2"
  | "running"
  | "stopped";

const HOLD_MS = 250;            // press-and-hold threshold
const INSPECT_LIMIT_MS = 15000; // WCA +2 threshold
const INSPECT_DNF_MS = 17000;   // WCA DNF threshold
const CUE_8S = 8000;
const CUE_12S = 12000;

export interface TimerFocusProps {
  inspectionEnabled: boolean;
  voiceEnabled: boolean;
  /** Called when a solve completes. */
  onSolve: (result: {
    time: number;
    penalty: Penalty;
    inspectionTime: number;
  }) => void;
  /** Triggered when a fresh scramble should be generated (after a stop). */
  onRequestNextScramble: () => void;
}

// Helper: translate phase -> tailwind color state
function phaseColor(p: Phase): string {
  switch (p) {
    case "ready":
    case "ready2":
      return "text-[#7BA17B]"; // calm green
    case "inspecting":
      return "text-[#B8A33A]"; // amber-ish
    case "running":
      return "text-[#2C2C2C]";
    case "stopped":
      return "text-[#2C2C2C]";
    default:
      return "text-[#999]";
  }
}

function phaseBg(p: Phase): string {
  switch (p) {
    case "ready":
    case "ready2":
      return "bg-[#7BA17B]/5";
    case "inspecting":
      return "bg-[#B8A33A]/5";
    case "stopped":
      return "bg-[#2C2C2C]/[0.03]";
    default:
      return "bg-transparent";
  }
}

export default function TimerFocus({
  inspectionEnabled,
  voiceEnabled,
  onSolve,
  onRequestNextScramble,
}: TimerFocusProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayMs, setDisplayMs] = useState<number>(0);
  const [inspectMs, setInspectMs] = useState<number>(0);
  const [penalty, setPenalty] = useState<Penalty>(0);

  // Mutable refs used by the animation / cue loops so we don't re-subscribe
  // listeners on every state change.
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const startRef = useRef<number>(0);
  const inspectStartRef = useRef<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const finalTimeRef = useRef<number>(0);
  const penaltyRef = useRef<Penalty>(0);
  const cue8Ref = useRef<boolean>(false);
  const cue12Ref = useRef<boolean>(false);
  const voiceRef = useRef<boolean>(voiceEnabled);

  useEffect(() => {
    voiceRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Keep phaseRef in sync for use inside rAF / event closures.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---- Animation loop ------------------------------------------------
  const tick = useCallback(() => {
    const now = performance.now();
    if (phaseRef.current === "running") {
      setDisplayMs(now - startRef.current);
    } else if (phaseRef.current === "inspecting") {
      const elapsed = now - inspectStartRef.current;
      setInspectMs(elapsed);

      // Voice cues (only fire once each)
      if (voiceRef.current) {
        if (!cue8Ref.current && elapsed >= CUE_8S) {
          cue8Ref.current = true;
          cueAt8s();
        }
        if (!cue12Ref.current && elapsed >= CUE_12S) {
          cue12Ref.current = true;
          cueAt12s();
        }
      }

      // +2 boundary
      if (penaltyRef.current === 0 && elapsed >= INSPECT_LIMIT_MS) {
        penaltyRef.current = 2;
        setPenalty(2);
        if (voiceRef.current) speak("+2");
      }
      // DNF boundary
      if (elapsed >= INSPECT_DNF_MS) {
        penaltyRef.current = -1;
        setPenalty(-1);
        // Stop inspection and drop back to idle with a DNF record.
        finalizeSolve(0, -1, elapsed);
        return;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ---- Solve finalisation -------------------------------------------
  const finalizeSolve = useCallback(
    (time: number, pen: Penalty, inspectTime: number) => {
      stopLoop();
      finalTimeRef.current = time;
      penaltyRef.current = pen;
      setPenalty(pen);
      setPhase("stopped");
      phaseRef.current = "stopped";
      setDisplayMs(time);
      onSolve({ time, penalty: pen, inspectionTime: inspectTime });
    },
    [onSolve, stopLoop],
  );

  // ---- Press / release handlers -------------------------------------
  const handlePressDown = useCallback(() => {
    const p = phaseRef.current;
    if (p === "stopped") return; // ignore — requires explicit release+press

    if (p === "running") {
      // Stop the timer.
      const time = performance.now() - startRef.current;
      finalizeSolve(time, 0, 0);
      return;
    }

    if (p === "inspecting") {
      // Holding during inspection → ready2 (about to start solving).
      setPhase("ready2");
      phaseRef.current = "ready2";
      return;
    }

    if (p === "idle" || p === "ready") {
      // Start the 250ms hold timer. If held long enough, enter "ready".
      setPhase("holding");
      phaseRef.current = "holding";
      holdTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current !== "holding") return;
        setPhase("ready");
        phaseRef.current = "ready";
      }, HOLD_MS);
    }
  }, [finalizeSolve]);

  const handleRelease = useCallback(() => {
    const p = phaseRef.current;

    // Clear any pending hold timer
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (p === "ready") {
      // Released after holding — enter inspection (or running if disabled).
      if (inspectionEnabled) {
        inspectStartRef.current = performance.now();
        cue8Ref.current = false;
        cue12Ref.current = false;
        penaltyRef.current = 0;
        setPenalty(0);
        setInspectMs(0);
        setPhase("inspecting");
        phaseRef.current = "inspecting";
        startLoop();
      } else {
        // Skip inspection entirely — start running immediately.
        startRef.current = performance.now();
        setDisplayMs(0);
        setPhase("running");
        phaseRef.current = "running";
        startLoop();
      }
      return;
    }

    if (p === "ready2") {
      // Release after holding during inspection → start the solve.
      startRef.current = performance.now();
      setDisplayMs(0);
      setPhase("running");
      phaseRef.current = "running";
      // inspection loop is already running; we keep it going only to capture
      // the final inspectionTime snapshot before stopping.
      const inspectTime = performance.now() - inspectStartRef.current;
      stopLoop();
      // Start a *running* loop (replaces inspection loop).
      startRef.current = performance.now();
      setDisplayMs(0);
      setPhase("running");
      phaseRef.current = "running";
      // Stash inspection time so finalizeSolve can pass it on.
      inspectStartRef.current = performance.now() - inspectTime;
      // Re-arm the loop for running mode.
      startLoop();
      // Reset inspection refs so the running loop doesn't double-fire cues.
      cue8Ref.current = true;
      cue12Ref.current = true;
      return;
    }

    if (p === "stopped") {
      // Reset to idle and ask for a new scramble.
      setPhase("idle");
      phaseRef.current = "idle";
      setDisplayMs(0);
      setInspectMs(0);
      setPenalty(0);
      penaltyRef.current = 0;
      onRequestNextScramble();
      return;
    }

    // Holding but released before threshold → back to idle.
    if (p === "holding") {
      setPhase("idle");
      phaseRef.current = "idle";
    }
  }, [inspectionEnabled, onRequestNextScramble, startLoop, stopLoop]);

  // ---- Keyboard wiring ----------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      // Prevent page scroll on space
      if (e.repeat) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handlePressDown();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      handleRelease();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [handlePressDown, handleRelease]);

  // ---- Cleanup on unmount -------------------------------------------
  useEffect(() => {
    return () => {
      stopLoop();
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, [stopLoop]);

  // ---- Display value ------------------------------------------------
  let display: string;
  if (phase === "inspecting") {
    // Inspection countdown: show remaining seconds (15 - elapsed).
    const remaining = Math.max(0, 15000 - inspectMs);
    const secs = Math.ceil(remaining / 1000);
    display = penalty === 2 ? "+2" : String(secs);
  } else if (phase === "running" || phase === "stopped") {
    display = formatTime(displayMs);
  } else if (phase === "ready" || phase === "ready2") {
    display = "00.00";
  } else if (phase === "holding") {
    display = "...";
  } else {
    display = "00.00";
  }

  // Phase hint
  const hint =
    phase === "idle"
      ? "Hold space to start"
      : phase === "holding"
      ? "Keep holding…"
      : phase === "ready"
      ? "Release to inspect"
      : phase === "inspecting"
      ? penalty === 2
        ? "+2 — press to start"
        : "Inspecting…"
      : phase === "ready2"
      ? "Release to start"
      : phase === "running"
      ? "Press to stop"
      : penalty === -1
      ? "DNF"
      : "Tap to continue";

  return (
    <button
      type="button"
      onMouseDown={handlePressDown}
      onMouseUp={handleRelease}
      onMouseLeave={() => {
        // Treat mouse-leave as a release to avoid stuck states
        if (phaseRef.current === "holding") handleRelease();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        handlePressDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleRelease();
      }}
      className={`flex h-full min-h-[260px] w-full flex-col items-center justify-center rounded-3xl border border-transparent px-6 py-10 transition-colors duration-300 ${phaseBg(
        phase,
      )} cursor-pointer select-none focus:outline-none`}
      aria-label="Timer focus area — press and hold space or tap to control"
    >
      <span
        className={`font-[family-name:var(--font-geist-mono)] text-6xl font-light tabular-nums tracking-tight transition-colors duration-300 sm:text-8xl ${phaseColor(
          phase,
        )} ${phase === "ready" || phase === "ready2" ? "scale-[1.02]" : ""}`}
      >
        {display}
      </span>
      <span className="mt-6 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#BBB]">
        {hint}
      </span>
    </button>
  );
}
