// ============================================================================
// Local async database for the timer, backed by Dexie (IndexedDB).
//
// Schema: one `solves` table holding everything needed for stats + history.
// All access goes through helper functions so the UI never touches Dexie
// directly — this keeps the surface area tiny and easy to mock in tests.
// ============================================================================

import Dexie, { type Table } from "dexie";
import type { Solve, TimerEvent } from "./timer-types";

class CubeTimerDB extends Dexie {
  solves!: Table<Solve, number>;

  constructor() {
    super("CubeTimerDB");
    // ++id        auto-increment primary key
    // event, session, date  indexed for fast filter / sort
    this.version(1).stores({
      solves: "++id, event, session, date",
    });
  }
}

// Singleton — shared across the whole app.
export const db = new CubeTimerDB();

// ---------- CRUD helpers ----------------------------------------------------

export async function addSolve(s: Omit<Solve, "id">): Promise<number> {
  return (await db.solves.add(s as Solve)) as number;
}

export async function deleteSolve(id: number): Promise<void> {
  await db.solves.delete(id);
}

/** Update only the penalty field on an existing solve. */
export async function updateSolvePenalty(
  id: number,
  penalty: Solve["penalty"],
): Promise<void> {
  await db.solves.update(id, { penalty });
}

export async function clearSession(
  event: TimerEvent,
  session: string,
): Promise<void> {
  await db.solves
    .where({ event, session })
    .delete();
}

export async function listSolves(
  event: TimerEvent,
  session: string,
): Promise<Solve[]> {
  return db.solves
    .where({ event, session })
    .reverse()
    .sortBy("date");
}

/** Distinct session names that exist for a given event, newest first. */
export async function listSessions(event: TimerEvent): Promise<string[]> {
  const all = await db.solves.where("event").equals(event).toArray();
  const seen = new Map<string, number>(); // session -> latest date
  for (const s of all) {
    const prev = seen.get(s.session) ?? 0;
    if (s.date > prev) seen.set(s.session, s.date);
  }
  return Array.from(seen.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}
