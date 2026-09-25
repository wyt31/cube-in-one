// ==========================================================================
// 2x2 — TCLL+ (Twin Corner Last Layer, positive AUF family)
// ==========================================================================
import type { TwoByTwoAlg } from "../types";

export const tcllPlusData: TwoByTwoAlg[] = [
  {
    id: "tcll-plus-hammer-1",
    name: "Hammer 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R' F R F' R' F R F'",
        tier: "S",
      },
      {
        alg: "y F' R U R' F' R U R'",
        tier: "S",
      },
      {
        alg: "y' (U) R2 U' R2 U R2 U2 R' U2 R",
        tier: "B",
      },
      {
        alg: "(U) R U2 R' U2 R2 U R2 U' R2",
        tier: "B",
        note: "Alternative finish: (U) R U2 R' U2 R U' R' U2 R U R'"
      }
    ]
  },
  {
    id: "tcll-plus-hammer-2",
    name: "Hammer 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' R' U2 R U' F R' F'",
        tier: "S",
      },
      {
        alg: "(U) F R' F' R U R U2 R' U R U' R'",
        tier: "A",
      },
      {
        alg: "(U') F' U2 R U2 R' U2 R' F R",
        tier: "A",
      },
      {
        alg: "(U) F R' F' U' R U' R U2 R",
        tier: "B",
      },
      {
        alg: "(U) R' F R U' R2 U R2 U' R2 F",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-hammer-3",
    name: "Hammer 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "F R' F' R2 U' R' U2 R U R'",
        tier: "S",
      },
      {
        alg: "y' (U) R' U' R U' R2 F R F' R",
        tier: "S",
      },
      {
        alg: "F R' F' R' U R2 U' R2",
        tier: "A",
      },
      {
        alg: "R U2 F R F' U R' U R U' R'",
        tier: "B",
      },
      {
        alg: "F2 R' F2 R2 U' R' U2 F",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-hammer-4",
    name: "Hammer 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y R' F' R F' R U R' U R' F2 R",
        tier: "S",
      },
      {
        alg: "R U R' F R' F' R U F R' F' R",
        tier: "S",
      },
      {
        alg: "y' (U') R' U R' F R F' R U' R' U' R",
        tier: "A",
      },
      {
        alg: "(U2) R' F' R U2 R U R' F2",
        tier: "A",
      },
      {
        alg: "y (U2) F R U R' U R' F R F2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-hammer-5",
    name: "Hammer 5",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y F' R' F' R U R U R2 F' R",
        tier: "S",
      },
      {
        alg: "F R' F' R2 U2 R' U' F R' F' R",
        tier: "A",
      },
      {
        alg: "(U) F' U R' F2 R2 U R' U' R' F R",
        tier: "A",
      },
      {
        alg: "(U) F' U R U' R2 F2 R U' R' F R",
        tier: "A",
      },
      {
        alg: "(U) R' U R U' R U' R2 F R2 F'",
        tier: "A",
      },
      {
        alg: "(U2) R' U R' U2 F R F' R U' R",
        tier: "B",
      },
      {
        alg: "(U) R' F' R U2 R U' R2 F2 R F2",
        tier: "B",
      },
      {
        alg: "(U) R2 U' R2 U2 R U R' F R2 F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-hammer-6",
    name: "Hammer 6",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' (U') R' U' R' F R F' R U R' U' R",
        tier: "S",
      },
      {
        alg: "y' (U2) R' U' F R' F' R2 U R' U' R",
        tier: "S",
      },
      {
        alg: "(U') R U' R' U2 R' F R F' R U2 R'",
        tier: "A",
      },
      {
        alg: "(U) R U R' F R F' R U R' U R'",
        tier: "A",
      },
      {
        alg: "(U) R U R' F R U R' y' R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-spaceship-1",
    name: "Spaceship 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y (U2) R' F' R U R' F' R",
        tier: "S",
      },
      {
        alg: "y' (U2) R' U' R U R' U' R",
        tier: "S",
      },
      {
        alg: "y' R U2 R' U2 R2 U' R",
        tier: "B",
      },
      {
        alg: "(U2) R2 U R' U R' U2 R' U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-spaceship-2",
    name: "Spaceship 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U2) F' U R' F' R U' R' F' R F",
        tier: "S"
      },
      {
        alg: "(U) y F R U' R' U' R U' R' U F'",
        tier: "S",
      },
      {
        alg: "(U) R' F R F' R' F R U R U' R' F'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-spaceship-3",
    name: "Spaceship 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U) R U' R' U R2 U' R' F R' F'",
        tier: "S",
      },
      {
        alg: "y (U) R' F' R U R' F' R U' R' F R F' R U R'",
        tier: "A",
      },
      {
        alg: "y' (U') R U2 R' F R F' R' U2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-spaceship-4",
    name: "Spaceship 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U) R U' R2 F R U R U' R' F'",
        tier: "S",
      },
      {
        alg: "(U) R U' R' U2 R U' R' U' R' F R F'",
        tier: "S",
      },
      {
        alg: "y R U R' U' R' F R2 U2 R' U F'",
        tier: "A",
      },
      {
        alg: "y (U') R U' R' F U' R' F2 R2 U' R' F",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-spaceship-5",
    name: "Spaceship 5",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U) R U2' R' U R' F R F' R U' R'",
        tier: "S",
      },
      {
        alg: "y (U) F2 R' F R U2 R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-spaceship-6",
    name: "Spaceship 6",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U2) R U' R' F R F' R U R2 U' R U' R'",
        tier: "S",
      },
      {
        alg: "y (U2) R' F' R U F' R U2 R' U R U2 R'",
        tier: "S",
      },
      {
        alg: "(U2) R' U' R U' R' F R F' R' F R' F'",
        tier: "B",
      },
      {
        alg: "(U2) R' F2 R U' R' F2 R2 U R' F2",
        tier: "B",
      },
      {
        alg: "(U) R' F' R U2 R' F' R2 U R' F2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-stollery-1",
    name: "Stollery 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U2) R' U2 R U2 R' U R2 U' R2",
        tier: "S",
      },
      {
        alg: "y' (U') R2 U' R2 U R' U2 R U2 R'",
        tier: "S",
      },
      {
        alg: "R U R' U F' R U' R' F2",
        tier: "A",
      },
      {
        alg: "(U') R U R' U R2 U2 R' U' R U' R2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-stollery-2",
    name: "Stollery 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' (U2) R' F R2 F' R2 U' R U R'",
        tier: "S",
      },
      {
        alg: "y' (U2) R2' F' R U R U' R' F U' R",
        tier: "S",
      },
      {
        alg: "y' (U2) R U' R' U F R F' R2",
        tier: "A",
      },
      {
        alg: "(U2) R' F R U' F' R U2 R' F2",
        tier: "B",
      },
      {
        alg: "R U F R' F' U' R' U R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-stollery-3",
    name: "Stollery 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "F R' F' R2 U2 R' U' R U R'",
        tier: "S",
      },
      {
        alg: "(U) F R' F' R U2 R U R2 F R F'",
        tier: "A",
      },
      {
        alg: "(U) R U' R' U' R U' R' U R' F R F'",
        tier: "A",
      },
      {
        alg: "(U') R U' R' U' R U R' U R' F R F'",
        tier: "A",
      },
      {
        alg: "y' (U2) R' U' R U R2 F R F' R U2 R' U R",
        tier: "A",
      },
      {
        alg: "R U R' U F R F' R U R2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-stollery-4",
    name: "Stollery 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R U R' F R' F' R U R U R'",
        tier: "S",
      },
      {
        alg: "y (U2) F' R U R2 F' R2 U R' U R U2 R'",
        tier: "A",
      },
      {
        alg: "R U R' F R U R' U' R' F' R",
        tier: "A",
      },
      {
        alg: "R U R' F R' F' U' R U R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-stollery-5",
    name: "Stollery 5",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' (U') R' U2 R U R' U' R' F R F' R",
        tier: "S",
      },
      {
        alg: "y (U2) R' F R U R U' R' F R' F R",
        tier: "A",
      },
      {
        alg: "(U') R2 F R F' U R U' R U' R2",
        tier: "B",
      },
      {
        alg: "y (U) R' U' R U2 R' F2 R' F R2",
        tier: "B",
      },
      {
        alg: "R U' R2 F2 R F2 R' F2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-stollery-6",
    name: "Stollery 6",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U') R' U R2 U' R2' U' F R F'",
        tier: "S",
      },
      {
        alg: "y' R2' U' R U R' F R F' R U' R'",
        tier: "A",
      },
      {
        alg: "R' U' F R F' U R2 U' R'",
        tier: "B"
      },
      {
        alg: "(U') R2 U' R' U2 R U R' U' F R F'",
        tier: "B",
      },
      {
        alg: "y' F' U F U' R2 U' R2 U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-1",
    name: "Pinwheel 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y R U2 R' U2 R U2 R' F' R U R' F'",
        tier: "S",
      },
      {
        alg: "R' U2 R U2 R' U2 R U' R U' R2",
        tier: "A",
      },
      {
        alg: "y' F' R U R U2 R2 F' U R F'",
        tier: "A",
      },
      {
        alg: "F' U R U' R' U R' U' F2 U R",
        tier: "B",
      },
      {
        alg: "F' U R U' R2 F2 R y' R U R'",
        tier: "B",
      },
    ]
  },
  {
    id: "tcll-plus-pinwheel-2",
    name: "Pinwheel 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' R' U' R U R' U2 F R' F' R U R",
        tier: "S",
      },
      {
        alg: "R F R F' R2' U2 R U2 R",
        tier: "A",
      },
      {
        alg: "R' F R2 U' R' U R U' R' F R U R' F'",
        tier: "B"
      },
      {
        alg: "R U F R' F' R2 U' R2 U' R U2 R",
        tier: "B",
      },
      {
        alg: "R' F' U' F R2 U' R U2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-3",
    name: "Pinwheel 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "F R F' U2 R U' R2 F R2 F'",
        tier: "S",
      },
      {
        alg: "y' (U) R' F2 R U' R' U2 R' F R2",
        tier: "S",
      },
      {
        alg: "y (U2) R2 U R' F R F' U2 R U' R2",
        tier: "A",
      },
      {
        alg: "(U2) R U' R2' y R U' R' U' R U' R'",
        tier: "B",
      },
      {
        alg: "F U F2 R' F R2 U' R' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-two-face-1",
    name: "Two-Face 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' (U/U') R2 U' R2 U R' U R U' R'",
        tier: "S",
      },
      {
        alg: "(U/U') R U R' U' R U' R' U2 R U R'",
        tier: "A",
      },
      {
        alg: "(U/U') R U R' U' R2 U R2 U' R2",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-two-face-2",
    name: "Two-Face 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' (U) R' U2 R' F R F' R",
        tier: "S",
      },
      {
        alg: "y (U) R' F2 R' F R U' R",
        tier: "A",
      },
      {
        alg: "R' F2 R U' R U R' F2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-two-face-3",
    name: "Two-Face 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R U' R' U F' R' F' R F",
        tier: "S",
      },
      {
        alg: "y' R' F' U' F R U R' U' R",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-two-face-4",
    name: "Two-Face 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U) R U R' U2 R' F R F' U R U2 R'",
        tier: "S",
      },
      {
        alg: "(U') R' U R U' R U' F R F' R",
        tier: "B",
      },
      {
        alg: "(U') R' U R F R' F' R U' R2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-turtle-1",
    name: "Turtle 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R U' R' U R U' R'",
        tier: "S",
      },
      {
        alg: "(U) R U' R' U R U R' U' R U' R'",
        tier: "B",
      },
      {
        alg: "y' R' U R' U2 R' U R' U R2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-turtle-2",
    name: "Turtle 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y R' F' R U F' R U R2 F R F' R U R'",
        tier: "S",
      },
      {
        alg: "F R' F' R U F R' F' R U R U R'",
        tier: "A",
      },
      {
        alg: "y R U' R' F2 R U R' F' R' F R",
        tier: "A",
      },
      {
        alg: "(U) F' R' F R2 U' R' F2 R U R'",
        tier: "A",
      },
      {
        alg: "(U') R U R' F' R2 F' R2 F R2",
        tier: "A",
      },
      {
        alg: "(U2) x U2 R' F2 R F' R U' R'",
        tier: "A",
      },
      {
        alg: "(U2) R' U' F R' F' U R U' R U2 R'",
        tier: "B",
      },
      {
        alg: "y (U2) F U2 R U' R2 F R F2",
        tier: "B",
      },
      {
        alg: "(U') R' U2 F2 R U R U' R2 F U' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-turtle-3",
    name: "Turtle 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y (U') R U R' F' R U R2 F' R2 U R'",
        tier: "S",
      },
      {
        alg: "(U) F R' F' R U' R' F R F' R U' R'",
        tier: "S",
      },
      {
        alg: "R' F R2 U R' F' R U' R' F'",
        tier: "A",
      },
      {
        alg: "R' F R F' R' U2 R' U2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-turtle-4",
    name: "Turtle 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y2 (U2) F' L' F U' L U2 L'",
        tier: "S",
      },
      {
        alg: "(U2) y' R' U' R U' F R2 F'",
        tier: "A",
      },
      {
        alg: "(U2) R' U R' F' U F U' R U2 R U2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-turtle-5",
    name: "Turtle 5",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U2) R' F R F' U2 R U2 R'",
        tier: "S",
      },
      {
        alg: "y R' F2 R U2 F' R U R'",
        tier: "S",
      },
      {
        alg: "y' (U') R' U' R U2 F R' F'",
        tier: "A",
      },
      {
        alg: "y F U R U R' U F'",
        tier: "A",
      },
      {
        alg: "y' F R U R U' R F'",
        tier: "B",
      },
      {
        alg: "R U F R F' U R'",
        tier: "B",
      },
      {
        alg: "y' F U' R' U R U R2 F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-turtle-6",
    name: "Turtle 6",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y' (U') R' U R U2 R' F R' F' R2",
        tier: "S",
      },
      {
        alg: "y (U') R' F R U2 R' F' R2 U' R' F",
        tier: "S",
      },
      {
        alg: "(U2) R U R2 F R F' U2 R U' R'",
        tier: "S",
      },
      {
        alg: "R U' R2' F R2 U' R' U' R U R' F'",
        tier: "A",
      },
      {
        alg: "(U2) R' U F R F' R2 U2 R",
        tier: "A",
      },
      {
        alg: "(U2) F' R U2 R' F2 U2 R' F R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-poser-1",
    name: "Pinwheel Poser 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y R U R' U' R U2 R' F' R U R' F'",
        tier: "S",
      },
      {
        alg: "y F U' R2 U' R' F R' F2",
        tier: "A",
      },
      {
        alg: "y' (U2) R2 U R' U R U2 R' U R U' R",
        tier: "A",
      },
      {
        alg: "(U') R2 F R2 F' R' U' F R F'",
        tier: "A",
      },
      {
        alg: "(U2) R U R' F R U R' F U' R U R' U' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-poser-2",
    name: "Pinwheel Poser 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y (U2) F' U' R' F R2 U R' F' R U R'",
        tier: "S",
      },
      {
        alg: "(U') R' F R F' R' F R2 U R' U' F'",
        tier: "S",
      },
      {
        alg: "y (U') R' F' R U R F' U' R' U' R2 U R'",
        tier: "A",
        note: "Fingertrick like CLL Sune 2",
      },
      {
        alg: "(U') R' F R F' R' F R2 U R' U' F'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-poser-3",
    name: "Pinwheel Poser 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "L U2 F' L F L2",
        tier: "S",
      },
      {
        alg: "R U R' U2' R' F R F' R U' R'",
        tier: "S",
      },
      {
        alg: "(U') R U' R2 F R2 F' U' R' U' R",
        tier: "A",
      },
      {
        alg: "y F' R U R' U2' R2 F R U' R",
        tier: "A",
      },
      {
        alg: "(U') R' U2 R2 U' F R F' U2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-poser-4",
    name: "Pinwheel Poser 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y (U2) F' R U R2 F' R",
        tier: "S",
      },
      {
        alg: "y' (U') R2 F R F' U2 R",
        tier: "A",
      },
      {
        alg: "(U') F2 R U R' U2 F",
        tier: "B",
      },
      {
        alg: "(U2) R' F R F2 U' F",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-poser-5",
    name: "Pinwheel Poser 5",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R U' R2 F R F'",
        tier: "S",
      },
      {
        alg: "y F U2 R' F R F2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-pinwheel-poser-6",
    name: "Pinwheel Poser 6",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y (U') F R U2' R' U F'",
        tier: "S",
      },
      {
        alg: "(U2) F' U R' F2 R F",
        tier: "A",
      },
      {
        alg: "(U2) y' R' U2 R F R2 F'",
        tier: "A",
      },
      {
        alg: "(U') R F R2 F' U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-gun-1",
    name: "Gun 1",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R U' R' U2 R U2 R'",
        tier: "S",
      },
      {
        alg: "y R' F2 R U2 R' F' R",
        tier: "S",
      },
      {
        alg: "y' R' U R' U' R2 U R2",
        tier: "S"
      },
      {
        alg: "(U) R U2 R' F' R U' R' F2",
        tier: "A",
      },
      {
        alg: "R2 U R2 U' R' U R'",
        tier: "A",
      },
      {
        alg: "R U' R' U' R U' R' U2 R U' R'",
        tier: "B",
      },
      {
        alg: "R2 U' R2 U2 R2 U R' U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-gun-2",
    name: "Gun 2",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y (U') F' R' F2 R F' R' F R2 U' R'",
        tier: "S",
      },
      {
        alg: "(U) F R' F' R2 U R' F R' F' R2 U R'",
        tier: "A",
      },
      {
        alg: "(U') F' U R U2 R' F U2 R' F R",
        tier: "A"
      },
      {
        alg: "(U2) R' F' R2 U R' F' R U2 R' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-gun-3",
    name: "Gun 3",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R' F R F' U R U' R'",
        tier: "S",
      },
      {
        alg: "y R' F' R U F' R U R'",
        tier: "S",
      },
      {
        alg: "(U) R U' R' F' U' F",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-gun-4",
    name: "Gun 4",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "R U' R' U R U2 R' F R' F' R",
        tier: "S",
      },
      {
        alg: "y (U) F' R U R2 F' R2 U R' U' R' F R F'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-plus-gun-5",
    name: "Gun 5",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "(U2) R U R' U R U R2 F R F'",
        tier: "S",
      },
      {
        alg: "y' R2' F R F' R U R' U R",
        tier: "S",
      },
      {
        alg: "(U2) R' F' R2 U' R2 F R U' F'",
        tier: "A",
      },
      {
        alg: "(U2) R U' R' F R F' R U R' U2 R'",
        tier: "A",
      },
      {
        alg: "(U2) R U' R2 F R2 U R' U' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-plus-gun-6",
    name: "Gun 6",
    category: "TCLL",
    subCategory: "TCLL+",
    algs: [
      {
        alg: "y2 (U2) L F' L F L' U2' L'",
        tier: "S",
      },
      {
        alg: "(U) R U2 R' F R F' R U R2",
        tier: "A",
      },
      {
        alg: "y (U2) F R' F R F' U2 F'",
        tier: "A",
      },
      {
        alg: "y (U) F2 R' F R U' R U2 R'",
        tier: "B",
      },
      {
        alg: "(U2) R F' U F R' U2 R'",
        tier: "B",
      }
    ]
  },
];
