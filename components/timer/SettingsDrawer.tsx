"use client";

import { useEffect, useRef, useState } from "react";

import { type InputMode, type Solve, type Session, type TimerEvent, finalTime, formatTime } from "@/lib/timer-types";
import { listSolves } from "@/lib/db";

// ============================================================================
// Settings Drawer — input mode switch, inspection toggle, voice cues toggle.
// The Input Mode card carries a micro help icon (?) that opens a concise
// syntax guide Modal covering both Timer and Typing modes.
// A Data Management section at the bottom exports the current session's
// solves as a CSV file.
// ============================================================================

export interface SettingsDrawerProps {
  open: boolean;
  inputMode: InputMode;
  inspectionEnabled: boolean;
  voiceEnabled: boolean;
  onToggleInspection: (v: boolean) => void;
  onToggleVoice: (v: boolean) => void;
  onChangeInputMode: (v: InputMode) => void;
  onClose: () => void;
  solves: Solve[];
  sessionName: string;
  sessions: Session[];
  event: TimerEvent;
}

function ToggleRow({
  title,
  description,
  value,
  onToggle,
  disabled,
}: {
  title: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-[#EFEFEC] dark:border-white/8 bg-white dark:bg-zinc-900 p-4 transition-opacity duration-300 ${
        disabled ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tracking-wide text-[#2C2C2C] dark:text-neutral-200">{title}</p>
        <p className="mt-1 text-[0.65rem] leading-relaxed tracking-wide text-[#999] dark:text-neutral-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onToggle(!value)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-300 ${
          disabled
            ? "cursor-not-allowed"
            : "cursor-pointer"
        } ${
          value ? "bg-[#2C2C2C]" : "bg-[#E0E0DC] dark:bg-white/10"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/** Inline key / snippet styling, shared with the guide Modal. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-neutral-100 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[0.7rem] text-[#666] dark:text-neutral-400">
      {children}
    </code>
  );
}

function InputModeRow({
  value,
  onChange,
  onHelp,
}: {
  value: InputMode;
  onChange: (v: InputMode) => void;
  onHelp: () => void;
}) {
  const options: { key: InputMode; label: string }[] = [
    { key: "timer", label: "Timer" },
    { key: "typing", label: "Typing" },
  ];
  return (
    <div className="rounded-2xl border border-[#EFEFEC] dark:border-white/8 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium tracking-wide text-[#2C2C2C] dark:text-neutral-200">Input Mode</p>
        <button
          type="button"
          onClick={onHelp}
          aria-label="Input mode syntax guide"
          className="text-[#999] dark:text-neutral-500 opacity-50 transition-opacity hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
            <path
              d="M5 5.5a2 2 0 1 1 3 1.7c-.5.3-.5.5-.5.8"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="7" cy="10" r="0.5" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-[#EFEFEC] dark:border-white/8 bg-[#F6F6F3] dark:bg-white/[0.04] p-1">
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              aria-pressed={active}
              className={`rounded-full py-2 text-xs font-medium tracking-wide transition-colors duration-300 ${
                active ? "bg-[#2C2C2C] text-white shadow-sm" : "text-[#999] dark:text-neutral-500 hover:text-[#555] dark:hover:text-neutral-400"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[0.7rem] leading-relaxed text-[#666] dark:text-neutral-400">
      <span className="mt-[0.5em] h-1 w-1 flex-shrink-0 rounded-full bg-[#CCC] dark:bg-white/30" />
      <span className="flex-1">{children}</span>
    </li>
  );
}

function SyntaxGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 px-4 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border border-[#EFEFEC] dark:border-white/8 bg-[#fbfbf9] dark:bg-zinc-900 p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_8px_32px_rgba(51,51,51,0.08)] transition-transform duration-300 ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#999] dark:text-neutral-500">
            Guide
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="text-[#999] dark:text-neutral-500 transition-colors hover:text-[#333] dark:hover:text-neutral-200"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Timer Mode section */}
        <div className="mb-6">
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#2C2C2C] dark:text-neutral-200">
            Timer Mode
          </p>
          <ul className="flex flex-col gap-2.5">
            <Bullet>
              <span className="font-medium text-[#444] dark:text-neutral-200">Hold &amp; Release:</span>{" "}
              Hold <Kbd>Space</Kbd> to prepare, release when green to start.
            </Bullet>
            <Bullet>
              <span className="font-medium text-[#444] dark:text-neutral-200">WCA Inspection:</span>{" "}
              (If enabled) Press <Kbd>Space</Kbd> to start 15s inspection. Hold
              &amp; release <Kbd>Space</Kbd> to start timing. Overtime applies{" "}
              <Kbd>+2</Kbd> (&gt;15s) or <Kbd>DNF</Kbd> (&gt;17s).
            </Bullet>
            <Bullet>
              <span className="font-medium text-[#444] dark:text-neutral-200">Stop:</span> Press{" "}
              <Kbd>Space</Kbd> to stop timing.
            </Bullet>
          </ul>
        </div>

        {/* Typing Mode section */}
        <div>
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#2C2C2C] dark:text-neutral-200">
            Typing Mode
          </p>
          <ul className="flex flex-col gap-2.5">
            <Bullet>
              <span className="font-medium text-[#444] dark:text-neutral-200">Shorthand:</span>{" "}
              <Kbd>1052</Kbd> &rarr; <Kbd>10.52</Kbd> | <Kbd>10052</Kbd> &rarr;{" "}
              <Kbd>1:00.52</Kbd>
            </Bullet>
            <Bullet>
              <span className="font-medium text-[#444] dark:text-neutral-200">Penalties &amp; Quick Fix:</span>{" "}
              Append <Kbd>+</Kbd> or <Kbd>d</Kbd> for current time (e.g.{" "}
              <Kbd>3.75+</Kbd>, <Kbd>10.5d</Kbd>). Type a standalone{" "}
              <Kbd>+</Kbd> or <Kbd>d</Kbd>, then press <Kbd>Enter</Kbd> to
              penalty your last solve.{" "}
              <span className="text-[#999] dark:text-neutral-500">(Hope you won&apos;t need this too often lol)</span>
            </Bullet>
            <Bullet>
              <span className="font-medium text-[#444] dark:text-neutral-200">Actions:</span>{" "}
              <Kbd>Enter</Kbd> to save | <Kbd>Esc</Kbd> to clear
            </Bullet>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// CSV export — builds a UTF-8 CSV string from the current session's solves and
// triggers a browser download.
// ----------------------------------------------------------------------------
function exportSolvesCsv(solves: Solve[], sessionName: string) {
  if (solves.length === 0) return;
  const header = ["#", "Date", "Time", "Penalty", "Final", "Scramble", "Note"];
  const rows = solves.map((s, i) => {
    const d = new Date(s.date);
    const dateStr = d.toISOString().replace("T", " ").slice(0, 19);
    const ft = finalTime(s);
    const penaltyLabel = s.penalty === -1 ? "DNF" : s.penalty === 2 ? "+2" : "";
    const finalStr = ft === null ? "DNF" : formatTime(ft);
    return [
      String(i + 1),
      dateStr,
      formatTime(s.time),
      penaltyLabel,
      finalStr,
      (s.scramble || "").replace(/"/g, '""'),
      (s.note || "").replace(/"/g, '""'),
    ];
  });
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = sessionName.replace(/[^a-zA-Z0-9-_]/g, "_") || "session";
  a.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// Export all sessions — fetches solves for every session in `sessions`, groups
// them by session name in the CSV, and triggers a single combined download.
// ----------------------------------------------------------------------------
async function exportAllSessionsCsv(
  sessions: Session[],
  event: TimerEvent,
) {
  const header = ["Session", "#", "Date", "Time", "Penalty", "Final", "Scramble", "Note"];
  const lines: string[] = [header.map((c) => `"${c}"`).join(",")];

  for (const sess of sessions) {
    const solves = await listSolves(event, sess.id, sess.name);
    if (solves.length === 0) continue;
    // Blank separator row before each session group.
    lines.push('"","","","","","","",""');
    // Session name row.
    lines.push(`"=== ${sess.name} ===","","","","","","",""`);
    solves.forEach((s, i) => {
      const d = new Date(s.date);
      const dateStr = d.toISOString().replace("T", " ").slice(0, 19);
      const ft = finalTime(s);
      const penaltyLabel = s.penalty === -1 ? "DNF" : s.penalty === 2 ? "+2" : "";
      const finalStr = ft === null ? "DNF" : formatTime(ft);
      const row = [
        sess.name,
        String(i + 1),
        dateStr,
        formatTime(s.time),
        penaltyLabel,
        finalStr,
        (s.scramble || "").replace(/"/g, '""'),
        (s.note || "").replace(/"/g, '""'),
      ];
      lines.push(row.map((c) => `"${c}"`).join(","));
    });
  }

  const csv = lines.join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `all_sessions_${event}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SettingsDrawer({
  open,
  inputMode,
  inspectionEnabled,
  voiceEnabled,
  onToggleInspection,
  onToggleVoice,
  onChangeInputMode,
  onClose,
  solves,
  sessionName,
  sessions,
  event,
}: SettingsDrawerProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  // Mirror helpOpen into a ref so the Esc handler (stable across renders) can
  // decide whether to close the guide first or the drawer.
  const helpOpenRef = useRef(false);
  useEffect(() => {
    helpOpenRef.current = helpOpen;
  }, [helpOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (helpOpenRef.current) {
          setHelpOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Typing mode renders WCA Inspection and Voice Cues irrelevant — dim and
  // lock them so the user knows they don't apply.
  const typingDisabled = inputMode === "typing";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/5 dark:bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#E8E2D9] dark:border-white/8 bg-[#FDFDFC] dark:bg-zinc-900 shadow-[-8px_0_32px_rgba(51,51,51,0.06)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[#F0F0EE] dark:border-white/8 px-6 py-5">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#666] dark:text-neutral-400">
            Settings
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings drawer"
            className="text-[#999] dark:text-neutral-500 transition-colors hover:text-[#333] dark:hover:text-neutral-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-2">
            <InputModeRow
              value={inputMode}
              onChange={onChangeInputMode}
              onHelp={() => setHelpOpen(true)}
            />
            <ToggleRow
              title="WCA Inspection (15s)"
              description="Hold space, then release to begin the 15-second inspection. +2 at 15s, DNF at 17s."
              value={inspectionEnabled}
              onToggle={onToggleInspection}
              disabled={typingDisabled}
            />
            <ToggleRow
              title="Voice Cues"
              description="Spoken '8 seconds' and '12 seconds' calls during inspection. Falls back to a beep if speech is unavailable."
              value={voiceEnabled}
              onToggle={onToggleVoice}
              disabled={typingDisabled}
            />

            {/* ---------- Data Management ---------- */}
            <div className="mt-4 rounded-2xl border border-[#EFEFEC] dark:border-white/8 bg-white dark:bg-zinc-900 p-4">
              <p className="text-sm font-medium tracking-wide text-[#2C2C2C] dark:text-neutral-200">
                Data Management
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => exportSolvesCsv(solves, sessionName)}
                  disabled={solves.length === 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium tracking-wide transition-colors duration-300 ${
                    solves.length === 0
                      ? "cursor-not-allowed bg-[#F0F0EE] dark:bg-white/[0.04] text-[#BBB] dark:text-neutral-500"
                      : "bg-[#2C2C2C] text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export This Session (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => exportAllSessionsCsv(sessions, event)}
                  disabled={sessions.length === 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium tracking-wide transition-colors duration-300 ${
                    sessions.length === 0
                      ? "cursor-not-allowed bg-[#F0F0EE] dark:bg-white/[0.04] text-[#BBB] dark:text-neutral-500"
                      : "border border-[#E0E0DC] dark:border-white/8 bg-white dark:bg-zinc-900 text-[#555] dark:text-neutral-400 hover:border-[#2C2C2C] dark:hover:border-white/30 hover:text-[#2C2C2C] dark:hover:text-neutral-200"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export All Sessions (CSV)
                </button>
                <p className="text-center text-[0.6rem] tracking-wide text-[#BBB] dark:text-neutral-500">
                  {solves.length} solve{solves.length === 1 ? "" : "s"} in this session · {sessions.length} session{sessions.length === 1 ? "" : "s"} total
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <SyntaxGuideModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
