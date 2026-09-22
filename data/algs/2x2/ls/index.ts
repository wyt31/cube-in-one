// ==========================================================================
// 2x2 — LS aggregate (LS1 .. LS9)
//
// Re-exports each individual lsXData and provides the merged lsData array
// preserving numeric order.
// ==========================================================================
import type { TwoByTwoAlg } from "../../types";

import { ls1Data } from "./ls1";
import { ls2Data } from "./ls2";
import { ls3Data } from "./ls3";
import { ls4Data } from "./ls4";
import { ls5Data } from "./ls5";
import { ls6Data } from "./ls6";
import { ls7Data } from "./ls7";
import { ls8Data } from "./ls8";
import { ls9Data } from "./ls9";

export {
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

export const lsData: TwoByTwoAlg[] = [
  ...ls1Data,
  ...ls2Data,
  ...ls3Data,
  ...ls4Data,
  ...ls5Data,
  ...ls6Data,
  ...ls7Data,
  ...ls8Data,
  ...ls9Data,
];
