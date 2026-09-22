"use client";

import { memo, useState } from "react";
import TrainerModal from "@/components/trainer/TrainerModal";

// ============================================================
// TrainerEntry (memoized)
//
// Owns trainerOpen state so SearchHome does NOT re-render when
// the user opens/closes the trainer modal.  When setTrainerOpen
// fires, only this component re-renders; the three sibling
// cards (Timer, Algs, What's Next) and the full home content
// tree are untouched because they don't depend on this state.
// ============================================================
function TrainerEntryImpl() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-black/[0.04] bg-black/[0.015] outline-none transition-colors duration-200 hover:border-black/10 hover:bg-white focus-visible:ring-2 focus-visible:ring-black/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 transition-colors duration-200 group-hover:text-neutral-800" aria-hidden>
          <path d="M12 2l3 6 6 .5-4.5 4.5L18 20l-6-3.5L6 20l1.5-7L3 8.5 9 8z" />
        </svg>
        <div className="text-center">
          <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-neutral-800">
            Trainer
          </h3>
          <p className="mt-0.5 text-[0.55rem] text-neutral-300">
            Brain gym
          </p>
        </div>
      </div>

      <TrainerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export const TrainerEntry = memo(TrainerEntryImpl);
export default TrainerEntry;
