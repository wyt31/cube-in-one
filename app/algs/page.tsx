"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  CUBES,
  CATEGORIES,
  algData,
  type CubeType,
  type AlgCase,
  type CategorySpec,
} from "@/data/algs";
import AlgCardCube from "@/components/AlgCardCube";
import AlgDetailModal from "@/components/AlgDetailModal";

function categoryNames(cube: CubeType): string[] {
  return CATEGORIES[cube].map((c) => c.name);
}

function findCategory(cube: CubeType, name: string): CategorySpec | undefined {
  return CATEGORIES[cube].find((c) => c.name === name);
}

export default function AlgsPage() {
  const [selectedCube, setSelectedCube] = useState<CubeType>("2x2");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES["2x2"][0].name
  );
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>("All");
  const [selectedAlg, setSelectedAlg] = useState<AlgCase | null>(null);

  // Read URL params on mount (from home page search navigation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cube = params.get("cube") as CubeType | null;
    const set = params.get("set");
    const group = params.get("group");
    if (cube && CUBES.includes(cube)) {
      setSelectedCube(cube);
      const cat = CATEGORIES[cube].find((c) => c.name === set);
      if (cat) {
        setSelectedCategory(set!);
        if (group) setSelectedGroup(group);
      }
    }
  }, []);

  const availableGroups = useMemo(() => {
    const cat = findCategory(selectedCube, selectedCategory);
    // If the category declares its group order explicitly, honor it.
    // TCLL -> [TCLL+, TCLL-]; LS -> [LS1..LS9]
    if (cat?.groups && cat.groups.length > 0) {
      return ["All", ...cat.groups];
    }
    // Otherwise derive from the algorithm dataset and preserve first-seen order.
    const groups = new Set<string>();
    algData.forEach((alg) => {
      if (alg.cube === selectedCube && alg.set === selectedCategory) {
        groups.add(alg.group);
      }
    });
    return ["All", ...Array.from(groups)];
  }, [selectedCube, selectedCategory]);

  // Available sub-groups (TCLL Hammer / Spaceship / ...). Derived from the
  // data already filtered by cube + category + group, so the list narrows
  // correctly when the user picks TCLL+ or TCLL-.
  const availableSubGroups = useMemo(() => {
    const subGroups = new Set<string>();
    algData.forEach((alg) => {
      if (
        alg.cube === selectedCube &&
        alg.set === selectedCategory &&
        (selectedGroup === "All" || alg.group === selectedGroup) &&
        alg.subGroup
      ) {
        subGroups.add(alg.subGroup);
      }
    });
    return subGroups.size > 0 ? ["All", ...Array.from(subGroups)] : [];
  }, [selectedCube, selectedCategory, selectedGroup]);

  const filteredAlgs = useMemo(() => {
    return algData.filter((alg) => {
      const matchCube = alg.cube === selectedCube;
      const matchCategory = alg.set === selectedCategory;
      const matchGroup = selectedGroup === "All" || alg.group === selectedGroup;
      const matchSubGroup =
        selectedSubGroup === "All" || alg.subGroup === selectedSubGroup;
      return matchCube && matchCategory && matchGroup && matchSubGroup;
    });
  }, [selectedCube, selectedCategory, selectedGroup, selectedSubGroup]);

  // Group cards into sections. For TCLL the section header is the sub-category
  // (Hammer, Spaceship, ...) because `group` is the family filter (TCLL+/-).
  // For all other sets (CLL, OLL, ...) `group` is the natural section header
  // (Sune, Anti-Sune, T, ...).
  const groupedAlgs = useMemo(() => {
    const sections: { group: string; items: AlgCase[] }[] = [];
    const seen = new Map<string, number>();
    filteredAlgs.forEach((alg) => {
      const key = alg.subGroup ?? alg.group;
      const idx = seen.get(key);
      if (idx === undefined) {
        seen.set(key, sections.length);
        sections.push({ group: key, items: [alg] });
      } else {
        sections[idx].items.push(alg);
      }
    });
    return sections;
  }, [filteredAlgs]);

  const handleCubeChange = (cube: CubeType) => {
    setSelectedCube(cube);
    setSelectedCategory(CATEGORIES[cube][0].name);
    setSelectedGroup("All");
    setSelectedSubGroup("All");
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedGroup("All");
    setSelectedSubGroup("All");
  };

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedSubGroup("All");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-[family-name:var(--font-geist-sans)] text-neutral-800">
      {/* Header */}
      <header className="px-6 pb-10 pt-14 sm:px-12">
        <Link
          href="/"
          className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-neutral-400 transition-colors hover:text-neutral-800"
        >
          &lt; Cube in One
        </Link>
        <h1 className="mt-10 text-2xl font-extralight uppercase tracking-[0.15em] sm:text-3xl">
          Algorithm Sets
        </h1>
      </header>

      <main className="px-6 pb-20 sm:px-12">
        {/* Tier 1: Cube Type */}
        <div className="flex gap-4 border-b border-[#E8E8E4] pb-4">
          {CUBES.map((cube) => (
            <button
              key={cube}
              onClick={() => handleCubeChange(cube)}
              className={`text-sm tracking-[0.15em] transition-all ${
                selectedCube === cube
                  ? "font-medium text-neutral-800"
                  : "text-neutral-400 hover:text-neutral-500"
              }`}
            >
              {cube}
            </button>
          ))}
        </div>

        {/* Tier 2: Category (first level under each cube) */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categoryNames(selectedCube).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-4 py-1.5 text-[0.65rem] tracking-[0.1em] transition-colors ${
                selectedCategory === cat
                  ? "bg-neutral-800 text-[#fbfbf9]"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tier 2.5: Group Filter (second level — TCLL+/TCLL-, LS1..LS9) */}
        {availableGroups.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {availableGroups.map((group) => (
              <button
                key={group}
                onClick={() => handleGroupChange(group)}
                className={`text-[0.6rem] uppercase tracking-[0.15em] transition-colors ${
                  selectedGroup === group
                    ? "font-bold text-neutral-800"
                    : "text-neutral-400 hover:text-neutral-500"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        {/* Tier 2.6: Sub-Group Filter (TCLL Hammer / Spaceship / ...) */}
        {availableSubGroups.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {availableSubGroups.map((sg) => (
              <button
                key={sg}
                onClick={() => setSelectedSubGroup(sg)}
                className={`text-[0.6rem] uppercase tracking-[0.15em] transition-colors ${
                  selectedSubGroup === sg
                    ? "font-bold text-neutral-800"
                    : "text-neutral-400 hover:text-neutral-500"
                }`}
              >
                {sg}
              </button>
            ))}
          </div>
        )}

        {/* Tier 3: Cards — grouped by subCategory (alg.group) */}
        {groupedAlgs.length > 0 ? (
          <div className="mt-10 flex flex-col gap-10">
            {groupedAlgs.map((section) => (
              <section key={section.group}>
                {/* Group header (subCategory) */}
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-800">
                    {section.group}
                  </h2>
                  <span className="text-[0.65rem] tracking-[0.15em] text-neutral-300">
                    {section.items.length} {section.items.length === 1 ? "case" : "cases"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((alg) => (
                    <div
                      key={alg.id}
                      onClick={() => setSelectedAlg(alg)}
                      className="group relative flex min-h-[120px] h-auto cursor-pointer items-center gap-4 rounded-2xl border border-[#E8E8E4] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-[#D8D8D2] hover:bg-[#FAFAF8] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                    >
                      {/* Inkan-style badge: TCLL+ / TCLL- (only for TCLL set) */}
                      {alg.set === "TCLL" && (
                        <span
                          className={`absolute top-3 right-3 text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-[3px] border select-none ${
                            alg.group === "TCLL+"
                              ? "border-[#4A6B5D] text-[#4A6B5D] bg-[#4A6B5D]/5"
                              : "border-[#A65B4C] text-[#A65B4C] bg-[#A65B4C]/5"
                          }`}
                        >
                          {alg.group}
                        </span>
                      )}
                      {/* Left: 96px cube + case name */}
                      <div className="flex w-24 flex-shrink-0 flex-col items-center gap-2">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#F0F0EE] bg-[#FBFBFA] p-1.5">
                          <AlgCardCube alg={alg} className="h-full w-full" />
                        </div>
                        <h3 className="text-center text-[0.7rem] font-medium leading-tight tracking-wide text-neutral-800">
                          {alg.name}
                        </h3>
                      </div>

                      {/* Right: single strongest (S-tier) recommended formula only.
                          Elastic height — long formulas gracefully expand the
                          card, never overlapping the case name on the left. */}
                      <div className="flex min-w-0 flex-1 items-center">
                        <code className="block min-w-0 flex-1 font-[family-name:var(--font-geist-mono)] text-[12.5px] font-medium leading-snug tracking-wide text-neutral-800">
                          {alg.recommended}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-10 py-20 text-center">
            <p className="text-xs tracking-[0.2em] text-neutral-300">
              NO ALGORITHMS FOUND IN THIS CATEGORY.
            </p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedAlg && (
        <AlgDetailModal
          alg={selectedAlg}
          onClose={() => setSelectedAlg(null)}
        />
      )}
    </div>
  );
}
