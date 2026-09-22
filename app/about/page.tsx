"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ============================================================================
// /about — 4-tab architecture: About Us · Credits · Blog · Feedback
// Minimal, no scroll snap, no sticky shrink. Clean tab switching.
// ============================================================================

type TabId = "about" | "credits" | "feedback";

const TABS: { id: TabId; label: string }[] = [
  { id: "about", label: "About Us" },
  { id: "credits", label: "Credits" },
  { id: "feedback", label: "Feedback" },
];

// ---------- Credits data -----------------------------------------------
interface CreditEntry {
  name: string;
  role: string;
  note?: string;
  positions?: string[];
}

const TEAM: CreditEntry[] = [
  {
    name: "Freddie Wang",
    role: "Product & UI Design",
    positions: [
      "Product & UI Design",
      "Idea Maker & Builder",
    ],
  },
  {
    name: "Ahare",
    role: "Art Director & Visual Lead",
    positions: [
      "Art Director & Visual Lead",
      "Logo & Motion Illustrator",
    ],
  },
];

const CREDITS: { group: string; entries: CreditEntry[] }[] = [
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
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800/15 bg-neutral-800/[0.04] px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-neutral-800">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-800 animate-breathe" />
      v0.1.0 · Beta
    </span>
  );
}

// ---------- Credit detail modal ----------------------------------------
function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16" fill="none">
      <circle cx="40" cy="40" r="39" fill="#F3F3F0" stroke="#E0E0DC" strokeWidth="1" />
      <text
        x="40"
        y="46"
        textAnchor="middle"
        fontSize="22"
        fontWeight="300"
        fill="#2C2C2C"
        fontFamily="var(--font-geist-sans)"
        letterSpacing="1"
      >
        {initials}
      </text>
    </svg>
  );
}

function CreditModal({
  entry,
  onClose,
}: {
  entry: CreditEntry;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[min(420px,92vw)] rounded-3xl border border-black/[0.06] bg-white p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.3)] animate-tab-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-[#F5F5F2] hover:text-neutral-800"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex justify-center">
          <AvatarPlaceholder name={entry.name} />
        </div>

        <h3 className="mt-4 text-center text-lg font-medium tracking-wide text-neutral-800">
          {entry.name}
        </h3>

        <ul className="mt-6 flex flex-col gap-3">
          {entry.positions?.map((pos, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 text-[0.8rem] tracking-wide text-neutral-500"
            >
              <span className="star-blink text-neutral-800" style={{ animationDelay: `${i * 0.4}s` }}>
                ✦
              </span>
              {pos}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------- Tab views ---------------------------------------------------

function AboutView({ onCreditClick }: { onCreditClick: (entry: CreditEntry) => void }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        {/* <CubeLogo /> */}

        <h1 className="mt-6 text-3xl font-extralight uppercase tracking-[0.35em] sm:text-4xl">
          Cube in One
        </h1>
        <p className="mt-4 text-sm font-light tracking-[0.2em] text-neutral-500 sm:text-base">
          Fewer clicks, more practice.
        </p>

        <div className="mt-7">
          <VersionBadge />
        </div>
      </section>

      {/* Vision */}
      <section className="rounded-2xl border border-[#E8E8E4] bg-white p-6">
        <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Our Vision
        </h3>
        <p className="mt-3 text-[0.8rem] leading-relaxed tracking-wide text-neutral-500">
          Cube in One is an all-in-one toolkit for speedcubers.
          Built to be minimalist, fast, and useful.
          Hope you enjoy using it! :)
        </p>
      </section>

      {/* Team */}
      <section>
        <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Cube in One Team
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((entry) => {
            const isInteractive = !!entry.positions;
            return (
              <article
                key={`team-${entry.name}`}
                onClick={isInteractive ? () => onCreditClick(entry) : undefined}
                className={
                  isInteractive
                    ? "running-light-card group cursor-pointer rounded-2xl border border-[#E8E8E4] bg-white p-4 transition-all duration-200 hover:border-neutral-400 hover:bg-black/[0.03] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-zinc-900 dark:hover:border-neutral-500 dark:hover:bg-white/[0.04]"
                    : "group rounded-2xl border border-[#E8E8E4] bg-white p-4 transition-all duration-200 hover:border-neutral-400 hover:bg-black/[0.03] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-zinc-900 dark:hover:border-neutral-500 dark:hover:bg-white/[0.04]"
                }
              >
                <div className="relative z-[2] flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium tracking-wide text-neutral-800">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-[0.7rem] tracking-wide text-neutral-400">
                      {entry.role}
                    </p>
                  </div>
                  {entry.note && (
                    <span className="flex-shrink-0 rounded-full bg-[#FAFAF8] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-[#9A9A94]">
                      {entry.note}
                    </span>
                  )}
                  {isInteractive && (
                    <span className="flex-shrink-0 text-neutral-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-neutral-800">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Principles */}
      {/* <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { title: "Clean", desc: "Your data stays in your browser. No accounts, no cloud sync, no tracking." },
          { title: "Zero Bloat", desc: "Every pixel earns its place. No ads, no popups, no unnecessary features." },
          { title: "Open Ecosystem", desc: "Built on open-source tools like cubing.js and WCA regulations. Community-driven." },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[#E8E8E4] bg-white p-5 transition-all hover:border-[#D8D8D4] hover:shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
          >
            <h4 className="text-sm font-medium tracking-wide text-neutral-800">
              {item.title}
            </h4>
            <p className="mt-2 text-[0.7rem] leading-relaxed tracking-wide text-neutral-400">
              {item.desc}
            </p>
          </article>
        ))}
      </section> */}

      {/* Background */}
      {/* <section className="rounded-2xl border border-dashed border-[#E8E8E4] bg-[#FAFAF8] p-6">
        <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Background
        </h3>
        <p className="mt-3 text-[0.8rem] leading-relaxed tracking-wide text-neutral-400">
          Started in 2026 as a passion project by a small team of cubers and
          designers, CIO aims to be the tool we always wished existed —
          beautiful, fast, and respectful of your time. We&apos;re currently
          in beta, actively building and refining.
        </p>
      </section> */}
    </div>
  );
}

function CreditsView({ onCreditClick }: { onCreditClick: (entry: CreditEntry) => void }) {

  return (
    <div className="flex flex-col gap-10">
      {CREDITS.map((section) => (
        <section key={section.group}>
          <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
            {section.group}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.entries.map((entry) => {
              const isInteractive = !!entry.positions;
              return (
                <article
                  key={`${section.group}-${entry.name}`}
                  onClick={isInteractive ? () => onCreditClick(entry) : undefined}
                  className={
                    isInteractive
                      ? "running-light-card group cursor-pointer rounded-2xl border border-[#E8E8E4] bg-white p-4 transition-all duration-200 hover:border-neutral-400 hover:bg-black/[0.03] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-zinc-900 dark:hover:border-neutral-500 dark:hover:bg-white/[0.04]"
                      : "group rounded-2xl border border-[#E8E8E4] bg-white p-4 transition-all duration-200 hover:border-neutral-400 hover:bg-black/[0.03] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-zinc-900 dark:hover:border-neutral-500 dark:hover:bg-white/[0.04]"
                  }
                >
                  <div className="relative z-[2] flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium tracking-wide text-neutral-800">
                        {entry.name}
                      </p>
                      <p className="mt-1 text-[0.7rem] tracking-wide text-neutral-400">
                        {entry.role}
                      </p>
                    </div>
                    {entry.note && (
                      <span className="flex-shrink-0 rounded-full bg-[#FAFAF8] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-[#9A9A94]">
                        {entry.note}
                      </span>
                    )}
                    {isInteractive && (
                      <span className="flex-shrink-0 text-neutral-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-neutral-800">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-dashed border-[#E8E8E4] bg-[#FAFAF8] p-6 text-center">
        <p className="text-[0.7rem] leading-relaxed tracking-wide text-neutral-400">
          Thank you to everyone who has tested early builds, reported bugs, and
          shared algorithm corrections. CIO is shaped by your quiet feedback.
        </p>
      </section>
    </div>
  );
}


function FeedbackView() {
  const giscusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "wyt31/cube-in-one");
    script.setAttribute("data-repo-id", "R_kgDOT8XBUQ");
    script.setAttribute("data-category", "Feedback");
    script.setAttribute("data-category-id", "DIC_kwDOT8XBUc4DFMVr");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    if (giscusRef.current) {
      giscusRef.current.innerHTML = "";
      giscusRef.current.appendChild(script);
    }

    return () => {
      if (giscusRef.current) giscusRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#E8E8E4] bg-white p-6">
        <h3 className="text-sm font-medium tracking-wide text-neutral-800">
          Leave a Comment or Suggestion
        </h3>
        <p className="mt-2 text-[0.75rem] leading-relaxed tracking-wide text-neutral-400">
          Found a typo in an algorithm? Have an idea for a new feature? Drop a
          note below — every piece of feedback shapes the roadmap above.
        </p>

        {/* Giscus / GitHub Discussions embed */}
        <div ref={giscusRef} className="mt-6 giscus" />
      </section>

      <section className="rounded-2xl border border-[#E8E8E4] bg-white p-6">
        <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[#A0A09A]">
          Other Channels
        </h3>
        <ul className="mt-4 flex flex-col gap-2 text-[0.75rem] tracking-wide text-neutral-500">
          <li>· Email — <a href="mailto:freddiewang@cubeinone.com" className="underline hover:text-neutral-800 transition-colors">freddiewang@cubeinone.com</a></li>
          <li>· GitHub Issues — <a href="https://github.com/wyt31/cube-in-one/issues" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-800 transition-colors">https://github.com/wyt31/cube-in-one/issues</a></li>
        </ul>
      </section>
    </div>
  );
}

// ---------- Main page ---------------------------------------------------

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabId>("about");
  const [selectedCredit, setSelectedCredit] = useState<CreditEntry | null>(null);

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-[family-name:var(--font-geist-sans)] text-neutral-800">
      {/* ---------- Header ---------- */}
      <header className="flex items-center px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          {/* <CubeLogo size="h-8 w-8" /> */}
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-neutral-400 transition-colors hover:text-neutral-800">
            Cube in One
          </span>
        </Link>

      </header>

      <main className="mx-auto w-full max-w-4xl px-6 pb-24 sm:px-12">
        {/* ---------- Tab navigation ---------- */}
        <nav
          className="flex items-center justify-center gap-1 rounded-full border border-[#E8E8E4] bg-white p-1"
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
                    ? "bg-neutral-800 text-white shadow-[0_2px_12px_rgba(44,44,44,0.12)]"
                    : "text-neutral-400 hover:text-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ---------- Tab content (animated via remount key) ---------- */}
        <div key={activeTab} className="mt-12 animate-tab-enter">
          {activeTab === "about" && <AboutView onCreditClick={setSelectedCredit} />}
          {activeTab === "credits" && <CreditsView onCreditClick={setSelectedCredit} />}
          {activeTab === "feedback" && <FeedbackView />}
        </div>

        {/* ---------- Footer ---------- */}
        <footer className="mt-20 border-t border-[#ECECE9] pt-8 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#B8B8B2]">
            Cube in One · Crafted with care · 2026
          </p>
        </footer>
      </main>

      {/* Credit modal — rendered at page root to escape stacking contexts */}
      {selectedCredit && (
        <CreditModal
          entry={selectedCredit}
          onClose={() => setSelectedCredit(null)}
        />
      )}
    </div>
  );
}
