"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import licenses from "@/data/licenses.json";

// ============================================================================
// CreditsGrid — a 3-column grid of every open-source package in licenses.json,
// each card opening a warm washi-style detail modal.
// ============================================================================

export interface LicenseEntry {
  name: string;
  version?: string;
  license?: string;
  author?: string;
  repository?: string;
  copyright?: string;
}

// Direct dependencies declared in package.json (dependencies + devDependencies).
// Everything else in licenses.json is a transitive dependency.
const DIRECT_PACKAGE_NAMES = new Set<string>([
  "cubing",
  "dexie",
  "dexie-react-hooks",
  "next",
  "react",
  "react-dom",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "eslint",
  "eslint-config-next",
  "postcss",
  "tailwindcss",
  "typescript",
]);

export function isDirectDependency(pkg: LicenseEntry): boolean {
  return DIRECT_PACKAGE_NAMES.has(pkg.name);
}

/** Reduce combined/double SPDX expressions to a single friendly id. */
export function licenseLabel(license?: string): string {
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

// ---------- Grid + page states ------------------------------------------
export default function CreditsGrid({ list }: { list?: LicenseEntry[] }) {
  const [selected, setSelected] = useState<LicenseEntry | null>(null);

  const packages = useMemo<LicenseEntry[]>(
    () =>
      (list ??
        (licenses as LicenseEntry[]).filter(
          (p) => p && p.license && p.license !== "UNLICENSED",
        )),
    [list],
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {selected &&
        createPortal(
          <LicenseModal entry={selected} onClose={() => setSelected(null)} />,
          document.body,
        )}
    </>
  );
}