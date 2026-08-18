"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CUBES,
  CATEGORIES,
  algData,
  AVAILABLE_TAGS,
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
  const [selectedAlg, setSelectedAlg] = useState<AlgCase | null>(null);

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

  const filteredAlgs = useMemo(() => {
    return algData.filter((alg) => {
      const matchCube = alg.cube === selectedCube;
      const matchCategory = alg.set === selectedCategory;
      const matchGroup = selectedGroup === "All" || alg.group === selectedGroup;
      return matchCube && matchCategory && matchGroup;
    });
  }, [selectedCube, selectedCategory, selectedGroup]);

  const handleCubeChange = (cube: CubeType) => {
    setSelectedCube(cube);
    setSelectedCategory(CATEGORIES[cube][0].name);
    setSelectedGroup("All");
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedGroup("All");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-[family-name:var(--font-geist-sans)] text-[#2C2C2C]">
      {/* Header */}
      <header className="px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-[#888] transition-colors hover:text-[#2C2C2C]"
        >
          &lt; Cube in One
        </Link>
        <h1 className="mt-6 text-2xl font-extralight uppercase tracking-[0.25em] sm:text-3xl">
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
                  ? "font-medium text-[#2C2C2C]"
                  : "text-[#AAA] hover:text-[#666]"
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
              className={`rounded-full border px-4 py-1.5 text-[0.65rem] tracking-[0.1em] transition-all ${
                selectedCategory === cat
                  ? "border-[#2C2C2C] bg-[#2C2C2C] text-white"
                  : "border-[#E8E8E4] bg-white text-[#888] hover:border-[#CCC]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tier 2.5: Group Filter (second level) */}
        {availableGroups.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {availableGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`text-[0.6rem] uppercase tracking-[0.15em] transition-colors ${
                  selectedGroup === group
                    ? "font-bold text-[#2C2C2C]"
                    : "text-[#AAA] hover:text-[#666]"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        )}

        {/* Tier 3: Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAlgs.length > 0 ? (
            filteredAlgs.map((alg) => (
              <div
                key={alg.id}
                onClick={() => setSelectedAlg(alg)}
                className="group flex cursor-pointer flex-col rounded-2xl border border-[#E8E8E4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              >
                {/* Rendering engine routed by alg.cube + alg.set */}
                <div className="relative mb-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-[#F0F0EE] bg-[#FBFBFA] p-3">
                  <AlgCardCube alg={alg} className="h-full w-full" />
                </div>

                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium tracking-wide text-[#2C2C2C]">
                    {alg.name}
                  </h3>
                  <span className="rounded bg-[#F5F5F2] px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-[#A0A09A]">
                    {alg.set}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-[#FBFBFA] p-4 border border-[#F0F0EE]">
                  <code className="block font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed tracking-wide text-[#555]">
                    {alg.recommended}
                  </code>
                </div>

                <div className="mt-auto pt-4 flex flex-wrap gap-1.5">
                  {alg.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6rem] text-[#BBB] before:content-['#']"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xs tracking-[0.2em] text-[#BBB]">
                NO ALGORITHMS FOUND IN THIS CATEGORY.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedAlg && (
        <AlgDetailModal
          alg={selectedAlg}
          availableTags={AVAILABLE_TAGS[selectedCube]}
          onClose={() => setSelectedAlg(null)}
        />
      )}
    </div>
  );
}
