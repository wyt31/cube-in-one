// ==========================================================================
// 2x2 — TCLL aggregate (TCLL+ ∪ TCLL-)
//
// Re-exports the two sub-collections and a merged `tcllData` array that
// preserves the display order [TCLL+ ..., TCLL- ...].
// ==========================================================================
import type { TwoByTwoAlg } from "../types";
import { tcllPlusData } from "./tcll-plus";
import { tcllMinusData } from "./tcll-minus";

export { tcllPlusData, tcllMinusData };

export const tcllData: TwoByTwoAlg[] = [...tcllPlusData, ...tcllMinusData];
