// ============================================================================
// Inspection voice cues — Web Speech API with a synthesized fallback.
//
// WCA inspection calls:
//   "8 seconds"   at T=8s   (warning)
//   "12 seconds"  at T=12s  (final warning)
//
// Beyond 15s the timer page applies +2 automatically; beyond 17s a DNF —
// these are handled in the TimerFocus state machine, not here.
// ============================================================================

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  // Prefer an en-US female-ish voice for warm, calm delivery.
  cachedVoice =
    voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|zira/i.test(v.name)) ??
    voices.find((v) => /en/i.test(v.lang)) ??
    voices[0];
  return cachedVoice;
}

// Ensure voices are loaded on browsers that populate them asynchronously.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

/**
 * Speak a short cue via the Web Speech API. Falls back to a short Web Audio
 * beep if speech synthesis is unavailable.
 */
export function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (typeof window === "undefined") return;

  if ("speechSynthesis" in window) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = opts.rate ?? 1.05;
      u.pitch = opts.pitch ?? 1;
      u.volume = 1;
      // Cancel any pending queue so cues don't pile up if the timer state
      // changes rapidly.
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return;
    } catch {
      // fall through to beep
    }
  }

  // Fallback: short Web Audio beep at ~660Hz, 150ms.
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Silent fallback — nothing else we can do.
  }
}

/** Convenience: speak the WCA 8-second warning cue. */
export function cueAt8s() {
  speak("8 seconds");
}

/** Convenience: speak the WCA 12-second final-warning cue. */
export function cueAt12s() {
  speak("12 seconds");
}
