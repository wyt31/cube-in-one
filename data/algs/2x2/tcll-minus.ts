// ==========================================================================
// 2x2 — TCLL- (Twin Corner Last Layer, negative AUF family)
// ==========================================================================
import type { TwoByTwoAlg } from "../types";

export const tcllMinusData: TwoByTwoAlg[] = [
  {
    id: "tcll-minus-hammer-1",
    name: "Hammer 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') F R' F' R F R' F' R",
        tier: "S",
      },
      {
        alg: "y (U') R U' R' F R U' R' F",
        tier: "S",
      }
    ]
  },
  {
    id: "tcll-minus-hammer-2",
    name: "Hammer 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y2 (U') L U2 L' U F' L F",
        tier: "S",
      },
      {
        alg: "(U') R U2' R' U y' R' U R",
        tier: "S"
      },
      {
        alg: "y' (U') F R2 F' U R' U R",
        tier: "A",
      },
      {
        alg: "y2 (U') F U2 F' U R' F R",
        tier: "B",
      },
      {
        alg: "F2 R F' U R' U' F U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-hammer-3",
    name: "Hammer 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y (U') F' R U R2' F R U2 R' F' R",
        tier: "S",
      },
      {
        alg: "(U2) R U R' U2 F R' F' R2 U' R'",
        tier: "S",
      },
      {
        alg: "y' R2' F R F' R U2 R' U' R",
        tier: "A",
      },
      {
        alg: "(U') y' F' U F R U' R2 U R2",
        tier: "B",
      },
      {
        alg: "R2 U' R' U2 R' U2 F R' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-hammer-4",
    name: "Hammer 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') R U R' F R' F' R U' R U2 R'",
        tier: "S",
      },
      {
        alg: "(U) F R F' U2 F' U' F R2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-hammer-5",
    name: "Hammer 5",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') F R U R' U' R' F' R2 U R'",
        tier: "S",
      },
      {
        alg: "(U') R' F R F' R U' R' U2' R U R'",
        tier: "S",
        note: "Alternative finish: (U') R' F R F' R2 U R2 U' R2",
      },
      {
        alg: "R' U2 R' U2 R U' R' F R F'",
        tier: "A",
      },
      {
        alg: "(U2) R' F2 R U' R U2 R' U2 F",
        tier: "B",
      },
      {
        alg: "y (U2) F U' R U2 R2 F' R U R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-hammer-6",
    name: "Hammer 6",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "R U' R U' R' F R' F' R U' R'",
        tier: "S",
      },
      {
        alg: "(U) R U2 R2 F R F' U2 R U R'",
        tier: "A",
      },
      {
        alg: "y' (U') R' U R U' R2 F R F' U R",
        tier: "A",
      },
      {
        alg: "y' (U2) R2 F R F' R U R' U' R' F R F' R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-spaceship-1",
    name: "Spaceship 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "R U R' U' R U R'",
        tier: "S",
      },
      {
        alg: "(U2) y R2 F R U' R' F R U' R",
        tier: "B",
      },
      {
        alg: "(U2) R' U2 R' U2 R2 U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-spaceship-2",
    name: "Spaceship 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y F U' R U R' U R U R' F'",
        tier: "S",
      },
      {
        alg: "(U2) F R U R' U' R' F' R F R' F' R",
        tier: "A",
      },
      {
        alg: "(U) R U2 R2 F R F' R U' R' U' R U R'",
        tier: "A",
      },
      {
        alg: "(U2) R U R' U R' F R F' U2 R U R'",
        tier: "A",
      },
      {
        alg: "y F U' R U R' U' F' R' F R",
        tier: "B",
      },
      {
        alg: "(U2) R2 U' R' U2 R' F R U R' U' R F'",
        tier: "B",
      },
      {
        alg: "R U' R' U F R F' R U R' U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-spaceship-3",
    name: "Spaceship 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U) R U R' U' R U R' U R U' R' F R' F' R",
        tier: "S",
      },
      {
        alg: "R U R' U R U' R' U' F R' F' R",
        tier: "S",
      },
      {
        alg: "(U') R U R' F R' F' R U R' F R F'",
        tier: "A",
      },
      {
        alg: "(U') F R U R' F R U' R2 F' R",
        tier: "B",
      },
      {
        alg: "(U') R' U2 R U2 R F R' F' R",
        tier: "B",
      },
      {
        alg: "(U2) R U R' U' F R' F R U R' F R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-spaceship-4",
    name: "Spaceship 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') R' F R F' U R U2 R2 F R F'",
        tier: "S",
      },
      {
        alg: "y (U) R' F R2 U' R' U' R' F R F",
        tier: "A"
      },
      {
        alg: "y' (U) R2 U' R2 U R2 U2 F R2 F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-spaceship-5",
    name: "Spaceship 5",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') R' F R F' U' R' F R F' R U' R'",
        tier: "S",
      },
      {
        alg: "y (U) R' F2 R U' R U' R' F R' F R",
        tier: "S",
      },
      {
        alg: "y' (U) R' U R U R' F R' F' R U' R",
        tier: "A",
      },
      {
        alg: "(U) F2 R U' R' U2 R' F R",
        tier: "A",
      },
      {
        alg: "y' (U) R2 U' R U R2 U' F R F'",
        tier: "B",
      },
      {
        alg: "y (U') F2 R' F' R U' R U' R' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-spaceship-6",
    name: "Spaceship 6",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "R U R' U R2 U' R' F R' F' R U R'",
        tier: "S",
      },
      {
        alg: "R U R' U' F R' F2 R U' R' F2 R",
        tier: "S",
      },
      {
        alg: "y (U') R' F U' R' F R2 U' R' U2 R",
        tier: "A",
      },
      {
        alg: "y' (U') R' F R' F' R U F R' F' R U R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-stollery-1",
    name: "Stollery 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y' (U2) R U2 R' U2 R U' R2 U R2",
        tier: "S",
      },
      {
        alg: "(U) R2 U R2 U' R U2 R' U2 R",
        tier: "S",
      },
      {
        alg: "(U) R2 U R' U R U2 R2 U' R U' R'",
        tier: "A",
      },
      {
        alg: "(U2) F2 R U R' F U' R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-stollery-2",
    name: "Stollery 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y' R' U F' R U R' U' R' F R2",
        tier: "S",
      },
      {
        alg: "F2 R U2 R' F U R' F' R",
        tier: "A",
      },
      {
        alg: "y' R2 F R' F' U' R U R'",
        tier: "B",
      },
      {
        alg: "(U2) R U R' U2 R' U' F R F' U R",
        tier: "B",
      },
      {
        alg: "(U') R' F2 R F R' F2 R F' U F",
        tier: "B",
      },
    ]
  },
  {
    id: "tcll-minus-stollery-3",
    name: "Stollery 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "F R' F' U R2 U R2' U' R",
        tier: "S",
      },
      {
        alg: "(U2) R F' R U R' U' R' F R U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-minus-stollery-4",
    name: "Stollery 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U2) R U' R' U' R' F R F' R U' R'",
        tier: "S",
      },
      {
        alg: "R' F R U R U' R' F' R U' R'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-minus-stollery-5",
    name: "Stollery 5",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y' R2 F' R U2 R U2 R' F R",
        tier: "S",
      },
      {
        alg: "y' R' F R' F' R U R U' R' U2 R",
        tier: "A",
      },
      {
        alg: "R2 U R' U R' U' F R' F' R2",
        tier: "B",
      },
      {
        alg: "(U2) R' F2 R F2 R' F2 R2 U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-stollery-6",
    name: "Stollery 6",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U2) R U' R' U R U2 R2 F R F'",
        tier: "S",
      },
      {
        alg: "y F' R U R2 F2 R U R' F' R",
        tier: "A",
      },
      {
        alg: "y F' R' F2 R2 U' R' U R' F' R",
        tier: "A",
      },
      {
        alg: "(U') F R' F' R U' R U' R' U R U R'",
        tier: "A",
      },
      {
        alg: "(U) R2 U' R' F R' F' U' R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-1",
    name: "Pinwheel 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "R' F2 R U2' R' F2 R F R' F' R F",
        tier: "S",
      },
      {
        alg: "y F R U' R' F R U2 R' U2 R U2 R'",
        tier: "S",
      },
      {
        alg: "R2 U R' U R' U2 R U2 R' U2 R",
        tier: "A",
      },
      {
        alg: "F U' F' R U' R2 F2 R U' F",
        tier: "A",
      },
      {
        alg: "F R U2' R' F' U' R U R' U' F",
        tier: "B",
      },
      {
        alg: "F' R U2 R2 F2 R U R' F' R F'",
        tier: "B",
      },
      {
        alg: "F R' U2 R2 U F R2 U R2 U2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-2",
    name: "Pinwheel 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y' R' U' R' F R F' U2 R U' R' U R",
        tier: "S",
      },
      {
        alg: "R' U2 R' U2 R2 F R' F' R'",
        tier: "A",
      },
      {
        alg: "R U R' U' R U R2 U' F R' F' R U R",
        tier: "B",
      },
      {
        alg: "R U R' U2 R' U' R F' U F R",
        tier: "B",
      },
      {
        alg: "R' U2 R' U R2 F' U F R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-3",
    name: "Pinwheel 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U2) F R' F' R2 U R2 U2 R U R' U R",
        tier: "S",
      },
      {
        alg: "y' R2 F' R U2 R U R' F2 R",
        tier: "A",
      },
      {
        alg: "R U' F R2 U' F L U2 L'",
        tier: "B",
      },
      {
        alg: "R U' F R2 U' F R F2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-two-face-1",
    name: "Two-Face 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y R' F' R U R' F R U2 R' F' R",
        tier: "S",
      },
      {
        alg: "R2 U R' U R U2 R' U2 R'",
        tier: "S",
      },
      {
        alg: "R2 U R2 U' R2 U R U' R'",
        tier: "A",
      },
      {
        alg: "R2 U R2 U' R U' R' U R",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-minus-two-face-2",
    name: "Two-Face 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y2 L U2 L F' L' F L'",
        tier: "S",
      },
      {
        alg: "R U2' x' R U' R' U R'",
        tier: "S",
      },
      {
        alg: "(U2) R2 U' R' F R' F' R U2 R'",
        tier: "A",
      },
      {
        alg: "y (U') R U2 R' U R' F' R F2",
        tier: "B",
      },
      {
        alg: "y (U2) F U2 F R' F' R F'",
        tier: "B",
      },
      {
        alg: "R2 U R2 U F' U' F U' R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-two-face-3",
    name: "Two-Face 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y (U/U') R' F R U' F R U R' F'",
        tier: "S",
      },
      {
        alg: "(U/U') F' R' F R F U' R U R'",
        tier: "A",
      },
      {
        alg: "y (U/U') R' U R U' R' F' U F R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-two-face-4",
    name: "Two-Face 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U) R' F R F' R U2 R' U' R U R'",
        tier: "S",
      },
      {
        alg: "y (U2) R' F' R U2 R U' R' F U' R' F2 R",
        tier: "A",
      },
      {
        alg: "(U2) R U' R' U' F R' F' R U' R U R'",
        tier: "A",
      },
      {
        alg: "(U2) F' U' F R2 U' R2 U' R2 U R2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-turtle-1",
    name: "Turtle 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y (U') L' U L U' L' U L",
        tier: "S",
      },
      {
        alg: "y' (U') R' U R U' R' U R",
        tier: "S",
      },
      {
        alg: "y' (U2) R' U R2 U2 R U2 R'",
        tier: "B",
      },
      {
        alg: "y' (U') R' U R2 U R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-turtle-2",
    name: "Turtle 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') R U R' U' F R' F' R2 U' R' F R' F' R",
        tier: "S",
      },
      {
        alg: "R U2 R' U R' U' F R F' U R",
        tier: "A",
      },
      {
        alg: "y' (U) R' U R U' R2' F R F' R U' R' U2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-turtle-3",
    name: "Turtle",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "R' F' R F R' F' R2 U R2 F' R",
        tier: "S",
      },
      {
        alg: "y (U2) F' R U R' U R U' R' F R' F R",
        tier: "S",
      },
      {
        alg: "(U) F R F' R U R2 U' R U R'",
        tier: "A",
      },
      {
        alg: "y' (U2) R' U' R U R' U R' F R F' R",
        tier: "A",
      },
      {
        alg: "y' (U') R U2 R F R' F' R U2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-turtle-4",
    name: "Turtle 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y' (U) F R F' U R' U2 R",
        tier: "S",
      },
      {
        alg: "y' (U) F R F' U R' U2 R",
        tier: "A",
      },
      {
        alg: "(U) R U R' U' R U2 R' U' R' F R F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-turtle-5",
    name: "Turtle 5",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') R U2 R' U2 F R' F' R",
        tier: "S",
      },
      {
        alg: "y (U) R U' R' F U2' R' F2 R",
        tier: "S",
      },
      {
        alg: "R U' F R' F' U' R'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-minus-turtle-6",
    name: "Turtle 6",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "R U' R' U2 R U R2 F R F'",
        tier: "S",
      },
      {
        alg: "y' (U) R' F R' F' R2 U R' U R",
        tier: "S",
      },
      {
        alg: "R2 U R2 U' R F R F'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-poser-1",
    name: "Pinwheel Poser 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U') R' F' R U R' F2 R F R' F' R F",
        tier: "S",
      },
      {
        alg: "y (U') R U' R' U F R U2 R' F2",
        tier: "S",
      },
      {
        alg: "(U') F' U2 F2 R F' R U R2",
        tier: "B",
      },
      {
        alg: "(U') F R' F' U R F R2 F' R2",
        tier: "B",
      },
      {
        alg: "(U) R2 U' R U' R' U2 R U' R' U R'",
        tier: "B",
      },
      {
        alg: "(U) R2 F U' R U F2 U R'",
        tier: "B",
      },
    ]
  },
  {
    id: "tcll-minus-pinwheel-poser-2",
    name: "Pinwheel Poser 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U) F U R U' R2 F' R F R' F' R",
        tier: "S",
      },
      {
        alg: "R U2 R U' R' F R2 F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-poser-3",
    name: "Pinwheel Poser 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y (U') R' F R2 U' R' F",
        tier: "S",
      },
      {
        alg: "y' (U') R' U2' F R' F' R2",
        tier: "S",
      },
      {
        alg: "(U') F' U2 R U' R' F2",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-poser-4",
    name: "Pinwheel Poser 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U) F R' F' R2 U R'",
        tier: "S",
      },
      {
        alg: "y F U' R' F U2 R U2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-poser-5",
    name: "Pinwheel Poser 5",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y (U') R' F' R U2 R U' R' F R' F R",
        tier: "S",
      },
      {
        alg: "(U) R U R' F R' F' R U2 R U' R'",
        tier: "A",
      },
      {
        alg: "R' U2 F R' F' U' R2 U2 R'",
        tier: "B"
      },
      {
        alg: "y (U) F U' R U R' F R F' R U R2 F'",
        tier: "B",
      },
      {
        alg: "R U' R' U2 R' U F R F' U2 R",
        tier: "B",
      },
      {
        alg: "y2 (U2) R' U F2 R U' R' U' R2 U",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-pinwheel-poser-6",
    name: "Pinwheel Poser 6",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "F' R' F2 R U' F",
        tier: "S",
      },
      {
        alg: "y (U) F U' R U2 R' F'",
        tier: "A",
      },
      {
        alg: "(U) R U2 R' F' U2 F",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-gun-1",
    name: "Gun 1",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U) R U2 R' U2 R U R'",
        tier: "S",
      },
      {
        alg: "y (U) R' F R U2' R' F2 R",
        tier: "S",
      },
      {
        alg: "(U) R U' R U R2 U' R2",
        tier: "S",
      },
      {
        alg: "y (U) R2 U' R2 U R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-gun-2",
    name: "Gun 2",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U2) F R U2 R' F R U' R2 F R",
        tier: "S",
      },
      {
        alg: "y' (U) R' U2 F R F' R U R2 U' R",
        tier: "A",
      },
      {
        alg: "R F2 R F2 R' F2 R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-gun-3",
    name: "Gun 3",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U) R U R' U' F R' F' R",
        tier: "S",
      },
      {
        alg: "y' R' U R F R F'",
        tier: "A",
      },
      {
        alg: "(U) R2' F R F' U' R' U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-gun-4",
    name: "Gun 4",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "(U2) F R' F' R2 U' R' U' R U' R'",
        tier: "S",
      },
      {
        alg: "y (U') R' F' R U' R' F' R2 U' R' F",
        tier: "S",
      },
      {
        alg: "y' (U') R' U' R U' R' F R' F' R2",
        tier: "S",
      },
      {
        alg: "(U) R U2 R U' R' F R' F' R U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "tcll-minus-gun-5",
    name: "Gun 5",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y' (U') R' F R' F' R U2 R",
        tier: "S",
      },
      {
        alg: "F2 R U' R' U R' F2 R",
        tier: "B",
      }
    ]
  },
  {
    id: "tcll-minus-gun-6",
    name: "Gun 6",
    category: "TCLL",
    subCategory: "TCLL-",
    algs: [
      {
        alg: "y (U) R' F R U' R' F2 R F' R U R'",
        tier: "S",
      },
      {
        alg: "R U' R' U2 F R F' R U R2",
        tier: "A",
      },
      {
        alg: "R2 U R' F R F' R' U' R",
        tier: "B",
      }
    ]
  },
];
