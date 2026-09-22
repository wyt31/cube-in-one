"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cueAt8s, cueAt12s, speak } from "@/lib/speech";
import { formatTime, type Penalty } from "@/lib/timer-types";

// ============================================================================
// TimerFocus — the core timer state machine.
//
// When WCA Inspection is ENABLED:
//
//   idle
//     │  press & hold space
//     ▼
//   holding         (preparing; never green, never starts countdown)
//     │  release → enters inspection
//     ▼
//   inspecting       (15s WCA inspection; voice cues at 8s + 12s)
//     │   press space → ready2 (green, "00.00")
//     │   release from ready2 → RUNNING (starts solve)
//     ├── T > 15s → +2 penalty (warning, keeps running)
//     └── T > 17s → DNF penalty (warning, keeps running)
//
//   IMPORTANT: Inspection NEVER auto-terminates. Even at +2 or DNF, the
//   user can press & release Space to start the timer. The inspection
//   penalty (0/2/-1) is carried into the solve and applied when the timer stops.
//
// When WCA Inspection is DISABLED:
//
//   idle
//     │  LONG HOLD (press for 250 ms, then keep holding)
//     ▼
//   ready (green)
//     │  release from ready
//     ▼
//   running
//
//   running
//     │  any press / tap
//     ▼
//   stopped  (penalty = inspection penalty applied to raw time)
//
// Keyboard: Spacebar drives every transition (press + release).
// Touch / Click: the focus surface mirrors press-release cycles.
// ============================================================================

type Phase =
  | "idle"
  | "holding"
  | "ready"
  | "inspecting"
  | "ready2"
  | "running"
  | "stopped";

const HOLD_MS = 250;              // long-hold threshold for green-ready
const INSPECT_LIMIT_MS = 15000;   // WCA +2 threshold
const INSPECT_DNF_MS = 17000;     // WCA DNF threshold
const CUE_8S = 8000;
const CUE_12S = 12000;

export interface TimerFocusProps {
  inspectionEnabled: boolean;
  voiceEnabled: boolean;
  /** Latest solve to display during idle — typically the most recent in session. */
  idleDisplaySolve?: { time: number; penalty: Penalty } | null;
  /** Called when a solve completes (running → stopped). */
  onSolve: (result: {
    time: number;
    penalty: Penalty;
    inspectionTime: number;
  }) => void;
  /** Triggered when a fresh scramble should be generated (after stopped idle). */
  onRequestNextScramble: () => void;
  /** Optional — fires whenever the timer phase changes. */
  onPhaseChange?: (p: Phase) => void;
}

// Phase → colour (high-contrast near-black as default, accent for states).
function phaseColor(p: Phase, penalty: Penalty): string {
  switch (p) {
    case "ready":
    case "ready2":
      return "text-emerald-600";
    case "inspecting":
      return penalty === 2 || penalty === -1 ? "text-red-600" : "text-amber-600";
    case "stopped":
      return penalty === -1 ? "text-red-600" : "text-neutral-900";
    case "running":
      return "text-neutral-900";
    default:
      return "text-neutral-900";
  }
}

function phaseBg(p: Phase): string {
  switch (p) {
    case "ready":
    case "ready2":
      return "bg-emerald-500/10";
    case "inspecting":
      return "bg-amber-500/10";
    case "stopped":
      return "bg-[#2C2C2C]/[0.03]";
    default:
      return "bg-transparent";
  }
}

export default function TimerFocus({
  inspectionEnabled,
  voiceEnabled,
  idleDisplaySolve,
  onSolve,
  onRequestNextScramble,
  onPhaseChange,
}: TimerFocusProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayMs, setDisplayMs] = useState<number>(0);
  const [inspectMs, setInspectMs] = useState<number>(0);
  const [penalty, setPenalty] = useState<Penalty>(0);

  // Mutable refs — avoid re-subscribing listeners on every state change.
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const startRef = useRef<number>(0);
  const inspectStartRef = useRef<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const pressedAtRef = useRef<number>(0);
  const cue8Ref = useRef<boolean>(false);
  const cue12Ref = useRef<boolean>(false);
  const voiceRef = useRef<boolean>(voiceEnabled);

  // Inspection penalty ref — carries the inspection result (0/2/-1) from
  // the inspection phase into the running phase, so it can be applied when
  // the timer stops.  This decouples the penalty from re-render cycles.
  // IMPORTANT: the final value is set at the RELEASE moment (ready2→running),
  // NOT during tick — to avoid race conditions where a tick might miss the
  // exact boundary frame.
  const inspectPenaltyRef = useRef<Penalty>(0);
  // Display penalty ref — visual warnings only (for UI feedback during
  // inspection overtime).  The actual penalty is computed at release.
  const displayPenaltyRef = useRef<Penalty>(0);
  // Stashed inspection time (ms) for the onSolve callback.
  const inspectTimeRef = useRef<number>(0);

  useEffect(() => {
    voiceRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Keep phase ref in sync for rAF / event closures, and notify the parent.
  useEffect(() => {
    phaseRef.current = phase;
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // ---- Animation loop ------------------------------------------------
  // Uses refs exclusively for logic — no state in dependency array, so the
  // rAF callback identity is stable for the lifetime of the component.
  // Tracks inspection time during BOTH "inspecting" and "ready2" phases so
  // the timer keeps running while the user holds Space (green ready state).
  const tick = useCallback(() => {
    const now = performance.now();
    if (phaseRef.current === "running") {
      setDisplayMs(now - startRef.current);
    } else if (phaseRef.current === "inspecting" || phaseRef.current === "ready2") {
      const elapsed = now - inspectStartRef.current;
      setInspectMs(elapsed);

      // Voice cues fire during BOTH inspecting and ready2 — the user
      // may be holding Space (green) when 8s/12s is crossed.
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

      // Visual warnings — display only.  The ACTUAL penalty is computed at
      // the release moment (ready2→running) based on total inspection time,
      // so we don't set inspectPenaltyRef here.
      if (displayPenaltyRef.current === 0 && elapsed >= INSPECT_LIMIT_MS) {
        displayPenaltyRef.current = 2;
        setPenalty(2);
        if (voiceRef.current) speak("+2");
      }
      if (displayPenaltyRef.current === 2 && elapsed >= INSPECT_DNF_MS) {
        displayPenaltyRef.current = -1;
        setPenalty(-1);
        if (voiceRef.current) speak("DNF");
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
    if (p === "stopped") return; // requires explicit release+press

    if (p === "running") {
      // Pressing during running stops the timer — apply inspection penalty.
      const time = performance.now() - startRef.current;
      finalizeSolve(time, inspectPenaltyRef.current, inspectTimeRef.current);
      return;
    }

    pressedAtRef.current = performance.now();

    if (p === "inspecting") {
      // Pressing space during inspection → green ready2 ("00.00").
      // Release from ready2 → start running (handled in handleRelease).
      setPhase("ready2");
      phaseRef.current = "ready2";
      return;
    }

    if (p === "idle" || p === "ready") {
      if (inspectionEnabled) {
        // Inspection enabled: enter holding state on press. No hold timer —
        // stays in holding regardless of press duration (never green).
        // On release → enters 15s inspection (handled in handleRelease).
        setPhase("holding");
        phaseRef.current = "holding";
      } else {
        // Inspection disabled — long hold → ready (green).
        setPhase("holding");
        phaseRef.current = "holding";
        holdTimerRef.current = window.setTimeout(() => {
          if (phaseRef.current !== "holding") return;
          setPhase("ready");
          phaseRef.current = "ready";
        }, HOLD_MS);
      }
    }
  }, [finalizeSolve, inspectionEnabled]);

  const handleRelease = useCallback(() => {
    const p = phaseRef.current;
    const now = performance.now();
    const heldFor = pressedAtRef.current ? now - pressedAtRef.current : 0;

    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (p === "stopped") {
      // Reset to idle and request a fresh scramble.
      setPhase("idle");
      phaseRef.current = "idle";
      setDisplayMs(0);
      setInspectMs(0);
      setPenalty(0);
      inspectPenaltyRef.current = 0;
      displayPenaltyRef.current = 0;
      inspectTimeRef.current = 0;
      onRequestNextScramble();
      return;
    }

    if (p === "running") {
      // Release during running is a no-op; we stop on the press event.
      return;
    }

    if (p === "ready") {
      // Released from green → start solving (skip inspection).
      // Equivalent to "inspection disabled" old behaviour.
      startRef.current = performance.now();
      setDisplayMs(0);
      setPhase("running");
      phaseRef.current = "running";
      inspectPenaltyRef.current = 0;
      inspectTimeRef.current = 0;
      stopLoop();
      cue8Ref.current = true;
      cue12Ref.current = true;
      startLoop();
      return;
    }

    if (p === "ready2") {
      // Released while green during inspection → start the solve.
      // Compute the FINAL penalty at the release moment based on total
      // inspection time. This avoids race conditions where a tick might
      // miss the exact boundary frame (e.g. press at 14.9s, release at 15.1s
      // → correctly gets +2 even if no tick fired between 15.0 and 15.1s).
      const inspectTime = performance.now() - inspectStartRef.current;
      let pen: Penalty = 0;
      if (inspectTime > INSPECT_DNF_MS) pen = -1;
      else if (inspectTime > INSPECT_LIMIT_MS) pen = 2;

      inspectPenaltyRef.current = pen;
      inspectTimeRef.current = inspectTime;

      startRef.current = performance.now();
      setDisplayMs(0);
      setPhase("running");
      phaseRef.current = "running";
      stopLoop();
      // Re-arm loop for running (no inspection cues).
      cue8Ref.current = true;
      cue12Ref.current = true;
      startLoop();
      return;
    }

    if (p === "holding") {
      // Released before hitting HOLD_MS → short press → Inspection flow.
      if (inspectionEnabled) {
        inspectStartRef.current = performance.now();
        inspectPenaltyRef.current = 0;
        displayPenaltyRef.current = 0;
        inspectTimeRef.current = 0;
        cue8Ref.current = false;
        cue12Ref.current = false;
        setPenalty(0);
        setInspectMs(0);
        setPhase("inspecting");
        phaseRef.current = "inspecting";
        startLoop();
      } else {
        // Inspection disabled — short press starts solve directly.
        startRef.current = performance.now();
        setDisplayMs(0);
        setPhase("running");
        phaseRef.current = "running";
        inspectPenaltyRef.current = 0;
        inspectTimeRef.current = 0;
        startLoop();
      }
      return;
    }

    if (p === "inspecting") {
      // Quick tap during inspection — no-op, stay in inspection.
      return;
    }

    // Safety net: fall back to idle.
    if (p === "idle" || heldFor === 0) {
      setPhase("idle");
      phaseRef.current = "idle";
    }
  }, [inspectionEnabled, onRequestNextScramble, startLoop, stopLoop]);

  // ---- Keyboard wiring ----------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
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
    if (penalty === -1) {
      display = "DNF";
    } else if (penalty === 2) {
      display = "+2";
    } else {
      const remaining = Math.max(0, 15000 - inspectMs);
      const secs = Math.ceil(remaining / 1000);
      display = String(secs);
    }
  } else if (phase === "running" || phase === "stopped") {
    display = formatTime(displayMs);
  } else if (phase === "ready") {
    display = "00.00";
  } else if (phase === "ready2") {
    // Show current inspection penalty state while holding Space (green).
    // Gives real-time feedback: "+2" or "DNF" if past the thresholds.
    display = penalty === -1 ? "DNF" : penalty === 2 ? "+2" : "00.00";
  } else if (phase === "holding") {
    display = "...";
  } else {
    // IDLE — show the latest solve result, or 0.00 if no solves exist.
    if (idleDisplaySolve && idleDisplaySolve.time > 0) {
      if (idleDisplaySolve.penalty === -1) {
        display = "DNF";
      } else if (idleDisplaySolve.penalty === 2) {
        display = formatTime(idleDisplaySolve.time + 2000) + "+";
      } else {
        display = formatTime(idleDisplaySolve.time);
      }
    } else {
      display = "0.00";
    }
  }

  // Phase hint — matches the trigger model.
  const hint =
    phase === "idle"
      ? inspectionEnabled
        ? "Press & release space to start inspection"
        : "Long hold + release to start"
      : phase === "holding"
      ? "Keep holding…"
      : phase === "ready"
      ? "Release to start"
      : phase === "inspecting"
      ? penalty === -1
        ? "DNF — hold space then release to start"
        : penalty === 2
        ? "+2 — hold space then release to start"
        : "Inspecting · hold space then release to start"
      : phase === "ready2"
      ? "Release to start"
      : phase === "running"
      ? "Press space to stop"
      : penalty === -1
      ? "DNF · tap to continue"
      : penalty === 2
      ? "+2 · tap to continue"
      : "Tap to continue";

  return (
    <button
      type="button"
      onMouseDown={handlePressDown}
      onMouseUp={handleRelease}
      onMouseLeave={() => {
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
      className={`flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-transparent px-6 pb-8 transition-colors duration-300 ${phaseBg(
        phase,
      )} cursor-pointer select-none focus:outline-none`}
      aria-label="Timer focus area"
      data-hint={hint}
    >
      <span
        className={`font-[family-name:var(--font-geist-mono)] text-5xl font-bold tabular-nums tracking-tight transition-colors duration-300 sm:text-6xl md:text-7xl lg:text-8xl ${phaseColor(
          phase,
          penalty,
        )}`}
      >
        {display}
      </span>
    </button>
  );
}
