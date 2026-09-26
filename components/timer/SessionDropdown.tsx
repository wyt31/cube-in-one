"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@/lib/timer-types";

// ============================================================================
// SessionDropdown — replaces the old SelectCapsule for sessions.
//
// Features:
//   ▸ Click the capsule to open a dropdown panel.
//   ▸ Each row shows session name + solve count (e.g. "Default Session (25)").
//   ▸ Switch: click a row → active session changes.
//   ▸ Create: inline input at the bottom → "＋ New" creates a session.
//   ▸ Rename: pencil icon → inline edit mode per row.
//   ▸ Delete: trash icon → 2-step confirm (default session cannot be deleted).
//
// The capsule itself mirrors the liquid-glass style of the old SelectCapsule
// so it blends with the Puzzle/Mode capsules in the header.
// ============================================================================

export interface SessionDropdownProps {
  sessions: Session[];
  activeSessionId: string;
  /** solve counts keyed by sessionId (for the "(N)" badge per row) */
  solveCounts: Record<string, number>;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function SessionDropdown({
  sessions,
  activeSessionId,
  solveCounts,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: SessionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const createInputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setNewName("");
        setEditingId(null);
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // Reset delete-confirm after 3.5s.
  useEffect(() => {
    if (!deleteConfirmId) return;
    const t = window.setTimeout(() => setDeleteConfirmId(null), 3500);
    return () => window.clearTimeout(t);
  }, [deleteConfirmId]);

  // Focus the appropriate input when entering create / edit mode.
  useEffect(() => {
    if (creating) createInputRef.current?.focus();
  }, [creating]);
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const label = activeSession?.name ?? "—";

  // Always pin the default session to the top, regardless of its name.
  // Sorting is stable, so the relative order of non-default sessions is
  // preserved (by creation order from listAllSessions).
  const orderedSessions = [...sessions].sort((a, b) => {
    if (!!a.isDefault === !!b.isDefault) return 0;
    return a.isDefault ? -1 : 1;
  });

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName("");
    setCreating(false);
  };

  const handleRenameSave = () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (trimmed) onRename(editingId, trimmed);
    setEditingId(null);
    setEditName("");
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
    <div ref={rootRef} className="relative">
      {/* --- Capsule trigger --- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-[#E8E8E4] dark:border-white/8 bg-white/80 dark:bg-white/5 px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-colors hover:border-neutral-800/40 dark:hover:border-white/30"
      >
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-neutral-800 dark:text-neutral-200">
          {label}
        </span>
        <span aria-hidden className="text-[0.6rem] leading-none text-[#9A9A95] dark:text-neutral-500">
          ▾
        </span>
      </button>

      {/* --- Dropdown panel --- */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-64 max-h-[360px] overflow-y-auto rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-900 p-1.5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)]"
        >
          {/* Session rows */}
          {orderedSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const isEditing = editingId === s.id;
            const isDeleteConfirm = deleteConfirmId === s.id;
            const count = solveCounts[s.id] ?? 0;
            return (
              <div
                key={s.id}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                  isActive ? "bg-neutral-800/[0.04] dark:bg-white/[0.04]" : "hover:bg-black/[0.03] dark:hover:bg-white/10"
                }`}
              >
                {/* Active dot */}
                <span
                  className={`flex h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors ${
                    isActive ? "bg-neutral-800" : "bg-transparent"
                  }`}
                />

                {/* Name + count, or inline edit input */}
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleRenameSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSave();
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditName("");
                      }
                    }}
                    className="flex-1 rounded-md border border-neutral-800/20 dark:border-white/15 bg-white dark:bg-zinc-900 px-2 py-1 text-[0.72rem] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(s.id);
                      setOpen(false);
                    }}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-[0.72rem] font-medium text-neutral-800 dark:text-neutral-200">
                      {s.name}
                    </span>
                    <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.04] px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] tabular-nums text-[0.55rem] text-neutral-400 dark:text-neutral-500">
                      {count}
                    </span>
                    {s.isDefault && (
                      <span className="text-[0.5rem] uppercase tracking-wider text-neutral-300 dark:text-neutral-600">
                        default
                      </span>
                    )}
                  </button>
                )}

                {/* Action icons (not in edit mode) */}
                {!isEditing && (
                  <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Rename */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(s.id);
                        setEditName(s.name);
                      }}
                      aria-label={`Rename ${s.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-black/[0.05] dark:hover:bg-white/10 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {/* Delete (not for default session) */}
                    {!s.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(s.id)}
                        aria-label={`Delete ${s.name}`}
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                          isDeleteConfirm
                            ? "bg-[#C04848] text-white"
                            : "text-neutral-400 dark:text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/10 hover:text-[#C04848]"
                        }`}
                      >
                        {isDeleteConfirm ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* --- Create new session --- */}
          <div className="mt-1 border-t border-black/[0.06] dark:border-white/8 pt-1.5">
            {creating ? (
              <div className="flex items-center gap-1.5 px-2 py-1">
                <input
                  ref={createInputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") {
                      setCreating(false);
                      setNewName("");
                    }
                  }}
                  placeholder="Session name…"
                  className="flex-1 rounded-md border border-neutral-800/20 dark:border-white/15 bg-white dark:bg-zinc-900 px-2 py-1.5 text-[0.72rem] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-md bg-neutral-800 px-2.5 py-1.5 text-[0.6rem] font-semibold text-white transition-colors hover:bg-neutral-900"
                >
                  Create
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/10"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800/[0.06] dark:bg-white/[0.06] text-[0.7rem] text-neutral-800 dark:text-neutral-200">
                  +
                </span>
                <span className="text-[0.72rem] font-medium text-neutral-500 dark:text-neutral-400">
                  New Session
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
