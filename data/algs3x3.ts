import type { AlgCase } from "./algs";

// ==========================================================================
// 3x3 full algorithm dataset.
//
// First-level sets:
//   F2L (renders via twisty-player 3D per routing rule)
//   OLL (all 57 cases, grouped by Cross/Dot/Line/Shape)
//   PLL (all 21 cases)
// ==========================================================================

// --- F2L: First Two Layers (3D view with F2L stickering mask) -------------
const F2L: AlgCase[] = [
  // Basic corner-edge pairs
  { id: "f2l-1",  name: "Basic 1",  cube: "3x3", set: "F2L", group: "Basic", setup: "U R U' R'",          recommended: "U R U' R'",          viewMode: "3D", stickering: "F2L", tags: ["Essential"] },
  { id: "f2l-2",  name: "Basic 2",  cube: "3x3", set: "F2L", group: "Basic", setup: "F R' F' R",          recommended: "R' F R F'",          viewMode: "3D", stickering: "F2L", tags: ["Basic"] },
  { id: "f2l-3",  name: "Basic 3",  cube: "3x3", set: "F2L", group: "Basic", setup: "U' R U R'",          recommended: "U' R U R'",          viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-4",  name: "Basic 4",  cube: "3x3", set: "F2L", group: "Basic", setup: "U' F' U F",          recommended: "U' F' U F",          viewMode: "3D", stickering: "F2L", tags: [] },
  // Separated pairs
  { id: "f2l-5",  name: "Separated 1", cube: "3x3", set: "F2L", group: "Separated", setup: "R U2 R' U R U' R'", recommended: "R U2 R' U R U' R'", viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-6",  name: "Separated 2", cube: "3x3", set: "F2L", group: "Separated", setup: "U R U2 R' U R U' R'", recommended: "U R U2 R' U R U' R'", viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-7",  name: "Separated 3", cube: "3x3", set: "F2L", group: "Separated", setup: "R' U2 R U' R' U R",  recommended: "R' U2 R U' R' U R", viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-8",  name: "Separated 4", cube: "3x3", set: "F2L", group: "Separated", setup: "F' U2 F U F' U' F",  recommended: "F' U2 F U F' U' F", viewMode: "3D", stickering: "F2L", tags: [] },
  // AUF adjustments
  { id: "f2l-9",  name: "AUF 1", cube: "3x3", set: "F2L", group: "AUF", setup: "U R U' R' U' F' U F", recommended: "U R U' R' U' F' U F", viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-10", name: "AUF 2", cube: "3x3", set: "F2L", group: "AUF", setup: "U' F' U F U R U' R'", recommended: "U' F' U F U R U' R'", viewMode: "3D", stickering: "F2L", tags: [] },
  // Keyhole / bad cases
  { id: "f2l-11", name: "Keyhole 1", cube: "3x3", set: "F2L", group: "Keyhole", setup: "R U R' U R U2 R'", recommended: "R U R' U R U2 R'", viewMode: "3D", stickering: "F2L", tags: ["Advanced"] },
  { id: "f2l-12", name: "Keyhole 2", cube: "3x3", set: "F2L", group: "Keyhole", setup: "R' U R' F R F' U R", recommended: "R' U R' F R F' U R", viewMode: "3D", stickering: "F2L", tags: ["Advanced"] },
  { id: "f2l-13", name: "Hidden 1",  cube: "3x3", set: "F2L", group: "Hidden",  setup: "R U R' F' R U R' U' R' F R2 U' R'", recommended: "R U R' F' R U R' U' R' F R2 U' R'", viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-14", name: "Hidden 2",  cube: "3x3", set: "F2L", group: "Hidden",  setup: "R' F R F' U R U' R'", recommended: "R' F R F' U R U' R'", viewMode: "3D", stickering: "F2L", tags: [] },
  // 41 Essential F2L cases (expandable)
  { id: "f2l-15", name: "Standard 1", cube: "3x3", set: "F2L", group: "Standard", setup: "R U R'",         recommended: "R U R'",         viewMode: "3D", stickering: "F2L", tags: ["Essential"] },
  { id: "f2l-16", name: "Standard 2", cube: "3x3", set: "F2L", group: "Standard", setup: "F' U' F",         recommended: "F' U' F",         viewMode: "3D", stickering: "F2L", tags: ["Essential"] },
  { id: "f2l-17", name: "Standard 3", cube: "3x3", set: "F2L", group: "Standard", setup: "U2 R U2 R' U R U' R'", recommended: "U2 R U2 R' U R U' R'", viewMode: "3D", stickering: "F2L", tags: [] },
  { id: "f2l-18", name: "Standard 4", cube: "3x3", set: "F2L", group: "Standard", setup: "U2 L' U2 L U' L' U L",  recommended: "U2 L' U2 L U' L' U L", viewMode: "3D", stickering: "F2L", tags: [] },
];

// --- OLL: Orientation of the Last Layer (57 cases, grouped) ---------------
// groups: Cross, Dot, Line, P/O (corners permuted/oriented),
//         W/S, Knight (P), Headlights (H), (C/W/S/T/Dot/L/Cross/P...)
// We organize them under the canonical OLL group naming:
//   Dot, Line, Cross, (corners-OCLL subtypes), Sune-shapes, Anti-sune shapes, etc.

type OLLGroup = "Dot" | "Line" | "Cross" | "Sune" | "Anti-Sune" | "P" | "W" | "Headlights" | "Knight" | "L" | "T" | "Pi" | "H" | "Fish";

function OLL(
  id: string,
  name: string,
  group: OLLGroup,
  setup: string,
  recommended: string,
  others?: string[],
  tags: string[] = []
): AlgCase {
  return { id, name, cube: "3x3", set: "OLL", group, setup, recommended, others, viewMode: "2D", stickering: "OLL", tags };
}

const OLLs: AlgCase[] = [
  // ===== Cross (OCLL + EO on edges = OCLL cases, yellow cross solved) =====
  OLL("oll-21", "OLL 21 (Sune)",        "Cross",     "R U R' U R U2 R'",            "R U R' U R U2 R'",              ["y R U2 R' U' R U' R'"], ["OCLL"]),
  OLL("oll-22", "OLL 22 (Anti-Sune)",   "Cross",     "R U2 R' U' R U' R'",           "R U2 R' U' R U' R'",           ["y R' U2 R U R' U R"],   ["OCLL"]),
  OLL("oll-23", "OLL 23 (Pi)",          "Cross",     "R U2 R2 U' R2 U' R2 U2 R'",    "R U2 R2 U' R2 U' R2 U2 R'",    ["r U R' U R U2 r'"],      ["OCLL","Symmetric"]),
  OLL("oll-24", "OLL 24 (H)",           "Cross",     "R U R' U R' F R F' U2 R' F R F' R U R' U'", "R U R' U R' F R F' U2 R' F R F' R U R' U'", ["M2 U M2 U2 M2 U M2"], ["OCLL","Symmetric"]),
  OLL("oll-25", "OLL 25 (Headlights L)","Headlights","R U2 R2 U R' U R U2 R' F R F'",  "R U2 R2 U R' U R U2 R' F R F'",   ["y R2 D R' U2 R D' R' U2 R'"], ["OCLL"]),
  OLL("oll-26", "OLL 26 (Headlights R)","Headlights","F R' F R2 U' R' U' R U R' F2",   "F R' F R2 U' R' U' R U R' F2",    [],                        ["OCLL"]),
  OLL("oll-27", "OLL 27 (T)",           "T",         "R U R' U' R' F R F'",           "R U R' U' R' F R F'",           ["(R U R' U') (R' F R F')"], []),
  OLL("oll-28", "OLL 28 (U)",           "Cross",     "R U2 R' U' R U' R' U2 R' F R F'","R U2 R' U' R U' R' U2 R' F R F'", [],                        ["OCLL"]),

  // ===== Dot (no edges oriented) =====
  OLL("oll-1",  "OLL 1",  "Dot",  "R U2 R' U' R U R' U R U' R'",             "R U2 R' U' R U R' U R U' R'",         ["M R U R' U' M'"], ["Dot"]),
  OLL("oll-2",  "OLL 2",  "Dot",  "R U R' U R U2 R' U R U' R'",              "R U R' U R U2 R' U R U' R'",          ["R U R' U R' F R F' U R U2 R'"], ["Dot"]),
  OLL("oll-3",  "OLL 3",  "Dot",  "r U R' U' r' F R F'",                     "r U R' U' r' F R F'",                 ["M R U R' U' M' U R U' R'"], ["Dot"]),
  OLL("oll-4",  "OLL 4",  "Dot",  "f R U R' U' f' U' F R U R' U' F'",        "f R U R' U' f' U' F R U R' U' F'",    [], ["Dot"]),
  OLL("oll-5",  "OLL 5",  "Dot",  "F R U R' U' F' f R U R' U' f'",           "F R U R' U' F' f R U R' U' f'",       [], ["Dot"]),
  OLL("oll-6",  "OLL 6",  "Dot",  "R U R2 U' R' F R U R U' R' F' R2",        "R U R2 U' R' F R U R U' R' F' R2",    ["R U R' U R U' R' U R U2 R' U R U' R'"], ["Dot"]),
  OLL("oll-7",  "OLL 7",  "Dot",  "r U R' U R U2 r' U' R U R' U' R' F R F'", "r U R' U R U2 r' U' R U R' U' R' F R F'", [], ["Dot"]),
  OLL("oll-8",  "OLL 8",  "Dot",  "R' F R U R U' R2 F' R2 U' R' U R U R'",   "R' F R U R U' R2 F' R2 U' R' U R U R'", [], ["Dot"]),

  // ===== Line (two opposite edges oriented) =====
  OLL("oll-9",  "OLL 9",  "Line", "r U R' U R' F R F' U2 M R U R' U' r'",   "r U R' U R' F R F' U2 M R U R' U' r'", ["M R U R' U' r' R U R U' R'"], ["Line"]),
  OLL("oll-10", "OLL 10", "Line", "R U R' U R' F R F' R U2 R' U' R' F R F'","R U R' U R' F R F' R U2 R' U' R' F R F'", [], ["Line"]),
  OLL("oll-11", "OLL 11", "Line", "F R U R' U' F' R U R' U R' F R F'",       "F R U R' U' F' R U R' U R' F R F'",    ["F R U R' U' f' U' R U R' U' F'"], ["Line"]),
  OLL("oll-12", "OLL 12", "Line", "R U2 R2 F R F' R U2 R' U' R U' R'",       "R U2 R2 F R F' R U2 R' U' R U' R'",    [], ["Line"]),
  OLL("oll-13", "OLL 13", "Line", "r' U' R U' R' U R U' R' U2 r",            "r' U' R U' R' U R U' R' U2 r",         ["y' L F' L' F L U' L' U L U2 L' y"], ["Line"]),
  OLL("oll-14", "OLL 14", "Line", "R U R' U R U' R' U' R' F R F'",           "R U R' U R U' R' U' R' F R F'",        ["F R U R' U' R U R' U' F'"], ["Line"]),
  OLL("oll-15", "OLL 15", "Line", "R' F R U R' U' F' U R U R'",              "R' F R U R' U' F' U R U R'",           ["y F U R U2 R' U' R U R' F'"], ["Line"]),
  OLL("oll-16", "OLL 16", "Line", "F U R U' R2 F' R U R U' R'",              "F U R U' R2 F' R U R U' R'",           ["y R U2 R' U2 R' F R F' R U2 R'"], ["Line"]),

  // ===== (two adjacent edges oriented) =====
  OLL("oll-17", "OLL 17", "P",   "R' U' R U' R' D R U R' D' R U2 R'",       "R' U' R U' R' D R U R' D' R U2 R'",    ["R U R2 U' R U' R U2 R' U R' F R F'"], ["P"]),
  OLL("oll-18", "OLL 18", "W",   "R U R' U R U' R' F' U' F R' F R F'",      "R U R' U R U' R' F' U' F R' F R F'",   [], ["W"]),
  OLL("oll-19", "OLL 19", "L",   "F R' F R2 U' R' U' R U R' F2",            "F R' F R2 U' R' U' R U R' F2",         ["y R' U' R U' R' D R U R' D' R"], ["L"]),
  OLL("oll-20", "OLL 20", "T",   "F R U R' U' R U R' U' F'",                "F R U R' U' R U R' U' F'",             ["f R U R' U' f' U R U R' U R U2 R'"], ["T"]),

  // ===== Sune-style (2 corners oriented) =====
  OLL("oll-29", "OLL 29", "Sune", "R U2 R2 F R F' R U2 R'",                 "R U2 R2 F R F' R U2 R'",               ["r U R' U R U2 r'"], ["Sune"]),
  OLL("oll-30", "OLL 30", "Sune", "R U R' U' R' F R2 U' R' U' R U R' F'",   "R U R' U' R' F R2 U' R' U' R U R' F'", [], ["Sune"]),
  OLL("oll-31", "OLL 31", "Sune", "F R U R' U R U2 R' U' F'",               "F R U R' U R U2 R' U' F'",             ["f R U R' U R U2 R' f'"], ["Sune"]),
  OLL("oll-32", "OLL 32", "Sune", "R U R' U R U2 R2 F R F'",                "R U R' U R U2 R2 F R F'",              ["R U R2 U' R' U R U2 R' U R' F R F'"], ["Sune"]),
  OLL("oll-33", "OLL 33", "Sune", "R U R' U R U' R' U R U2 R'",             "R U R' U R U' R' U R U2 R'",           ["r U R' U R U' R' U R U2 r'"], ["Sune"]),
  OLL("oll-34", "OLL 34", "Sune", "R U R2 U' R2 U' R2 U2 R'",               "R U R2 U' R2 U' R2 U2 R'",             ["r U R' U R U2 R' U r' R U R'"], ["Sune"]),
  OLL("oll-35", "OLL 35", "Sune", "R U R2 U' R' F R F' R U R'",             "R U R2 U' R' F R F' R U R'",           [], ["Sune"]),
  OLL("oll-36", "OLL 36", "Sune", "F U R U2 R' U' R U R' U' F'",            "F U R U2 R' U' R U R' U' F'",          ["f U R U2 R' U' R U R' U' f'"], ["Sune"]),

  // ===== Anti-Sune style =====
  OLL("oll-37", "OLL 37", "Anti-Sune", "R' U2 R' F R F' R' U2 R'",           "R' U2 R' F R F' R' U2 R'",         ["R' U2 R2 U R2 U R2 U2 R"], ["Anti-Sune"]),
  OLL("oll-38", "OLL 38", "Anti-Sune", "R' U R U' R U R' U' R' F R F'",      "R' U R U' R U R' U' R' F R F'",    ["R' U2 R' D' R U' R' D R U R"], ["Anti-Sune"]),
  OLL("oll-39", "OLL 39", "Anti-Sune", "R' F R U R' U' F' U' R U2 R'",       "R' F R U R' U' F' U' R U2 R'",     ["y L' U L U' L' U2 l U' L' U L U' L"], ["Anti-Sune"]),
  OLL("oll-40", "OLL 40", "Anti-Sune", "R' U2 R U R' U R F R' F'",           "R' U2 R U R' U R F R' F'",         [], ["Anti-Sune"]),
  OLL("oll-41", "OLL 41", "Anti-Sune", "R' U' R U' R' U R U2 R'",            "R' U' R U' R' U R U2 R'",          ["l' U' L U' L' U L U2 L"], ["Anti-Sune"]),
  OLL("oll-42", "OLL 42", "Anti-Sune", "R2 U' R U R' U2 R' U R' F R F'",     "R2 U' R U R' U2 R' U R' F R F'",   [], ["Anti-Sune"]),
  OLL("oll-43", "OLL 43", "Anti-Sune", "F R' F' R U' R' U2 R U' R'",         "F R' F' R U' R' U2 R U' R'",       ["y R2 U R' U' R U2 R' U' R U R'"], ["Anti-Sune"]),
  OLL("oll-44", "OLL 44", "Anti-Sune", "R' U2 R' U R U' R' U R F R' F'",     "R' U2 R' U R U' R' U R F R' F'",   [], ["Anti-Sune"]),

  // ===== Pi / Fish / H / T / Knight edge misc styles =====
  OLL("oll-45", "OLL 45", "Pi",   "R U R2 U' R2 D' R U' R' D R' F R F'", "R U R2 U' R2 D' R U' R' D R' F R F'", ["r U R2 U' R2 U R U2 r'"], ["Pi"]),
  OLL("oll-46", "OLL 46", "Pi",   "F R U R' U' F2 L' U' L U L F'",      "F R U R' U' F2 L' U' L U L F'",      ["f R U R' U' f2 l' U' L U l"], ["Pi"]),
  OLL("oll-47", "OLL 47", "Pi",   "r U R' U R' F R F' r' F R F'",       "r U R' U R' F R F' r' F R F'",       [], ["Pi"]),
  OLL("oll-48", "OLL 48", "Pi",   "F R U R' U R' F2 R F R'",            "F R U R' U R' F2 R F R'",            ["f R U R' U R' f2 R F R'"], ["Pi"]),
  OLL("oll-49", "OLL 49", "Fish", "R' U' F R U R' U' F' U R",           "R' U' F R U R' U' F' U R",           ["y' L' U' F L U L' U' F' U L"], ["Fish"]),
  OLL("oll-50", "OLL 50", "Fish", "F R U R' U' R' F R F' R U R' U' R' F R F'", "F R U R' U' R' F R F' R U R' U' R' F R F'", [], ["Fish"]),
  OLL("oll-51", "OLL 51", "Knight", "R U2 R2 U' R U R' U R2 U2 R'",      "R U2 R2 U' R U R' U R2 U2 R'",       ["y L U2 L2 U' L U L' U L2 U2 L'"], ["Knight"]),
  OLL("oll-52", "OLL 52", "Knight", "R' U2 R2 U R' U' R U' R2 U2 R",     "R' U2 R2 U R' U' R U' R2 U2 R",      [], ["Knight"]),
  OLL("oll-53", "OLL 53", "W",      "R U R' U R' F R F' U R U' R'",      "R U R' U R' F R F' U R U' R'",       ["y R' F R F' R' U R U' R U R'"], ["W"]),
  OLL("oll-54", "OLL 54", "W",      "R' U' R U' R' F R F' U' R U R'",    "R' U' R U' R' F R F' U' R U R'",     ["F' L' U' L U' L' U L U F"], ["W"]),
  OLL("oll-55", "OLL 55", "H",      "f R U R' U R' F R F' f'",           "f R U R' U R' F R F' f'",            ["M' U M U2 M' U M"], ["H"]),
  OLL("oll-56", "OLL 56", "H",      "r U R' U R' F R F' r' R F R' F'",   "r U R' U R' F R F' r' R F R' F'",    [], ["H"]),
  OLL("oll-57", "OLL 57", "H",      "R U R' U R' F R F' R U R' U' R' F R F' U2", "R U R' U R' F R F' R U R' U' R' F R F' U2", [], ["H"]),
];

// --- PLL: Permutation of the Last Layer (21 canonical cases) ---------------
type PLLGroup = "A" | "E" | "F" | "Ga" | "Gb" | "Gc" | "Gd" | "H" | "Ja" | "Jb" | "Na" | "Nb" | "Ra" | "Rb" | "T" | "Ua" | "Ub" | "V" | "Y" | "Z";

function PLL(
  id: string,
  name: string,
  group: PLLGroup,
  setup: string,
  recommended: string,
  others?: string[]
): AlgCase {
  return { id, name, cube: "3x3", set: "PLL", group, setup, recommended, others, viewMode: "2D", stickering: "PLL", tags: ["PLL"] };
}

const PLLs: AlgCase[] = [
  PLL("pll-a-perm-a", "A Perm (a)", "A",  "x' R U' R' D R U R' D' R U R' D R U' R' D' x", "x' (R U' R' D) (R U R' D') (R U R' D) (R U' R' D') x",
    ["l' U R' D2 R U' R' D2 R l"]),
  PLL("pll-a-perm-b", "A Perm (b)", "A",  "x R' U R D' R' U' R D R' U' R D' R' U R D x'", "x' R' F R' B2 R F' R' B2 R2 x'",
    ["(R' F R' B2) (R F' R' B2) R2"]),
  PLL("pll-e-perm",   "E Perm",     "E",  "R2 U R' U R' U R' U2 R2 R2 U' R U R U' R U' R U' R2",
    "x' R U' R' D R U R' D' R U R' D R U' R' D' x y' x' R' U R D' R' U' R D R' U' R D' R' U R D x' y",
    ["(R U R' U R U R' F') (R U R' U' R' F R2) U' R' U2"]),
  PLL("pll-f-perm",   "F Perm",     "F",  "R U' R' U' R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    ["F R U' R' U' R U R' F' R U R' U' R' F R F'"]),
  PLL("pll-g-perm-ga", "G Perm (Ga)", "Ga", "R2 U R' U R' U' R U' R2 U' D R' U R D'",
    "R2 U R' U R' U' R U' R2 D U' R' U R D'",
    ["R2 U R U R' U' R' U' R' U R'"]),
  PLL("pll-g-perm-gb", "G Perm (Gb)", "Gb", "D' R U' R D R2 U' R U' R' U R' U R2",
    "D' R U' R D R2 U' R U' R' U R' U R2",
    ["R' U2 R' D' R U' R' D R U R D' R' U R D"]),
  PLL("pll-g-perm-gc", "G Perm (Gc)", "Gc", "R2 U' R U' R U R' U R2 U D' R U' R' D",
    "R2 U' R U' R U R' U R2 U D' R U' R' D",
    ["R2 U' R' U' R U R U R U' R"]),
  PLL("pll-g-perm-gd", "G Perm (Gd)", "Gd", "D R' U R' D' R2 U R' U R U' R U' R2",
    "D R' U R' D' R2 U R' U R U' R U' R2",
    ["R U2 R D R' U R D' R' U' R D R' U2 R D'"]),
  PLL("pll-h-perm",   "H Perm",     "H",  "R2 U2 R' U2 R2 U2 R2 U2 R' U2 R2",
    "M2 U M2 U2 M2 U M2",
    ["R2 U2 R U2 R2 U2 R2 U2 R U2 R2"]),
  PLL("pll-j-perm-ja", "J Perm (Ja)", "Ja", "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    "R' U L' U2 R U' R' U2 R L",
    ["y L' U' L F L' U' L U L F' L2 U L"]),
  PLL("pll-j-perm-jb", "J Perm (Jb)", "Jb", "R U R' F' R U R' U' R' F R2 U' R'",
    "R U R' F' R U2 R' U2 R' F R U R U2 R' U2 R'",
    ["y' L U L' F L U2 L' U2 L F' L' U' L' U2 L U2"]),
  PLL("pll-n-perm-na", "N Perm (Na)", "Na", "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    "R U2 R' U2 R B' R' U' R U R B R2 U",
    ["(R' U R U') R2 y (R' U R U') R2 F'"]),
  PLL("pll-n-perm-nb", "N Perm (Nb)", "Nb", "R' U2 R U2 R' F R U R' U' R' F' R2 U' R",
    "R' U2 R' D' R U' R' D R U R D' R' U R D R' U2 R",
    ["z U' R D' R2 U R' D R' U2 R U2 z'"]),
  PLL("pll-r-perm-ra", "R Perm (Ra)", "Ra", "R U R' F' R U2 R' U2 R' F R U R U2 R' U2 R'",
    "R U R' U' R' F R2 U' R' U' R U R' F' R2 U R",
    ["R U' R' U R' F R F' U' R U2 R' U2"]),
  PLL("pll-r-perm-rb", "R Perm (Rb)", "Rb", "R2 F R U R U' R' F' R U2 R' U2 R U2 R' U R F R' F'",
    "R' U2 R U2 R B' R' U' R U R B R2 U' R U' R'",
    ["L' U' L U L F' L' F U L' U2 L U2"]),
  PLL("pll-t-perm",   "T Perm",     "T",  "R U R' U' R' F R2 U' R' U' R U R' F'",
    "R U R' U' R' F R2 U' R' U' R U R' F'",
    ["(R U R' U' R' F R F') (R U R' U') R' F R2 U' R' F'"]),
  PLL("pll-u-perm-ua", "U Perm (Ua)", "Ua", "R U' R U R U R U' R' U' R2",
    "R U' R U R U R U' R' U' R2",
    ["M2 U M U2 M' U M2"]),
  PLL("pll-u-perm-ub", "U Perm (Ub)", "Ub", "R2 U R U R' U' R' U' R' U R'",
    "M2 U' M U2 M' U' M2",
    ["R' U R' U' R' U' R' U R U R2"]),
  PLL("pll-v-perm",   "V Perm",     "V",  "R' U R' U' y R' F' R2 U' R' U R' F R F",
    "R' U R' U' y R' F' R2 U' R' U R' F R F",
    ["R' U R' d' R' F' R2 U' R' U R' F R F"]),
  PLL("pll-y-perm",   "Y Perm",     "Y",  "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    ["R' U R' U' y R' F' R2 U' R' U R' F R F y'"]),
  PLL("pll-z-perm",   "Z Perm",     "Z",  "M2 U M2 U M' U2 M2 U2 M'",
    "M2 U M2 U M' U2 M2 U2 M'",
    ["U' R U' R' U R U R' U' R' F R2 U' R' U R U R F'"]),
];

export const algData3x3: AlgCase[] = [...F2L, ...OLLs, ...PLLs];
