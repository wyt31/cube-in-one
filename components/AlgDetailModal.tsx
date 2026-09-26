"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { type AlgCase, type AlgVariant } from "@/data/algs";
import AlgCardCube from "@/components/AlgCardCube";

// ==========================================================================
// AlgDetailModal
//
// Layout:
//   - container: max-h-[85vh] max-w-xl flex flex-col
//   - header: enlarged cube + case name + setup scramble (flex-shrink-0)
//   - formula list: flex-1 overflow-y-auto, grouped by tier
//
// Formula rows are grouped by tier (S → A → B). Each group has a lightweight
// header with a `?` icon that opens a popover explaining the tier standards.
//
// Tier-based row styling:
//   S: amber bg glow + 2px amber left border + font-bold
//   A: sky bg glow + 2px sky left border + font-medium
//   B: plain white card + font-normal
// AUF brackets (e.g. `(U)`) are dimmed via FormulaText for all tiers.
// ==========================================================================

export interface AlgDetailModalProps {
  alg: AlgCase;
  onClose: () => void;
}

interface FormulaRow {
  key: string;
  alg: string;
  tier?: AlgVariant["tier"];
  note?: string;
  primary?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[0.65rem] font-medium text-neutral-400 transition-all hover:bg-black/5 hover:text-neutral-700 active:scale-95 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-200"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// Strip leading AUF groups like "(U) ", "(U') ", "(U2) " and return the
// core alg body so prefix matching starts at the first real move.
function stripAUF(alg: string): string {
  return alg.replace(/^\s*\([^)]*\)\s*/, "");
}

// Normalize an alg or query for case-insensitive, whitespace-tolerant
// comparison: lowercase + collapse runs of whitespace to single spaces.
function normalizeAlg(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// Normalize a single move token for comparison: strips a trailing prime
// from 180° turns so "U2'" == "U2". A 180° turn is its own inverse, so
// X2' and X2 are equivalent and must match each other in prefix search.
//   "U2'" -> "U2", "R2'" -> "R2", "R'" -> "R'" (preserved), "U2" -> "U2"
function normalizeMoveToken(tok: string): string {
  if (!tok) return tok;
  // Match a face letter + "2" + optional trailing "'". Strip the "'".
  const m = tok.match(/^([RUFLBDruflbd])2'$/);
  if (m) return `${m[1].toUpperCase()}2`;
  return tok;
}

// Parse an alg string into an array of move tokens, e.g. "R U R'" -> ["R","U","R'"].
// Whpace-separated tokens; tolerates extra spaces.
function parseMoves(s: string): string[] {
  const trimmed = s.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).filter(Boolean);
}

// -------------------------------------------------------------------------
// Smart Input & Shortcut Mapper (2x2 only)
//
// Pre-processes the raw search query before it enters the 4-way rotational
// matching engine. Three stages:
//   1. Trigger alias replacement — swaps named triggers ("sexy", "sledge",
//      ...) for their canonical move sequences.
//   2. Auto-spacing — splits a concatenated run like "rur'u'" into
//      individual tokens ["r","u","r'","u'"]. Recognizes the 2 modifier
//      suffixes ' and 2.
//   3. Shortcut & case normalization — maps 'p'/'P' to the prime suffix
//      "'" and uppercases all face letters (r -> R, u -> U, ...).
//
// The output is a normalized single-space-separated move string ready for
// `parseMoves` / `generateVariants`.
// -------------------------------------------------------------------------

// Named trigger aliases -> their canonical move sequences.
const TRIGGER_ALIASES: Record<string, string> = {
  se: "R U R' U'",
  sexy: "R U R' U'",
  as: "U R U' R'",
  ase: "U R U' R'",
  antisexy: "U R U' R'",
  sl: "R' F R F'",
  sledge: "R' F R F'",
  he: "F R' F' R",
  hedge: "F R' F' R",
  su: "R U R' U",
};

// Replace whole-word trigger aliases in the raw query. Matching is
// case-insensitive and word-boundary aware so "sexy" inside "sexysune"
// doesn't get replaced.
function applyTriggerAliases(input: string): string {
  let result = input;
  for (const [alias, expansion] of Object.entries(TRIGGER_ALIASES)) {
    const re = new RegExp(`\\b${alias}\\b`, "gi");
    result = result.replace(re, expansion);
  }
  return result;
}

// Auto-space a concatenated run of moves. Tokenizes a raw string into
// space-separated tokens where each token is a face letter (R/U/F/L/B/D)
// optionally followed by modifiers ("'", "2"). The 'p'/'P' shortcut is
// treated as a prime indicator and stays attached to the preceding face.
//
// Uses a character-scan approach (not a single regex replace) so that the
// "r'" modifier on a face is never orphaned from its face when the next
// face follows a prime.
//
// Examples:
//   "rur'u'"      -> "r u r' u'"
//   "ru2rp"       -> "r u2 rp"   (rp normalized later to R')
//   "R U R' U'"   -> "R U R' U'" (already spaced, left intact)
//   "fp"          -> "fp"
const FACE_RE = /[RUFLBDruflbd]/;
function autoSpace(input: string): string {
  const out: string[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    // Skip existing whitespace; emit a single separator.
    if (/\s/.test(ch)) {
      out.push(" ");
      i++;
      continue;
    }
    // A token starts with a face letter.
    if (FACE_RE.test(ch)) {
      out.push(ch);
      i++;
      // Consume any trailing modifiers (', 2, p/P) attached to this face.
      while (i < input.length) {
        const m = input[i];
        if (m === "'" || m === "2" || m === "p" || m === "P") {
          out.push(m);
          i++;
        } else {
          break;
        }
      }
      // After the token, if the next char is a face, insert a separator.
      if (i < input.length && FACE_RE.test(input[i])) {
        out.push(" ");
      }
      continue;
    }
    // Unexpected character — keep it as-is (preserves things like
    // parentheses or stray symbols in user input).
    out.push(ch);
    i++;
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

// Normalize a single token: uppercase the face letter and convert 'p'/'P'
// suffix to "'". e.g. "rp" -> "R'", "u2" -> "U2", "f" -> "F", "r'" -> "R'".
function normalizeToken(tok: string): string {
  if (!tok) return tok;
  const face = tok[0].toUpperCase();
  let suffix = tok.slice(1);
  // Convert any 'p' or 'P' in the suffix to "'".
  suffix = suffix.replace(/p/gi, "'");
  return face + suffix;
}

// Full smart-input pipeline. Returns a normalized single-space-separated
// move string (uppercase faces, "'" primes, "2" doubles). Returns "" for
// empty / whitespace-only input.
function smartNormalizeQuery(input: string): string {
  if (!input) return "";
  // Stage 1: trigger aliases.
  const afterTriggers = applyTriggerAliases(input);
  // Stage 2: auto-space concatenated runs.
  const spaced = autoSpace(afterTriggers);
  // Stage 3: normalize each token (uppercase + p -> ').
  const tokens = spaced.split(/\s+/).filter(Boolean).map(normalizeToken);
  return tokens.join(" ");
}

// Face mapping tables for y-axis rotations. U and D are invariant under y rotation.
const ROT_Y: Record<string, string> = { r: "f", f: "l", l: "b", b: "r", u: "u", d: "d" };
const ROT_Y2: Record<string, string> = { r: "l", l: "r", f: "b", b: "f", u: "u", d: "d" };
const ROT_Y_PRIME: Record<string, string> = { r: "b", b: "l", l: "f", f: "r", u: "u", d: "d" };

// Rotate a single move token under a given y rotation. The move's modifier
// suffix (' or 2) is preserved — only the face letter is remapped.
function rotateMove(move: string, table: Record<string, string>): string {
  if (!move) return move;
  const face = move[0].toLowerCase();
  const suffix = move.slice(1); // e.g. "'", "2", "'2"
  const mapped = table[face] ?? face;
  return mapped + suffix;
}

// Generate the 4 rotational variants of a query string (original, y, y2, y').
// Each variant is token-normalized (X2' -> X2) and lowercased so it can be
// compared against the similarly-normalized core alg. Returns a deduped
// array — if some variants collapse to the same string, only one is kept.
function generateVariants(query: string): string[] {
  const moves = parseMoves(query);
  if (moves.length === 0) return [];
  const build = (table: Record<string, string>) =>
    normalizeAlg(
      moves
        .map((m) => normalizeMoveToken(rotateMove(m, table)))
        .join(" "),
    );
  const variants = [
    normalizeAlg(moves.map(normalizeMoveToken).join(" ")),
    build(ROT_Y),
    build(ROT_Y2),
    build(ROT_Y_PRIME),
  ];
  return Array.from(new Set(variants));
}

// Apply `normalizeMoveToken` to every token in an alg string, then
// `normalizeAlg` for lowercase + whitespace. Used so both the database
// alg and the query variants go through the same token-cleaning pipeline
// before prefix comparison (e.g. "U2'" == "U2").
function normalizeAlgTokens(s: string): string {
  return normalizeAlg(
    parseMoves(s)
      .map(normalizeMoveToken)
      .join(" "),
  );
}

// 4-way rotational prefix match. Returns true if the core alg (post-AUF,
// normalized) starts with any of the 4 rotational variants of the query.
// Both sides run through `normalizeAlgTokens` so 180° turn variants
// (X2' vs X2) compare equal.
function isPrefixMatch4Way(alg: string, query: string): boolean {
  const q = query.trim();
  if (!q) return false;
  const core = normalizeAlgTokens(stripAUF(alg));
  const variants = generateVariants(q);
  return variants.some((v) => core.startsWith(v));
}

// Renders an alg string with parenthesized AUF groups (e.g. "(U)", "(U')",
// "(U2)") dimmed, keeping the core moves high-contrast. When `highlightLen`
// is provided, the first `highlightLen` characters of the core (post-AUF)
// are highlighted to indicate a prefix search match.
function FormulaText({
  alg,
  className,
  highlightLen,
}: {
  alg: string;
  className?: string;
  highlightLen?: number;
}) {
  // Split into AUF vs core boundary.
  const aufMatch = alg.match(/^\s*(\([^)]*\))\s*/);
  const aufText = aufMatch ? aufMatch[1] : "";
  const core = aufText ? alg.slice(aufMatch![0].length) : alg;

  // Core parts by (...) inside the core body (rare, but keeps existing
  // rendering behavior for any inline parentheses in the core).
  const parts: { text: string; paren: boolean }[] = [];
  const regex = /\(([^)]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(core)) !== null) {
    if (m.index > last) parts.push({ text: core.slice(last, m.index), paren: false });
    parts.push({ text: m[0], paren: true });
    last = regex.lastIndex;
  }
  if (last < core.length) parts.push({ text: core.slice(last), paren: false });

  // Apply highlight to the first `highlightLen` chars of the non-paren core.
  const renderParts = () => {
    if (!highlightLen || highlightLen <= 0) {
      return parts.map((p, i) =>
        p.paren ? (
          <span key={i} className="text-zinc-400 dark:text-zinc-500">
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      );
    }

    let remaining = highlightLen;
    return parts.map((p, i) => {
      if (p.paren) {
        return (
          <span key={i} className="text-zinc-400 dark:text-zinc-500">
            {p.text}
          </span>
        );
      }
      const take = Math.min(remaining, p.text.length);
      const head = p.text.slice(0, take);
      const tail = p.text.slice(take);
      remaining -= take;
      return (
        <span key={i}>
          {head && (
            <span className="rounded-sm bg-amber-200/60 px-0.5 text-[#1A1A1A] dark:bg-amber-400/30 dark:text-zinc-50">
              {head}
            </span>
          )}
          {tail}
        </span>
      );
    });
  };

  return (
    <code className={className}>
      {aufText && (
        <span className="text-zinc-400 dark:text-zinc-500">{aufText} </span>
      )}
      {renderParts()}
    </code>
  );
}

// -------------------------------------------------------------------------
// Info popover — rendered via portal to escape overflow clipping.
// Two variants:
//   - "tier": shows the S/A/B tier standards + subjective-disclaimer note.
//   - "search": shows the rotational-equivalent search + aliases + lazy input.
// -------------------------------------------------------------------------
type PopoverVariant = "tier" | "search";

// Inline code pill — used for move sequences, shortcuts, and input examples
// inside the search popover. Light neutral chip with mono font.
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.7rem] font-medium text-neutral-800 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </code>
  );
}

function InfoPopover({
  anchorRect,
  variant,
  onClose,
}: {
  anchorRect: DOMRect;
  variant: PopoverVariant;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  const popoverWidth = 384; // w-96
  const sideOffset = 8; // gap between anchor and popover (sideOffset)
  const collisionPadding = 16; // keep 16px clearance from viewport edges
  const viewportH = window.innerHeight;
  // Natural content height estimate, used only to decide flip. The search
  // variant is shorter than the tier variant.
  const naturalHeight = variant === "search" ? 440 : 320;

  // Avoid-collisions placement: default side = bottom. Flip to top only
  // when the space below can't fit the content AND there's more room above.
  const spaceBelow = viewportH - anchorRect.bottom - sideOffset;
  const spaceAbove = anchorRect.top - sideOffset;
  let placement: "bottom" | "top" = "bottom";
  if (
    spaceBelow < naturalHeight + collisionPadding &&
    spaceAbove > spaceBelow
  ) {
    placement = "top";
  }

  // Compute `top` and a dynamic maxHeight tied to the chosen placement so
  // the popover NEVER overflows the viewport — it scrolls internally
  // instead. This is what prevents the "cut off at the bottom" bug when
  // the trigger sits high (e.g. the S-Tier header).
  let top: number;
  let maxHeight: number;
  if (placement === "top") {
    // Popover sits above the trigger: its bottom edge aligns to
    // `anchorRect.top - sideOffset`. Bottom-align by anchoring `top` to the
    // top of the available band.
    const available = anchorRect.top - sideOffset - collisionPadding;
    maxHeight = Math.max(120, available);
    top = Math.max(collisionPadding, anchorRect.top - sideOffset - maxHeight);
  } else {
    // Popover sits below the trigger: top edge at `anchorRect.bottom + sideOffset`,
    // grows downward capped by the remaining viewport space.
    top = anchorRect.bottom + sideOffset;
    maxHeight = Math.max(120, viewportH - top - collisionPadding);
  }
  // Also honor the requested 100vh-64px ceiling as an upper bound.
  maxHeight = Math.min(maxHeight, viewportH - 64);

  // Horizontal placement with shift: clamp within the viewport with padding.
  const left = Math.max(
    collisionPadding,
    Math.min(
      anchorRect.left,
      window.innerWidth - popoverWidth - collisionPadding,
    ),
  );

  return createPortal(
    <>
      {/* Click-away overlay — stopPropagation prevents the click from
          bubbling up to the outer Modal root (which would close the Modal
          too). Only the Popover should close here. */}
      <div
        className="fixed inset-0 z-[200]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      />
      {/* Popover panel — rendered via portal to body so it floats above
          the Modal's overflow:hidden container. The inline maxHeight is
          computed from the chosen placement so the panel always fits the
          viewport; max-h-[calc(100vh-64px)] is a CSS-level fallback. */}
      <div
        className={`fixed z-[210] w-96 max-h-[calc(100vh-64px)] overflow-y-auto rounded-xl border border-zinc-200/80 bg-white/90 p-4 shadow-xl shadow-black/10 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 ${
          placement === "top" ? "origin-bottom" : "origin-top"
        }`}
        style={{ top, left, maxHeight }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {variant === "tier" ? (
          <>
            <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-zinc-100">
              About the Tiers
            </h3>
            <div className="flex flex-col gap-2.5 text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
              <div>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  S Tier · OUR PICKS
                </span>
                <p className="mt-0.5">
                  Our go-to recommendations. Fast, smooth, and consistent.
                  (Basically the algs I use the most lol)
                </p>
              </div>
              <div>
                <span className="font-semibold text-[#5a7d65] dark:text-[#7a9d85]">
                  A Tier · NOT BAD
                </span>
                <p className="mt-0.5">
                  Really solid backups. Great for specific angles or cancellations.
                </p>
              </div>
              <div>
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                  B Tier · ALTERNATIVES
                </span>
                <p className="mt-0.5">
                  Rare or situational. Maybe useful in specific situations, but
                  less optimal for daily solves.
                </p>
              </div>
              {/* Divider — adds breathing room between tiers and the note */}
              <div className="mt-2 border-t border-neutral-200/60 pt-3 dark:border-zinc-700/60">
                <p className="text-neutral-500 dark:text-zinc-500">
                  <span className="font-medium">A Quick Note:</span> Algorithm
                  tiers are 100% subjective. Everyone&apos;s hands, fingertricks,
                  and habits are different. If an S-Tier alg feels weird to you,
                  or a B-Tier one fits you perfectly, that&apos;s totally normal.
                </p>
                <p className="mt-1.5 text-neutral-500 dark:text-zinc-500">
                  Just pick what makes you fastest, and hope you enjoy the
                  site! :)
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Module 1 — Rotational Equivalent Search */}
            <section>
              <h3 className="mb-1.5 text-sm font-bold text-neutral-800 dark:text-zinc-100">
                Rotational Equivalent Search
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                This is our <em className="not-italic font-semibold text-neutral-800 dark:text-zinc-200">signature feature</em>! Let me show you how it works:
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                Type any move prefix (e.g. <Code>R U R&apos;</Code>). Our smart search engine will automatically match equivalents across all 4 viewing angles (<Code>y</Code>, <Code>y2</Code>, <Code>y&apos;</Code>) to help you with cancellations.
              </p>
            </section>

            {/* Module 2 — Quick Aliases */}
            <section>
              <h3 className="mb-1.5 text-sm font-bold text-neutral-800 dark:text-zinc-100">
                Quick Aliases
              </h3>
              <p className="mb-2 text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                If you&apos;re feeling a bit lazy… you can use shortcuts:
              </p>
              <ul className="flex flex-col gap-1.5 text-xs text-neutral-500 dark:text-zinc-400">
                <li className="flex flex-wrap items-center gap-1">
                  <Code>se</Code> / <Code>sexy</Code>
                  <span className="text-neutral-400 dark:text-neutral-500">→</span>
                  <Code>R U R&apos; U&apos;</Code>
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  <Code>as</Code> / <Code>ase</Code> / <Code>antisexy</Code>
                  <span className="text-neutral-400 dark:text-neutral-500">→</span>
                  <Code>R&apos; U&apos; R U</Code>
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  <Code>sl</Code> / <Code>sledge</Code>
                  <span className="text-neutral-400 dark:text-neutral-500">→</span>
                  <Code>R&apos; F R F&apos;</Code>
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  <Code>he</Code> / <Code>hedge</Code>
                  <span className="text-neutral-400 dark:text-neutral-500">→</span>
                  <Code>F R&apos; F&apos; R</Code>
                </li>
                <li className="flex flex-wrap items-center gap-1">
                  <Code>su</Code>
                  <span className="text-neutral-400 dark:text-neutral-500">→</span>
                  <Code>R U R&apos; U</Code>
                </li>
              </ul>
            </section>

            {/* Module 3 — Lazy Input */}
            <section>
              <h3 className="mb-1.5 text-sm font-bold text-neutral-800 dark:text-zinc-100">
                Lazy Input
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                Oh, and <em className="not-italic font-semibold text-neutral-800 dark:text-zinc-200">one more thing…</em> we also support &quot;Lazy Input&quot;!
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                You can simply type <Code>r u rp</Code> for <Code>R U R&apos;</Code>. The engine automatically converts lowercase to uppercase, and <Code>p</Code> stands for prime. You don&apos;t even need to touch the spacebar—just type <Code>rurp</Code> and you&apos;re good to go!
              </p>
            </section>

            {/* Self-deprecating punchline */}
            <p className="border-t border-neutral-200/60 pt-3 text-[0.7rem] italic leading-relaxed text-neutral-400 dark:border-zinc-700/60 dark:text-zinc-500">
              As we all know, 3x3 actually has lowercases… so yes, this is only for 2x2.
            </p>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

// -------------------------------------------------------------------------
// Tier section header with `?` icon for tooltip toggle.
// -------------------------------------------------------------------------
const TIER_HEADER_STYLES: Record<string, string> = {
  S: "text-[#9E684B] dark:text-[#C4906E]",
  A: "text-[#5a7d65] dark:text-[#7a9d85]",
  B: "text-zinc-500 dark:text-zinc-400",
};

function TierSectionHeader({
  tier,
  onToggleTooltip,
  isTooltipActive,
}: {
  tier: string;
  onToggleTooltip?: (rect: DOMRect) => void;
  isTooltipActive: boolean;
}) {
  const color = TIER_HEADER_STYLES[tier] ?? "text-[#A0A09A] dark:text-zinc-500";
  const showInfo = tier !== "*" && onToggleTooltip !== undefined;

  return (
    <div className="relative flex items-center gap-2">
      <span
        className={`text-[10px] font-bold uppercase tracking-[0.18em] ${color}`}
      >
        {tier === "*" ? "Formulas" : `${tier} Tier`}
      </span>
      {showInfo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onToggleTooltip!(rect);
          }}
          className={`flex h-3.5 w-3.5 items-center justify-center transition-colors ${
            isTooltipActive
              ? "text-zinc-600 dark:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
          aria-label="Tier standards info"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      )}
      <span className="h-px flex-1 bg-[#F0F0EE] dark:bg-zinc-800" />
    </div>
  );
}

// -------------------------------------------------------------------------
// Prefix search input — filters the formula list by alg start sequence.
// Ignores leading AUF brackets and is case/space-insensitive.
// -------------------------------------------------------------------------
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onToggleInfoTooltip?: (rect: DOMRect) => void;
  isInfoTooltipActive?: boolean;
  smartInput?: boolean;
}

function SearchInput({
  value,
  onChange,
  onToggleInfoTooltip,
  isInfoTooltipActive,
  smartInput = false,
}: SearchInputProps) {
  const hasInput = value.trim().length > 0;

  // Smart auto-completion on Space key (2x2 only). When the user presses
  // space, the last token before the cursor is run through the smart input
  // pipeline (trigger aliases + auto-space + case/prime normalization) and
  // replaced in-place, followed by a trailing space for fluent continued
  // typing.
  //
  // Uses e.currentTarget.value (DOM) instead of the React `value` prop to
  // avoid stale-closure issues when typing fast — the DOM value is always
  // up-to-date in the keydown handler, while the prop may lag behind by one
  // render cycle.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key !== " " || !smartInput) return;

    const input = e.currentTarget;
    // Read the live DOM value, not the (potentially stale) React prop.
    const liveValue = input.value;
    const cursorPos = input.selectionStart ?? liveValue.length;
    const selectionEnd = input.selectionEnd ?? liveValue.length;

    // Skip when there's an active text selection — let default replace it.
    if (cursorPos !== selectionEnd) return;

    const before = liveValue.slice(0, cursorPos);
    const after = liveValue.slice(cursorPos);

    // Split `before` into (prefix, lastToken) at the last space boundary.
    const lastSpaceIdx = before.lastIndexOf(" ");
    const prefix = lastSpaceIdx >= 0 ? before.slice(0, lastSpaceIdx + 1) : "";
    const lastToken = lastSpaceIdx >= 0 ? before.slice(lastSpaceIdx + 1) : before;

    // Empty token — just swallow the space to prevent double-spacing.
    if (!lastToken.trim()) {
      e.preventDefault();
      return;
    }

    // Run the smart input pipeline on the last token.
    const normalized = smartNormalizeQuery(lastToken);

    // If normalization didn't change anything, let the default space insertion
    // happen — no need to replace the whole input value.
    if (normalized === lastToken) return;

    e.preventDefault();

    // Avoid double spaces when editing in the middle of existing text.
    const trailing = after.startsWith(" ") ? "" : " ";
    const newValue = prefix + normalized + trailing + after;
    onChange(newValue);

    // Restore cursor position after React re-renders the input.
    const newCursorPos = prefix.length + normalized.length + trailing.length;
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="flex h-9 min-h-[36px] flex-1 items-center gap-2 rounded-full border border-black/5 bg-neutral-100/80 px-3.5 py-1.5 transition-colors hover:bg-neutral-100 focus-within:ring-2 focus-within:ring-neutral-200 focus-within:bg-white focus-within:border-transparent dark:border-white/5 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:focus-within:ring-zinc-600 dark:focus-within:bg-zinc-900">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 text-neutral-400 dark:text-zinc-500"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="Search algs starting with..."
        className="min-w-0 flex-1 bg-transparent pr-8 font-[family-name:var(--font-geist-mono)] text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-zinc-200 dark:placeholder:text-zinc-500"
      />
      {/* Right-side cluster: Clear button (if input) + Info icon */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {hasInput && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-700 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
            aria-label="Clear search"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        {onToggleInfoTooltip && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              onToggleInfoTooltip(rect);
            }}
            className={`flex h-4 w-4 items-center justify-center transition-colors ${
              isInfoTooltipActive
                ? "text-neutral-600 dark:text-zinc-300"
                : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-zinc-300"
            }`}
            aria-label="Rotational equivalent search info"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Single formula row — styling varies by tier.
//   S: warm bronze/titanium hairline edge + bronze radial wash + 1.5px
//      metallic bronze left accent + font-bold + bright inset highlight.
//   A: emerald/teal mineral — hairline edge, 1.5px emerald side line, faint
//      green wash + font-medium.
//   B: plain quiet card with no color bias + font-normal.
// Formula text color stays readable across all tiers; only AUF brackets
// are dimmed (handled by FormulaText).
// -------------------------------------------------------------------------
function FormulaRowView({
  row,
  highlightLen,
}: {
  row: FormulaRow;
  highlightLen?: number;
}) {
  const tier = row.tier ?? "*";

  let wrapperCls: string;
  let formulaCls: string;

  if (tier === "S") {
    // Warm bronze metallic — hairline edge, soft radial wash, bright metallic side line.
    wrapperCls =
      "flex items-start justify-between gap-3 rounded-xl border-[1px] border-[#9E684B]/15 bg-[radial-gradient(ellipse_at_left_top,rgba(158,104,75,0.05),transparent_70%)] border-l-[1.5px] border-l-[#9E684B] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] p-4 dark:border-[#9E684B]/20 dark:bg-[radial-gradient(ellipse_at_left_top,rgba(158,104,75,0.08),transparent_70%)] dark:border-l-[#9E684B] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";
    formulaCls =
      "font-[family-name:var(--font-geist-mono)] text-base font-bold leading-relaxed tracking-wide text-[#1A1A1A] dark:text-zinc-50";
  } else if (tier === "A") {
    // Muted moss green — hairline edge, 3px moss side line, 6% wash.
    wrapperCls =
      "flex items-start justify-between gap-3 rounded-xl border-[1px] border-[#5a7d65]/15 bg-[#5a7d65]/[0.06] border-l-[3px] border-l-[#5a7d65] p-3.5 dark:border-[#5a7d65]/25 dark:bg-[#5a7d65]/[0.08] dark:border-l-[#5a7d65]";
    formulaCls =
      "font-[family-name:var(--font-geist-mono)] text-sm font-medium leading-relaxed tracking-wide text-neutral-700 dark:text-zinc-300";
  } else if (tier === "B") {
    wrapperCls =
      "flex items-start justify-between gap-3 rounded-xl border-[1px] border-black/5 bg-black/[0.01] p-3.5 dark:border-white/5 dark:bg-zinc-900";
    formulaCls =
      "font-[family-name:var(--font-geist-mono)] text-sm font-normal leading-relaxed tracking-wide text-neutral-800 dark:text-zinc-200";
  } else {
    // Untiered (3x3 fallback)
    wrapperCls =
      "flex items-start justify-between gap-3 rounded-xl border-[1px] border-black/5 bg-black/[0.01] p-3.5 dark:border-white/5 dark:bg-zinc-900";
    formulaCls =
      "font-[family-name:var(--font-geist-mono)] text-sm font-medium leading-relaxed tracking-wide text-neutral-800 dark:text-zinc-200";
  }

  return (
    <div className={wrapperCls}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <FormulaText
          alg={row.alg}
          className={`block break-all ${formulaCls}`}
          highlightLen={highlightLen}
        />
        {row.note && (
          <p className="text-[0.65rem] leading-relaxed text-[#A0A09A] dark:text-zinc-500">
            {row.note}
          </p>
        )}
      </div>
      <CopyButton text={row.alg} />
    </div>
  );
}

export default function AlgDetailModal({
  alg,
  onClose,
}: AlgDetailModalProps) {
  // Centralized popover state — only one popover can be open at a time.
  // `activePopover` identifies which trigger is active (kind + key), so the
  // same InfoPopover instance can render either tier or search content.
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const [activePopover, setActivePopover] = useState<{
    kind: "tier" | "search";
    key: string;
  } | null>(null);
  // Prefix search query for filtering the formula list.
  const [searchQuery, setSearchQuery] = useState("");

  // Esc closes the modal.
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePopover) {
          setActivePopover(null);
          setTooltipAnchor(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, activePopover]);

  // Body scroll lock while modal is open.
  useEffect(() => {
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, []);

  // Toggle the tier-info popover. If the same tier's popover is already
  // open, close it; otherwise, switch to the new tier.
  const handleToggleTooltip = (tier: string) => (rect: DOMRect) => {
    const key = `tier:${tier}`;
    if (activePopover?.key === key) {
      setActivePopover(null);
      setTooltipAnchor(null);
    } else {
      setActivePopover({ kind: "tier", key });
      setTooltipAnchor(rect);
    }
  };

  // Toggle the search-info popover (only one trigger, so key is fixed).
  const handleToggleSearchTooltip = (rect: DOMRect) => {
    const key = "search:info";
    if (activePopover?.key === key) {
      setActivePopover(null);
      setTooltipAnchor(null);
    } else {
      setActivePopover({ kind: "search", key });
      setTooltipAnchor(rect);
    }
  };

  // Build the tier-ranked formula list (S first). 2x2 algs carry tiers +
  // notes; 3x3 falls back to plain recommended/others lists.
  const rows: FormulaRow[] = [];
  rows.push({
    key: "main",
    alg: alg.recommended,
    tier: alg.recommendedTier,
    primary: true,
  });
  if (alg.altAlgs && alg.altAlgs.length > 0) {
    alg.altAlgs.forEach((a, i) =>
      rows.push({ key: `alt-${i}`, alg: a.alg, tier: a.tier, note: a.note }),
    );
  } else if (alg.others && alg.others.length > 0) {
    alg.others.forEach((a, i) => rows.push({ key: `alt-${i}`, alg: a }));
  }

  // 4-way rotational prefix search: when a query is present, keep only rows
  // whose core alg (post-AUF) starts with any of the 4 y-rotation variants
  // (original, y, y2, y') of the query. For 2x2, the raw query is first run
  // through the smart-input pipeline (trigger aliases + auto-spacing + 'p' ->
  // prime + case normalization) before entering the rotational engine.
  // `highlightLen` is the normalized query length; since all 4 variants
  // share the same character length, highlighting the first N chars of the
  // core correctly marks the match.
  const hasQuery = searchQuery.trim().length > 0;
  // Smart-input preprocessing applies to 2x2 only; 3x3 uses the raw query.
  const effectiveQuery = alg.cube === "2x2"
    ? smartNormalizeQuery(searchQuery)
    : searchQuery;
  const filteredRows = useMemo(() => {
    if (!hasQuery) return rows;
    if (!effectiveQuery.trim()) return rows;
    return rows.filter((r) => isPrefixMatch4Way(r.alg, effectiveQuery));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchQuery, hasQuery, effectiveQuery]);
  const highlightLen = hasQuery
    ? normalizeAlg(effectiveQuery).length
    : undefined;
  const noResults = hasQuery && filteredRows.length === 0;

  // Group rows by tier for section rendering. Order follows S → A → B;
  // untiered rows (3x3 fallback) land in the generic "*" group.
  const tierOrder = ["S", "A", "B", "*"];
  const groups: { tier: string; rows: FormulaRow[] }[] = tierOrder
    .map((tier) => ({
      tier,
      rows: filteredRows.filter((r) => (r.tier ?? "*") === tier),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm transition-opacity" />

      <div
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border-[1px] border-black/5 bg-[#fbfbf9] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_20px_60px_rgba(0,0,0,0.08)] dark:border-white/5 dark:bg-zinc-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — enlarged cube (left) + title/tags/search (right) */}
        <div className="flex flex-shrink-0 flex-col gap-4 border-b border-black/5 p-6 pr-12 dark:border-white/5">
          <div className="flex items-start gap-5">
            <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[1px] border-black/5 bg-[#fbfbf9] p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:border-white/5 dark:bg-zinc-800 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <AlgCardCube alg={alg} className="h-full w-full" />
            </div>

            {/* Right column: title + tags row, then prefix search */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
              <div>
                <h2 className="text-xl font-light tracking-wide text-neutral-800 dark:text-zinc-100">
                  {alg.name}
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A0A09A] dark:text-zinc-500">
                  {alg.cube} · {alg.set} · {alg.group}
                </p>
              </div>
              {/* Prefix search — fills remaining right-column width */}
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onToggleInfoTooltip={handleToggleSearchTooltip}
                isInfoTooltipActive={activePopover?.key === "search:info"}
                smartInput={alg.cube === "2x2"}
              />
            </div>

            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Setup scramble — light gray box to distinguish from formulas */}
          {alg.setup && (
            <div className="flex items-center justify-between gap-3 rounded-lg border-[1px] border-black/5 bg-black/[0.02] px-3 py-2 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A0A09A] dark:text-zinc-500">
                  Setup
                </span>
                <code className="block truncate font-[family-name:var(--font-geist-mono)] text-xs text-neutral-500 dark:text-zinc-400">
                  {alg.setup}
                </code>
              </div>
              <CopyButton text={alg.setup} />
            </div>
          )}
        </div>

        {/* Formula list — grouped by tier, scrolls internally */}
        <div className="flex-1 overflow-y-auto p-6 pr-2">
          {noResults ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-xs text-[#A0A09A] dark:text-zinc-500">
                No algorithms start with this sequence.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="rounded-lg border border-[#E8E8E4] bg-white px-3 py-1.5 text-[0.65rem] font-medium text-neutral-500 transition-all hover:border-neutral-800 hover:text-neutral-800 dark:border-white/8 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <div key={group.tier} className="flex flex-col gap-3">
                  <TierSectionHeader
                    tier={group.tier}
                    onToggleTooltip={handleToggleTooltip(group.tier)}
                    isTooltipActive={activePopover?.key === `tier:${group.tier}`}
                  />
                  {group.rows.map((row) => (
                    <FormulaRowView
                      key={row.key}
                      row={row}
                      highlightLen={highlightLen}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info popover (portal) — only one at a time; renders tier or search content */}
      {tooltipAnchor && activePopover && (
        <InfoPopover
          anchorRect={tooltipAnchor}
          variant={activePopover.kind}
          onClose={() => {
            setActivePopover(null);
            setTooltipAnchor(null);
          }}
        />
      )}
    </div>
  );
}
