import type { TwoByTwoAlg } from "../types";
export const cllData: TwoByTwoAlg[] = [
  {
    id: "pbl-u-layer-adj",
    name: "U-Layer adj",
    category: "PBL",
    subCategory: "U-Layer adj",
    algs: [
      {
        alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
        tier: "S",
      }
    ],
    trainerBaseAlg: "R U R' U' R' F R2 U' R' U' R U R' F'"
  },
]