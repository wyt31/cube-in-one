// ==========================================================================
// 2x2 — unified export barrel.
//
// Aggregates every subset (CLL, EG1, EG2, LEG, TCLL±, LS1..LS9) and exposes
// the merged `allTwoByTwoAlgs` array in a stable display order matching the
// CATEGORIES tree defined in data/algs.ts.
// ==========================================================================
import type { TwoByTwoAlg } from "../types";

import { cllData } from "./cll";
import { eg1Data } from "./eg1";
import { eg2Data } from "./eg2";
import { leg1Data } from "./leg1";
import { tcllData, tcllPlusData, tcllMinusData } from "./tcll";
import {
  lsData,
  ls1Data,
  ls2Data,
  ls3Data,
  ls4Data,
  ls5Data,
  ls6Data,
  ls7Data,
  ls8Data,
  ls9Data,
} from "./ls";

export {
  cllData,
  eg1Data,
  eg2Data,
  leg1Data,
  tcllData,
  tcllPlusData,
  tcllMinusData,
  lsData,
  ls1Data,
  ls2Data,
  ls3Data,
  ls4Data,
  ls5Data,
  ls6Data,
  ls7Data,
  ls8Data,
  ls9Data,
};

export { type TwoByTwoAlg, type Tier, type AlgItem } from "../types";

/**
 * All 2x2 algorithms, ordered to match the display tree:
 * CLL → EG1 → EG2 → LEG → TCLL(+ / -) → LS(1..9)
 */
export const allTwoByTwoAlgs: TwoByTwoAlg[] = [
  ...cllData,
  ...eg1Data,
  ...eg2Data,
  ...leg1Data,
  ...tcllData,
  ...lsData,
];
