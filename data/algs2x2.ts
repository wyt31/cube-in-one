// ==========================================================================
// 2x2 algorithm database — type definitions + mock placeholder.
//
// Schema (v2):
//   - TwoByTwoAlg: main alg carries alg/tags/cancelPrefix (aligned with SubAlg),
//     plus an optional subAlgs[] variant list.
//   - SubAlg: a single variant algorithm with optional tags / cancelPrefix /
//     note. tags may carry values like "Cancellation", "Multi-Angle",
//     "Mirror", "One-Handed".
//
// NOTE: this file currently holds a single Mock entry for testing the type
// system + rendering pipeline. The full dataset will be re-imported later in
// this richer format.
// ==========================================================================

export interface SubAlg {
  alg: string;             // formula text
  tags?: string[];         // e.g. "Cancellation", "Multi-Angle", "Mirror", "One-Handed"
  cancelPrefix?: string;  // cancellation prefix reservation, e.g. "R U"
  note?: string;           // remark
}

export interface TwoByTwoAlg {
  id: string;              // unique id
  name: string;            // e.g. "Sune 1"
  category: string;       // e.g. "CLL", "EG-1"
  subCategory?: string;    // e.g. "Sune"
  case?: string;

  // main algorithm (aligned with SubAlg fields)
  alg: string;             // default recommended main alg
  tags?: string[];
  cancelPrefix?: string;

  // variant algorithms
  subAlgs?: SubAlg[];
}

export const twoByTwoData: TwoByTwoAlg[] = [
  {
    id: "cll-sune-1",
    name: "Sune 1",
    category: "CLL",
    subCategory: "Sune",
    alg: "R U R' U R U2 R'",
    tags: ["Cancellation"],
    cancelPrefix: "R U",
    subAlgs: [
      {
        alg: "(U') R' F R2 F' U' R' U' R2 U R'",
        tags: ["Cancellation", "Multi-Angle"],
      },
      {
        alg: "F R' F' R U2 R U2 R'",
        tags: ["Mirror"],
      },
    ],
  },
];
