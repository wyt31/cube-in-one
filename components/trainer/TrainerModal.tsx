"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface TrainerModalProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================
// 2x2 Mini Cube Grid — FACE BUILDING icon
// Flat, rounded, kawaii-friendly, no 3D perspective.
// ============================================================
function Icon2x2Face() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="14"
        y="14"
        width="72"
        height="72"
        rx="18"
        stroke="#B4A99A"
        strokeWidth="2"
        fill="#FAF8F5"
      />
      <line
        x1="50"
        y1="14"
        x2="50"
        y2="86"
        stroke="#D8D1C6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="50"
        x2="86"
        y2="50"
        stroke="#D8D1C6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// Kawaii 3x3 Face Cube — LOOK AHEAD icon (strictly 2D flat)
// ============================================================
function IconKawaii3x3() {
  const EYE_R = 6;
  const HL_R = 1.7;
  const TL_EYE_X = 23.3;
  const TR_EYE_X = 76.7;
  const EYE_Y = 26;

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="20"
        ry="20"
        stroke="#C7BFAC"
        strokeWidth="2"
        fill="#FBFAF6"
      />
      <line
        x1="36.66"
        y1="10"
        x2="36.66"
        y2="90"
        stroke="#DDD6C4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="63.34"
        y1="10"
        x2="63.34"
        y2="90"
        stroke="#DDD6C4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="36.66"
        x2="90"
        y2="36.66"
        stroke="#DDD6C4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="63.34"
        x2="90"
        y2="63.34"
        stroke="#DDD6C4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx={TL_EYE_X} cy={EYE_Y} r={EYE_R} fill="#2C2C2C" />
      <circle cx={TR_EYE_X} cy={EYE_Y} r={EYE_R} fill="#2C2C2C" />
      <circle cx={TL_EYE_X + 2.1} cy={EYE_Y - 2.1} r={HL_R} fill="white" />
      <circle cx={TR_EYE_X + 2.1} cy={EYE_Y - 2.1} r={HL_R} fill="white" />
      <path
        d="M 44 62 Q 50 68 56 62"
        stroke="#5C5447"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ---------- Shared transition constants ----------
//
// Animate ONLY opacity + transform (scale).
// These two properties run fully on the GPU compositor thread
// and never trigger layout / paint (unless combined with
// other animated props, which we explicitly forbid here).
//
const CARD_TRANSITION: React.CSSProperties = {
  transition:
    "opacity 150ms ease-out, transform 150ms ease-out",
  // Promote to its own compositor layer BEFORE the animation starts.
  transform: "translate3d(0,0,0)",
  // Hint compositor only during animation — cleared on idle.
  willChange: "transform, opacity",
  backfaceVisibility: "hidden",
};

const BACKDROP_TRANSITION: React.CSSProperties = {
  transition: "opacity 150ms ease-out",
  willChange: "opacity",
};

// ---------- Mount node management (for Portal) ----------
let portalHost: HTMLDivElement | null = null;
function ensurePortalHost(): HTMLDivElement | null {
  if (typeof document === "undefined") return null;
  if (!portalHost) {
    portalHost = document.createElement("div");
    portalHost.id = "__trainer_modal_root";
    portalHost.style.position = "fixed";
    portalHost.style.inset = "0";
    portalHost.style.zIndex = "100";
    portalHost.style.pointerEvents = "none";
    document.body.appendChild(portalHost);
  }
  return portalHost;
}

export default function TrainerModal({ open, onClose }: TrainerModalProps) {
  // mount=true -> attach to DOM (always rendered in portal host)
  // enter=true -> apply 'visible' transform/opacity classes
  // This two-phase approach lets the element paint its 'initial'
  // frame first so we never animate from an unknown style state.
  const [mount, setMount] = useState(open);
  const [enter, setEnter] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardsBoxRef = useRef<HTMLDivElement | null>(null);

  // Drive mount + enter from open prop.
  // open=true  → mount then next-tick enter
  // open=false → exit then unmount
  useEffect(() => {
    let raf: number | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMount(true);
      // next frame → trigger enter so browser has applied pre-enter style
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setEnter(true));
      });
    } else {
      setEnter(false);
      // unmount after 150ms (matches transition duration)
      timeout = setTimeout(() => setMount(false), 160);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
    };
  }, [open]);

  // Esc + body-scroll lock + MAIN CONTENT blur (applied to body data-attr)
  //
  // When TrainerModal is visible, we set a `data-trainer-open` attribute on
  // <body>.  Global CSS picks this up and applies `filter: blur(8px)` to the
  // main container with a smooth 200ms transition.  This is cheaper than
  // backdrop-blur and keeps the GPU budget for the modal's scale animation.
  useEffect(() => {
    if (!mount) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-trainer-open", "1");

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      document.body.removeAttribute("data-trainer-open");
    };
  }, [mount, onClose]);

  // Click on backdrop (outside cards box) → close.
  // Per fix: stop propagation from the card content box, and verify the
  // event target belongs to the overlay layer (not to any inner content).
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    const box = cardsBoxRef.current;
    if (box && box.contains(e.target as Node)) return; // inside content → ignore
    if (e.target === overlayRef.current || e.currentTarget === overlayRef.current) {
      onClose();
    }
  };
  const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

  const host = useMemo(() => ensurePortalHost(), []);

  if (!mount || !host) return null;

  const cardsStyle: React.CSSProperties = {
    ...CARD_TRANSITION,
    transform: enter
      ? "translate3d(0,0,0) scale(1)"
      : "translate3d(0,0,0) scale(0.95)",
    opacity: enter ? 1 : 0,
  };

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayMouseDown}
      aria-hidden={!enter}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: enter ? "auto" : "none",
        ...BACKDROP_TRANSITION,
        opacity: enter ? 1 : 0,
      }}
      className="bg-black/40"
    >
      {/* Cards — GPU compositor thread only (opacity + scale) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Trainer menu"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...cardsStyle,
        }}
      >
        <div
          ref={cardsBoxRef}
          onMouseDown={stopBubble}
          className="grid w-full max-w-xl"
          style={{
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "1.25rem",
            paddingLeft: "1.25rem",
            paddingRight: "1.25rem",
          }}
        >
          {/* Left card — static style, no animated props except hover */}
          <div
            className="flex aspect-square flex-col items-center justify-center gap-6 rounded-3xl border border-black/[0.05] bg-white p-8 text-center"
            style={{
              boxShadow:
                "0 20px 50px -24px rgba(0,0,0,0.35)",
            }}
          >
            <Icon2x2Face />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-800">
                2x2 Face Building
              </h3>
            </div>
          </div>

          {/* Right card — aspect-square strictly matches left */}
          <div
            className="flex aspect-square flex-col items-center justify-center gap-6 rounded-3xl border border-black/[0.05] bg-white p-8 text-center"
            style={{
              boxShadow:
                "0 20px 50px -24px rgba(0,0,0,0.35)",
            }}
          >
            <IconKawaii3x3 />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-800">
                Look Ahead
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>,
    host
  );
}
