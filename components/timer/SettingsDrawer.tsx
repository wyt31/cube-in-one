"use client";

import { useEffect } from "react";

// ============================================================================
// Settings Drawer — inspection toggle, voice cues toggle.
// ============================================================================

export interface SettingsDrawerProps {
  open: boolean;
  inspectionEnabled: boolean;
  voiceEnabled: boolean;
  onToggleInspection: (v: boolean) => void;
  onToggleVoice: (v: boolean) => void;
  onClose: () => void;
}

function ToggleRow({
  title,
  description,
  value,
  onToggle,
}: {
  title: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#EFEFEC] bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tracking-wide text-[#2C2C2C]">{title}</p>
        <p className="mt-1 text-[0.65rem] leading-relaxed tracking-wide text-[#999]">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onToggle(!value)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-300 ${
          value ? "bg-[#2C2C2C]" : "bg-[#E0E0DC]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            value ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsDrawer({
  open,
  inspectionEnabled,
  voiceEnabled,
  onToggleInspection,
  onToggleVoice,
  onClose,
}: SettingsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#E8E2D9] bg-[#FDFDFC] shadow-[-8px_0_32px_rgba(51,51,51,0.06)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[#F0F0EE] px-6 py-5">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#666]">
            Settings
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings drawer"
            className="text-[#999] transition-colors hover:text-[#333]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-2">
            <ToggleRow
              title="WCA Inspection (15s)"
              description="Hold space, then release to begin the 15-second inspection. +2 at 15s, DNF at 17s."
              value={inspectionEnabled}
              onToggle={onToggleInspection}
            />
            <ToggleRow
              title="Voice Cues"
              description="Spoken '8 seconds' and '12 seconds' calls during inspection. Falls back to a beep if speech is unavailable."
              value={voiceEnabled}
              onToggle={onToggleVoice}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
