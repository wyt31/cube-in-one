"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import licenses from "@/data/licenses.json";

// ============================================================================
// /credits — every open-source package we build on, from data/licenses.json
// ============================================================================

interface LicenseEntry {
  name: string;
  version?: string;
  license?: string;
  author?: string;
  repository?: string;
  copyright?: string;
}

/** Reduce combined/double SPDX expressions to a single friendly id. */
function licenseLabel(license?: string): string {
  if (!license) return "Unknown";
  const raw = license.toUpperCase();
  // Double-license combos, e.g. "MPL-2.0 OR GPL-3.0-or-later" → show the first.
  if (raw.includes("MPL-2.0")) return "MPL-2.0";
  if (raw.includes("GPL-3.0")) return "GPL-3.0";
  if (raw.includes("MIT")) return "MIT";
  if (raw.includes("ISC")) return "ISC";
  if (raw.includes("Apache-2.0")) return "Apache-2.0";
  if (raw.includes("BSD-3")) return "BSD-3-Clause";
  if (raw.includes("BSD-2")) return "BSD-2-Clause";
  if (raw.includes("BSD")) return "BSD";
  if (raw.includes("CC0")) return "CC0-1.0";
  if (raw.includes("ZLIB")) return "Zlib";
  if (raw.includes("WTFPL")) return "WTFPL";
  return license;
}

// ---------- Cat-paw back button (matches Timer / About) --------------
function BackLink() {
  return (
    <Link
      href="/"
      className="group text-neutral-400 transition-all duration-300 ease-out hover:text-neutral-800"
      aria-label="Back to home"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 48 48"
        fill="none"
        className="-rotate-90 transition-all duration-300 ease-out group-hover:-translate-x-1.5 group-hover:text-neutral-800"
      >
        <path fill="currentColor" d="M17.5 3.5c1.37 0 2.627.512 3.542 1.458c.915.947 1.458 2.299 1.458 3.93c0 1.623-.536 3.252-1.41 4.485c-.87 1.227-2.13 2.127-3.59 2.127s-2.72-.9-3.59-2.127c-.874-1.233-1.41-2.862-1.41-4.484c0-1.632.543-2.984 1.459-3.931C14.873 4.012 16.13 3.5 17.5 3.5m-11 9c1.37 0 2.627.512 3.542 1.458c.915.947 1.458 2.299 1.458 3.93c0 1.623-.536 3.252-1.41 4.485C9.22 23.6 7.96 24.5 6.5 24.5s-2.72-.9-3.59-2.127C2.036 21.14 1.5 19.51 1.5 17.889c0-1.632.543-2.984 1.459-3.931C3.873 13.012 5.13 12.5 6.5 12.5m17.5 7c-7.124 0-13.026 6.065-14.884 13.67c-.824 3.374.433 6.993 3.533 8.708c2.463 1.364 6.149 2.622 11.35 2.622c5.202 0 8.888-1.258 11.352-2.622c3.099-1.715 4.356-5.334 3.532-8.707C37.026 25.565 31.123 19.5 24 19.5m17.5-7c-1.37 0-2.627.512-3.541 1.458c-.916.947-1.459 2.299-1.459 3.93c0 1.623.536 3.252 1.41 4.485c.87 1.227 2.13 2.127 3.59 2.127s2.72-.9 3.59-2.127c.874-1.233 1.41-2.862 1.41-4.484c0-1.632-.543-2.984-1.458-3.931c-.915-.946-2.172-1.458-3.542-1.458m-11-9c-1.37 0-2.627.512-3.541 1.458c-.916.947-1.459 2.299-1.459 3.93c0 1.623.536 3.252 1.41 4.485c.87 1.227 2.13 2.127 3.59 2.127s2.72-.9 3.59-2.127c.874-1.233 1.41-2.862 1.41-4.484c0-1.632-.543-2.984-1.458-3.931C33.127 4.012 31.87 3.5 30.5 3.5" />
      </svg>
    </Link>
  );
}

// ---------- Detail modal -------------------------------------------------
function LicenseModal({ entry, onClose }: { entry: LicenseEntry; onClose: () => void }) {
  const repoUrl = entry.repository || "";
  const href = /^https?:\/\//.test(repoUrl)
    ? repoUrl
    : repoUrl
      ? `https://github.com/${repoUrl.replace(/^git\+/, "").replace(/\.git$/, "")}`
      : "";
  // Prefer copyright text, fall back to the publisher/author.
  const copyrightText =
    entry.copyright?.trim() ||
    (entry.author ? `© ${entry.author}` : "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-[min(480px,92vw)] overflow-y-auto rounded-3xl border border-[#EAE2D5] bg-[#FDFBF5] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-[#F0EBDC] hover:text-neutral-800"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold tracking-wide text-neutral-800">
              {entry.name}
            </h3>
            {entry.version && (
              <span className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] text-neutral-400">
                v{entry.version}
              </span>
            )}
          </div>

          <span className="mt-4 inline-block rounded-[3px] border border-[#C9BFA4] bg-[#EAE2D5]/50 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[#8A7A55]">
            {licenseLabel(entry.license)}
          </span>

          <dl className="mt-6 flex flex-col gap-4">
            <div>
              <dt className="text-[0.55rem] font-medium uppercase tracking-[0.25em] text-[#A79B7D]">
                License
              </dt>
              <dd className="mt-1 text-[0.8rem] text-neutral-700">{licenseLabel(entry.license)}</dd>
            </div>

            <div>
              <dt className="text-[0.55rem] font-medium uppercase tracking-[0.25em] text-[#A79B7D]">
                Author / Publisher
              </dt>
              <dd className="mt-1 text-[0.8rem] text-neutral-700">{entry.author || "—"}</dd>
            </div>

            {href && (
              <div>
                <dt className="text-[0.55rem] font-medium uppercase tracking-[0.25em] text-[#A79B7D]">
                  Repository
                </dt>
                <dd className="mt-1">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.8rem] underline decoration-[#C9BFA4] underline-offset-2 transition-colors hover:text-neutral-800"
                  >
                    {href}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <path d="M15 3h6v6" />
                      <path d="M10 14L21 3" />
                    </svg>
                  </a>
                </dd>
              </div>
            )}

            <div>
              <dt className="text-[0.55rem] font-medium uppercase tracking-[0.25em] text-[#A79B7D]">
                Copyright
              </dt>
              <dd className="mt-1 text-[0.7rem] leading-relaxed text-neutral-500">
                {copyrightText || "No copyright notice provided."}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ---------------------------------------------------------
export default function CreditsPage() {
  const [selected, setSelected] = useState<LicenseEntry | null>(null);

  const packages = useMemo<LicenseEntry[]>(
    () =>
      (licenses as LicenseEntry[]).filter(
        (p) => p && p.license && p.license !== "UNLICENSED",
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-[#F5F0E6] font-[family-name:var(--font-geist-sans)] text-neutral-800">
      <header className="flex items-center px-6 pb-8 pt-14 sm:px-12">
        <BackLink />
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 pb-24 sm:px-12">
        <h1 className="text-center text-2xl font-light uppercase tracking-[0.3em] sm:text-3xl">
          Credits
        </h1>
        <p className="mt-3 text-center text-[0.7rem] tracking-wide text-neutral-400">
          Built on {packages.length} open-source packages. Tap one for its license.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <button
              key={pkg.name}
              onClick={() => setSelected(pkg)}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[#EAE2D5] bg-white/80 px-4 py-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D8CBB0] hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            >
              <span className="min-w-0 truncate text-[0.8rem] font-medium tracking-wide text-neutral-800">
                {pkg.name}
              </span>
              <span className="flex-shrink-0 rounded-[3px] border border-[#C9BFA4] bg-[#EAE2D5]/40 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-[#8A7A55]">
                {licenseLabel(pkg.license)}
              </span>
            </button>
          ))}
        </div>

        <footer className="mt-20 border-t border-[#E5D9C2] pt-8 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#B8A98A]">
            Cube in One · Crafted with care · 2026
          </p>
        </footer>
      </main>

      {selected && <LicenseModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}