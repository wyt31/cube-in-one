"use client";

import { useState } from "react";
import Link from "next/link";

// ============================================================================
// /about — Segmented Tabs layout
//   Hero  ->  [ Credits ] [ Dev Path ] [ Feedback ]
//   default tab: "credits"
// ============================================================================

type TabId = "credits" | "dev-path" | "feedback";

const TABS: { id: TabId; label: string }[] = [
  { id: "credits", label: "Credits" },
  { id: "dev-path", label: "Dev Path" },
  { id: "feedback", label: "Feedback" },
];

// ---------- Roadmap data ------------------------------------------------
type RoadmapStatus = "completed" | "progress" | "planned";

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  meta?: string;
}

const ROADMAP: RoadmapNode[] = [
  {
    id: "brand",
    title: "Project Bootstrap & Brand Identity",
    description:
      "Cube in One (CIO) brand identity, Geist typography stack, minimalist design tokens, and neutral palette foundation.",
    status: "completed",
    meta: "Milestone 1",
  },
  {
    id: "cube2d",
    title: "2x2 / 3x3 SVG 2D Cube Engine",
    description:
      "Zero-dependency 2D sticker renderer with consistent gap / border / rounded corners, route-based engine selection (2D vs cubing.js).",
    status: "completed",
    meta: "Milestone 2",
  },
  {
    id: "dataset-2x2",
    title: "2x2 Algorithm Database (v2 Schema)",
    description:
      "PBL / CLL / EG1 / EG2 / LEG / TCLL / LS full CSV ingestion pipeline, twoByTwoData dataset, and per-formula SubAlg tag system.",
    status: "completed",
    meta: "Milestone 3",
  },
  {
    id: "alg-modal",
    title: "Detail Modal + Tag Highlight System",
    description:
      "Responsive modal with pinned header, setup scramble card, main-alg emphasis block, and AND-intersection tag dimming engine.",
    status: "completed",
    meta: "Milestone 4",
  },
  {
    id: "dataset-3x3",
    title: "3x3 CFOP Full Dataset (F2L · OLL 57 · PLL 21)",
    description:
      "Build 3x3 F2L / OLL / PLL collections with correct group attributes and verify 2D SVG stickering for OLL & PLL.",
    status: "progress",
    meta: "In Progress",
  },
  {
    id: "home-search",
    title: "Home Search Engine Connectivity",
    description:
      "Wire SearchHome input to the unified algData dataset — live filter by set / group / tags / case name across 2x2 and 3x3.",
    status: "progress",
  },
  {
    id: "timer",
    title: "Speedcubing Timer + WCA Inspection",
    description:
      "Single-page timer with 15s WCA inspection (8s/12s voice cues, +2/DNF), Dexie-backed local history, rolling AoX stats, and twisty-player scramble preview.",
    status: "completed",
    meta: "Milestone 5",
  },
  {
    id: "case-library",
    title: "Personal Case Library & Drill Mode",
    description:
      "Bookmark cases into a user-owned library, daily drill queue with SRS-style scheduling, and mistake logging.",
    status: "planned",
    meta: "v0.3.0",
  },
  {
    id: "video-annotations",
    title: "Execution Annotations & Video Overlays",
    description:
      "Optional YouTube / host video embeds tied to specific cases with timestamped turn-by-turn annotations and fingertrick tags.",
    status: "planned",
    meta: "v0.4.0",
  },
];

// ---------- Credits data -----------------------------------------------
interface CreditEntry {
  name: string;
  role: string;
  note?: string;
}

const CREDITS: { group: string; entries: CreditEntry[] }[] = [
  {
    group: "Design & Visuals",
    entries: [
      { name: "Freddie Wang", role: "Brand & UI Direction" },
      { name: "Placeholder", role: "Placeholder" },
    ],
  },
  {
    group: "Open Source Community",
    entries: [
      { name: "cubing.js", role: "Background cube state calculation" },
      { name: "Geist Font", role: "Typography stack" },
      { name: "Tailwind CSS", role: "Styling engine" },
      { name: "Next.js", role: "App Router framework" },
    ],
  },
  {
    group: "WCA / Cubing Community",
    entries: [
      { name: "WCA Regulations", role: "Official scramble & notation reference" },
      { name: "AlgDB / SpeedSolving Wiki", role: "Public algorithm datasets" },
      { name: "Early Testers", role: "Feedback & bug reports" },
    ],
  },
];

// ---------- Small UI atoms ---------------------------------------------
function VersionBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#2C2C2C]/15 bg-[#2C2C2C]/[0.04] px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#2C2C2C]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#2C2C2C] animate-breathe" />
      v0.1.0 · Beta
    </span>
  );
}

function CubeLogo() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-16 w-16"
      fill="none"
      aria-label="Cube in One"
    >
      <g
        stroke="#2C2C2C"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <polygon points="24,6 42,16 24,26 6,16" fill="#FBFBFA" />
        <polygon points="6,16 24,26 24,42 6,32" fill="#F3F3F0" />
        <polygon points="42,16 24,26 24,42 42,32" fill="#E9E9E5" />
        <circle cx="18" cy="15.5" r="0.9" fill="#2C2C2C" />
        <circle cx="24" cy="12" r="0.9" fill="#2C2C2C" />
        <circle cx="30" cy="15.5" r="0.9" fill="#2C2C2C" />
        <circle cx="24" cy="20" r="0.9" fill="#2C2C2C" />
      </g>
    </svg>
  );
}

// ---------- Roadmap visual primitives -----------------------------------
function NodeDot({ status }: { status: RoadmapStatus }) {
  if (status === "completed") {
    return (
      <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
        <span className="absolute h-4 w-4 rounded-full bg-[#2C2C2C]" />
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="relative text-white">
          <polyline
            points="20 6 9 17 4 12"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "progress") {
    return (
      <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
        <span className="absolute h-4 w-4 rounded-full bg-[#2C2C2C]" />
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        <span className="absolute inset-0 h-4 w-4 rounded-full bg-[#2C2C2C] animate-breathe" />
      </span>
    );
  }
  return (
    <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
      <span className="h-4 w-4 rounded-full border-2 border-dashed border-[#CCCCCC] bg-white" />
    </span>
  );
}

function LineSegment({
  start,
  end,
}: {
  start: RoadmapStatus;
  end: RoadmapStatus;
}) {
  const dim = start === "planned" || end === "planned";
  return (
    <div
      className={`absolute left-[7px] top-4 h-full w-[2px] ${
        dim
          ? "border-l-2 border-dashed border-[#DDDDDD]"
          : "bg-[#D8D8D4]"
      }`}
      aria-hidden
    />
  );
}

const STATUS_PILL: Record<RoadmapStatus, string> = {
  completed: "border-[#2C2C2C]/10 bg-[#2C2C2C]/5 text-[#2C2C2C]",
  progress: "border-[#2C2C2C]/20 bg-white text-[#2C2C2C] shadow-[0_0_0_3px_rgba(44,44,44,0.04)]",
  planned: "border-[#E0E0DC] bg-white text-[#A0A09A]",
};

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  completed: "Completed",
  progress: "In Progress",
  planned: "Planned",
};

// ---------- Tab views ---------------------------------------------------

function CreditsView() {
  return (
    <div className="flex flex-col gap-10">
      {CREDITS.map((section) => (
        <section key={section.group}>
          <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
            {section.group}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {section.entries.map((entry) => (
              <article
                key={`${section.group}-${entry.name}`}
                className="rounded-2xl border border-[#E8E8E4] bg-white p-4 transition-all hover:border-[#D8D8D4] hover:shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium tracking-wide text-[#2C2C2C]">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-[0.7rem] tracking-wide text-[#888]">
                      {entry.role}
                    </p>
                  </div>
                  {entry.note && (
                    <span className="flex-shrink-0 rounded-full bg-[#FAFAF8] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-[#9A9A94]">
                      {entry.note}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-dashed border-[#E8E8E4] bg-[#FAFAF8] p-6 text-center">
        <p className="text-[0.7rem] leading-relaxed tracking-wide text-[#888]">
          Thank you to everyone who has tested early builds, reported bugs, and
          shared algorithm corrections. CIO is shaped by your quiet feedback.
        </p>
      </section>
    </div>
  );
}

function DevPathView() {
  return (
    <div>
      <div className="mb-8 hidden items-center gap-4 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#888] sm:flex">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#2C2C2C]" />
          Completed
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#2C2C2C] animate-breathe" />
          In Progress
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-dashed border-[#CCC]" />
          Planned
        </span>
      </div>

      <ol className="relative">
        {ROADMAP.map((node, idx) => {
          const next = ROADMAP[idx + 1];
          return (
            <li
              key={node.id}
              className={`relative pb-12 pl-10 ${
                idx === ROADMAP.length - 1 ? "pb-0" : ""
              }`}
            >
              {next && <LineSegment start={node.status} end={next.status} />}

              <div className="absolute left-0 top-1">
                <NodeDot status={node.status} />
              </div>

              <article
                className={`rounded-2xl border bg-white p-5 transition-all ${
                  node.status === "planned"
                    ? "border-[#EFEFEC] opacity-75"
                    : node.status === "progress"
                    ? "border-[#2C2C2C]/15 shadow-[0_2px_20px_rgba(44,44,44,0.04)]"
                    : "border-[#E8E8E4]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.15em] ${
                      STATUS_PILL[node.status]
                    }`}
                  >
                    {STATUS_LABEL[node.status]}
                  </span>
                  {node.meta && (
                    <span className="rounded-full bg-[#FAFAF8] px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-[#9A9A94]">
                      {node.meta}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-sm font-semibold tracking-wide text-[#2C2C2C]">
                  {node.title}
                </h3>
                <p
                  className={`mt-2 text-[0.75rem] leading-relaxed tracking-wide ${
                    node.status === "planned" ? "text-[#A0A09A]" : "text-[#777]"
                  }`}
                >
                  {node.description}
                </p>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FeedbackView() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#E8E8E4] bg-white p-6">
        <h3 className="text-sm font-medium tracking-wide text-[#2C2C2C]">
          Leave a Comment or Suggestion
        </h3>
        <p className="mt-2 text-[0.75rem] leading-relaxed tracking-wide text-[#888]">
          Found a typo in an algorithm? Have an idea for a new feature? Drop a
          note below — every piece of feedback shapes the roadmap above.
        </p>

        {/* Placeholder container for Giscus / GitHub Discussions embed */}
        <div
          id="giscus-container"
          className="mt-6 min-h-[240px] rounded-xl border border-dashed border-[#E0E0DC] bg-[#FAFAF8] p-6 text-center"
        >
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0DC] bg-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A0A09A"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            <p className="text-[0.7rem] tracking-wide text-[#A0A09A]">
              Giscus / GitHub Discussions will load here.
            </p>
            <p className="text-[0.6rem] tracking-[0.15em] text-[#BBB]">
              COMMENT AREA · RESERVED
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8E8E4] bg-white p-6">
        <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Other Channels
        </h3>
        <ul className="mt-4 flex flex-col gap-2 text-[0.75rem] tracking-wide text-[#666]">
          <li>· Email — hello@cubeinone.app (placeholder)</li>
          <li>· GitHub Issues — https://github.com/your-org/cube-in-one (placeholder)</li>
        </ul>
      </section>
    </div>
  );
}

// ---------- Main page ---------------------------------------------------

export default function AboutPage() {
  // Default tab: "credits" as required.
  const [activeTab, setActiveTab] = useState<TabId>("credits");

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-[family-name:var(--font-geist-sans)] text-[#2C2C2C]">
      {/* ---------- Top minimal nav bar (no MenuIcon) ---------- */}
      <header className="flex items-center justify-between px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#888] transition-colors hover:text-[#2C2C2C]"
        >
          &lt; Cube in One
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 pb-24 sm:px-12">
        {/* ---------- Hero ---------- */}
        <section className="mt-2 flex flex-col items-center text-center">
          <CubeLogo />

          <h1 className="mt-6 text-3xl font-extralight uppercase tracking-[0.35em] sm:text-4xl">
            Cube in One
          </h1>
          <p className="mt-4 text-sm font-light tracking-[0.2em] text-[#666] sm:text-base">
            Fewer clicks, more practice.
          </p>

          <div className="mt-7">
            <VersionBadge />
          </div>

          <p className="mx-auto mt-10 max-w-xl text-[0.8rem] leading-relaxed tracking-wide text-[#888] sm:text-sm">
            Cube in One is a all-in-one toolkit for speedcubers.
            It combines the best features of existing tools into a single interface.
          </p>
        </section>

        {/* ---------- Segmented Tabs ---------- */}
        <nav
          className="mt-14 flex items-center justify-center gap-1 rounded-full border border-[#E8E8E4] bg-white p-1"
          role="tablist"
          aria-label="About sections"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-full px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                  active
                    ? "bg-[#2C2C2C] text-white shadow-[0_2px_12px_rgba(44,44,44,0.12)]"
                    : "text-[#888] hover:text-[#2C2C2C]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ---------- Tab content (animated via remount key) ---------- */}
        <div key={activeTab} className="mt-12 animate-tab-enter">
          {activeTab === "credits" && <CreditsView />}
          {activeTab === "dev-path" && <DevPathView />}
          {activeTab === "feedback" && <FeedbackView />}
        </div>

        {/* ---------- Footer ---------- */}
        <footer className="mt-20 border-t border-[#ECECE9] pt-8 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#B8B8B2]">
            Cube in One · Crafted with care · 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
