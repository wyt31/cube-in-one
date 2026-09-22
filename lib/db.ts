// ============================================================================
// Local async database for the timer, backed by Dexie (IndexedDB).
//
// Schema:
//   - sessions: named solve groups (id, name, createdAt, isDefault)
//   - solves:   one row per recorded solve, linked to a session via sessionId
//
// All access goes through helper functions so the UI never touches Dexie
// directly — this keeps the surface area tiny and easy to mock in tests.
// ============================================================================

import Dexie, { type Table } from "dexie";
import type { Solve, Session, TimerEvent } from "./timer-types";

/**
 * Legacy default session id (pre-v4, when a single global default session was
 * shared across all events). Kept for the one-time migration only.
 */
export const DEFAULT_SESSION_ID = "default-session";

/**
 * Stable id for the always-present default session of a given event.
 * Each event owns its own default session, e.g. "default-session-3x3x3".
 */
export function defaultSessionIdFor(event: TimerEvent): string {
  return `default-session-${event}`;
}

class CubeTimerDB extends Dexie {
  solves!: Table<Solve, number>;
  sessions!: Table<Session, string>;

  constructor() {
    super("CubeTimerDB");
    // v1: initial solves table
    // v2: added session index to solves
    // v3: added sessions table + sessionId index on solves; migration
    //     back-fills sessionId on existing solves that belong to "Default".
    // v4: sessions are now scoped per-event — added `event` index on sessions
    //     so each puzzle has its own default + named sessions.
    this.version(4).stores({
      solves: "++id, event, session, sessionId, date",
      sessions: "id, name, event, createdAt",
    });
  }
}

// Singleton — shared across the whole app.
export const db = new CubeTimerDB();

// ---------- Session CRUD ---------------------------------------------------

/**
 * Ensure the default session for `event` exists (called on first page load
 * and whenever the user switches puzzles).
 */
export async function ensureDefaultSession(event: TimerEvent): Promise<Session> {
  const id = defaultSessionIdFor(event);
  const existing = await db.sessions.get(id);
  if (existing) return existing;
  const def: Session = {
    id,
    name: "Default Session",
    event,
    createdAt: Date.now(),
    isDefault: true,
  };
  await db.sessions.put(def);
  return def;
}

/** List all sessions for `event`, newest first. */
export async function listAllSessions(event: TimerEvent): Promise<Session[]> {
  const all = await db.sessions.where("event").equals(event).toArray();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

/** Create a new named session for `event`. Returns the created Session. */
export async function createSession(
  name: string,
  event: TimerEvent,
): Promise<Session> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Session name cannot be empty");
  const s: Session = {
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    event,
    createdAt: Date.now(),
  };
  await db.sessions.put(s);
  return s;
}

/** Rename a session by id. */
export async function renameSession(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Session name cannot be empty");
  await db.sessions.update(id, { name: trimmed });
  // Also update the denormalized `session` field on solves for backward compat.
  const solves = await db.solves.where("sessionId").equals(id).toArray();
  for (const s of solves) {
    await db.solves.update(s.id!, { session: trimmed });
  }
}

/**
 * Delete a session and all its solves. Default sessions (one per event)
 * cannot be deleted.
 */
export async function deleteSession(id: string, event: TimerEvent): Promise<void> {
  if (id === defaultSessionIdFor(event))
    throw new Error("Cannot delete the default session");
  await db.solves.where("sessionId").equals(id).delete();
  await db.sessions.delete(id);
}

/** Count solves in a session (optionally filtered by event). */
export async function countSolvesInSession(
  sessionId: string,
  event?: TimerEvent,
): Promise<number> {
  if (event) {
    return db.solves
      .where({ sessionId, event })
      .count();
  }
  return db.solves.where("sessionId").equals(sessionId).count();
}

// ---------- Solve CRUD ----------------------------------------------------

export async function addSolve(s: Omit<Solve, "id">): Promise<number> {
  return (await db.solves.add(s as Solve)) as number;
}

export async function deleteSolve(id: number): Promise<void> {
  await db.solves.delete(id);
}

/** Delete multiple solves atomically (batch delete). */
export async function deleteSolves(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await db.solves.bulkDelete(ids);
}

/** Update only the penalty field on an existing solve. */
export async function updateSolvePenalty(
  id: number,
  penalty: Solve["penalty"],
): Promise<void> {
  await db.solves.update(id, { penalty });
}

/** Update only the review note on an existing solve. */
export async function updateSolveNote(
  id: number,
  note: string,
): Promise<void> {
  await db.solves.update(id, { note });
}

export async function clearSession(
  event: TimerEvent,
  sessionId: string,
): Promise<void> {
  await db.solves
    .where({ event, sessionId })
    .delete();
}

/**
 * List solves for a given event + sessionId.
 * Falls back to the legacy `session` (name-based) field for old rows
 * that haven't been migrated to have `sessionId`.
 */
export async function listSolves(
  event: TimerEvent,
  sessionId: string,
  sessionName?: string,
): Promise<Solve[]> {
  // Try sessionId first (new schema).
  const byId = await db.solves
    .where({ event, sessionId })
    .toArray();
  if (byId.length > 0) {
    return byId.sort((a, b) => a.date - b.date);
  }
  // Fallback: old rows without sessionId — match by name.
  if (sessionName) {
    const byName = await db.solves
      .where({ event, session: sessionName })
      .toArray();
    return byName.sort((a, b) => a.date - b.date);
  }
  return [];
}

// ---------- Migration helpers (called once on first load) -----------------

/**
 * One-time migration: backfill `sessionId` on old solves that only have
 * the legacy `session` name field.  Maps "Default" → the per-event default
 * and creates session records for any other legacy names found.
 */
export async function migrateLegacySolves(): Promise<void> {
  const legacy = await db.solves
    .filter((s) => !s.sessionId)
    .toArray();
  if (legacy.length === 0) return;

  // Group by legacy session name.
  const byName = new Map<string, Solve[]>();
  for (const s of legacy) {
    const arr = byName.get(s.session) ?? [];
    arr.push(s);
    byName.set(s.session, arr);
  }

  for (const [name, solves] of Array.from(byName.entries())) {
    let sessionId: string;
    if (name === "Default" || name === "Default Session") {
      // Distribute to per-event defaults based on each solve's event.
      const byEvent = new Map<TimerEvent, number[]>();
      for (const s of solves) {
        const arr = byEvent.get(s.event) ?? [];
        arr.push(s.id!);
        byEvent.set(s.event, arr);
      }
      for (const [event, ids] of Array.from(byEvent)) {
        await ensureDefaultSession(event);
        const target = defaultSessionIdFor(event);
        if (ids.length > 0) {
          await db.solves.bulkUpdate(
            ids.filter(Boolean).map((id) => ({ key: id, changes: { sessionId: target } })),
          );
        }
      }
      continue;
    } else {
      // Create a session record for this legacy name.
      // Assign it to the majority event among its solves (fallback: 3x3x3).
      const events = solves.map((s) => s.event);
      const tally = new Map<TimerEvent, number>();
      for (const e of events) tally.set(e, (tally.get(e) ?? 0) + 1);
      let best: TimerEvent = "3x3x3";
      let bestN = 0;
      for (const [e, n] of Array.from(tally)) {
        if (n > bestN) {
          best = e;
          bestN = n;
        }
      }
      const s = await createSession(name, best);
      sessionId = s.id;
    }
    // Batch-update all solves in this group (only reached for non-Default names).
    const ids = solves.map((s) => s.id!).filter(Boolean);
    if (ids.length > 0) {
      await db.solves.bulkUpdate(
        ids.map((id) => ({ key: id, changes: { sessionId } })),
      );
    }
  }
}

/**
 * One-time migration (v4): redistribute the old global default session
 * ("default-session") into per-event default sessions, and assign an
 * `event` to any session record that still lacks one. Safe to call on
 * every page load — it no-ops once the migration is complete.
 */
export async function migrateSessionsToPerEvent(): Promise<void> {
  // 1. Redistribute solves sitting in the legacy global default session.
  const legacyDefaultSolves = await db.solves
    .where("sessionId")
    .equals(DEFAULT_SESSION_ID)
    .toArray();

  if (legacyDefaultSolves.length > 0) {
    const byEvent = new Map<TimerEvent, number[]>();
    for (const s of legacyDefaultSolves) {
      const arr = byEvent.get(s.event) ?? [];
      arr.push(s.id!);
      byEvent.set(s.event, arr);
    }
    for (const [event, ids] of Array.from(byEvent)) {
      await ensureDefaultSession(event);
      const target = defaultSessionIdFor(event);
      const valid = ids.filter(Boolean);
      if (valid.length > 0) {
        await db.solves.bulkUpdate(
          valid.map((id) => ({ key: id, changes: { sessionId: target } })),
        );
      }
    }
  }

  // Remove the old global default session record (superseded by per-event ones).
  await db.sessions.delete(DEFAULT_SESSION_ID);

  // 2. Backfill `event` on any session record missing it (pre-v4 user sessions).
  // Cast to a looser shape: old records lack `event` at runtime even though
  // the TS interface now marks it required.
  const eventless = await db.sessions
    .filter((s) => !(s as Session & { event?: TimerEvent }).event)
    .toArray();

  for (const s of eventless) {
    // Determine the majority event among this session's solves; fallback 3x3x3.
    const solves = await db.solves.where("sessionId").equals(s.id).toArray();
    const tally = new Map<TimerEvent, number>();
    for (const slv of solves) tally.set(slv.event, (tally.get(slv.event) ?? 0) + 1);
    let best: TimerEvent = "3x3x3";
    let bestN = 0;
    for (const [e, n] of Array.from(tally)) {
      if (n > bestN) {
        best = e;
        bestN = n;
      }
    }
    await db.sessions.update(s.id, { event: best });
  }
}
