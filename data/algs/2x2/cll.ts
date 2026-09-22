// ==========================================================================
// 2x2 — CLL (Corners of Last Layer)
// ==========================================================================
import type { TwoByTwoAlg } from "../types";

export const cllData: TwoByTwoAlg[] = [
  {
    id: "cll-sune-1",
    name: "Sune 1",
    category: "CLL",
    subCategory: "Sune",
    algs: [
      {
        alg: "R U R' U R U2 R'",
        tier: "S"
      },
      {
        alg: "(U) L' U2 L U L' U L",
        tier: "A"
      },
      {
        alg: "(U2) L U L' U L U2 L'",
        tier: "B"
      },
      {
        alg: "(U') R' U2' R U R' U R",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-sune-2",
    name: "Sune 2",
    category: "CLL",
    subCategory: "Sune",
    algs: [
      {
        alg: "(U') R' F R2 F' U' R' U' R2 U R'",
        tier: "S"
      },
      {
        alg: "(U2) R U R' U R' F R F' R U2' R'",
        tier: "A"
      },
      {
        alg: "(U2) L' U2 L F' L F L' U L' U L",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-sune-3",
    name: "Sune 3",
    category: "CLL",
    subCategory: "Sune",
    algs: [
      {
        alg: "F R' F' R U2 R U2' R'",
        tier: "S"
      },
      {
        alg: "R U' R2' U R U F R' F' R U R'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-sune-4",
    name: "Sune 4",
    category: "CLL",
    subCategory: "Sune",
    algs: [
      {
        alg: "R U' R' F R' F' R",
        tier: "S"
      },
      {
        alg: "(U2) R2 U R' U' R' F R F' R'",
        tier: "B"
      },
      {
        alg: "(U) L' F' L F L' U' L' U L2",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-sune-5",
    name: "Sune 5",
    category: "CLL",
    subCategory: "Sune",
    algs: [
      {
        alg: "R U R' U' R' F R F' R U R' U R U2' R'",
        tier: "S"
      },
      {
        alg: "(U) R' F' R2 U R' F' R' F R2 U' R'",
        tier: "A"
      },
      {
        alg: "(U2) R U' R U' R' U R' U' F R' F'",
        tier: "B"
      },
      {
        alg: "R U2' R' F R U2' R' U R U' R' F",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-sune-6",
    name: "Sune 6",
    category: "CLL",
    subCategory: "Sune",
    algs: [
      {
        alg: "R' F2 R U2 R U' R' F",
        tier: "S"
      }
    ]
  },
  {
    id: "cll-anti-sune-1",
    name: "Anti-Sune 1",
    category: "CLL",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "R' U' R U' R' U2 R",
        tier: "S"
      },
      {
        alg: "(U2) L' U' L U L' U2 L",
        tier: "S"
      },
      {
        alg: "(U) R U2' R' U' R U' R'",
        tier: "A"
      },
      {
        alg: "(U') L U2 L' U' L U' L'",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-anti-sune-2",
    name: "Anti-Sune 2",
    category: "CLL",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U') L F' L2' F U L U L2' U' L",
        tier: "S"
      },
      {
        alg: "R U2' R' F R' F' R U' R U' R'",
        tier: "A"
      },
      {
        alg: "L' U' L U' L F' L' F L' U2 L",
        tier: "A"
      },
      {
        alg: "(U2) R' U R U' R2' F R F' R U R' U' R",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-anti-sune-3",
    name: "Anti-Sune 3",
    category: "CLL",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) F' R U R' U2' R' F2 R",
        tier: "S"
      },
      {
        alg: "(U) R' F R F' R U2' R' U' R' F R F'",
        tier: "B"
      },
      {
        alg: "(U2) R' F R2 F' U' R' U' R F R' F' R",
        tier: "B"
      },
    ]
  },
  {
    id: "cll-anti-sune-4",
    name: "Anti-Sune 4",
    category: "CLL",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R' F R F' R U R'",
        tier: "S"
      },
      {
        alg: "(U) R F R' F' R U R U' R2",
        tier: "B"
      },
      {
        alg: "L2' U' L U L F' L' F L",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-anti-sune-5",
    name: "Anti-Sune 5",
    category: "CLL",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R' F2 R F' R' F2 R U' R' F R F'",
        tier: "S"
      },
      {
        alg: "(U) R U R2' F' R F R U' R2' F R",
        tier: "A"
      },
      {
        alg: "F R F' U R U' R U R' U R'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-anti-sune-6",
    name: "Anti-Sune 6",
    category: "CLL",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R U2' R' U2' R' F R F'",
        tier: "S"
      },
      {
        alg: "(U') R U' R' F R F' U' R' U' R2 U R'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-pi-1",
    name: "Pi 1",
    category: "CLL",
    subCategory: "Pi",
    algs: [
      {
        alg: "R' U R2 U' R2' U' R2 U R'",
        tier: "S"
      },
      {
        alg: "R U' R2' U R2 U R2' U' R",
        tier: "S"
      },
      {
        alg: "(U2) R' F R2 B' R2' F' R2 B R'",
        tier: "A"
      },
      {
        alg: "(U2) R B' R2' F R2 B R2' F' R",
        tier: "A"
      },
      {
        alg: "F R U R' U' R U R' U' F'",
        tier: "A"
      },
      {
        alg: "(U2) F U R U' R' U R U' R' F'",
        tier: "A"
      },
      {
        alg: "R U2' R' U R U' R' U2 R U' R'",
        tier: "B"
      },
      {
        alg: "(U) R U R' U2' R U R' U' R U2' R'",
        tier: "B"
      },
      {
        alg: "R U2' R' U R U2' R' U' R U2' R'",
        tier: "B"
      },
      {
        alg: "(U2) L' U2 L U' L' U L U2' L' U L",
        tier: "B"
      },
      {
        alg: "(U) L' U' L U2 L' U' L U L' U2 L",
        tier: "B"
      },
      {
        alg: "(U2) L' U2 L U' L' U2 L U L' U2 L",
        tier: "B"
      },
    ]
  },
  {
    id: "cll-pi-2",
    name: "Pi 2",
    category: "CLL",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') R' U' R' F R F' R U' R' U2 R",
        tier: "S"
      },
      {
        alg: "R U' R' U2' R' F R F' U2' R U R'",
        tier: "A"
      },
      {
        alg: "(U2) R U' R' U2' F R' F' R U2' R U R'",
        tier: "A"
      },
      {
        alg: "(U2) L' U L U2 L F' L' F U2 L' U' L",
        tier: "A"
      },
      {
        alg: "L' U L U2 F' L F L' U2 L' U' L",
        tier: "A"
      },
      {
        alg: "(U) R' U2' R U R' F R' F' R U R",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-pi-3",
    name: "Pi 3",
    category: "CLL",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U2) R' F R F' R U' R' U' R U' R'",
        tier: "S"
      },
      {
        alg: "L F' L' F L' U L U L' U L",
        tier: "S"
      }
    ]
  },
  {
    id: "cll-pi-4",
    name: "Pi 4",
    category: "CLL",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') F R' F' R U' R U R' U R' F R F'",
        tier: "S"
      },
      {
        alg: "(U') R U' R U' R' U R' F R2 F'",
        tier: "A"
      },
      {
        alg: "(U) F R2 U' R2' U R2 U R2' F'",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-pi-5",
    name: "Pi 5",
    category: "CLL",
    subCategory: "Pi",
    algs: [
      {
        alg: "R U2' R' U' R U R' U2' R' F R F'",
        tier: "S"
      },
      {
        alg: "(U) F' L F L' U2' L' U L U' L' U2 L",
        tier: "S"
      },
      {
        alg: "(U') R' U2' R U R' U R2 U' R' F R' F' R",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-pi-6",
    name: "Pi 6",
    category: "CLL",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U) F R' F' R U2 R U' R' U R U2' R'",
        tier: "S"
      },
      {
        alg: "(U2) L' U2 L U L' U' L U2 L F' L' F",
        tier: "S"
      },
      {
        alg: "R U' R' F R' F' R U' R U' R' F R' F' R",
        tier: "B"
      },
    ]
  },
  {
    id: "cll-u-1",
    name: "U 1",
    category: "CLL",
    subCategory: "U",
    algs: [
      {
        alg: "F R U R' U' F'",
        tier: "S"
      },
      {
        alg: "(U2) F U R U' R' F'",
        tier: "S"
      },
      {
        alg: "R' U' F R' F' R U R",
        tier: "S"
      },
      {
        alg: "(U2) R' U' R' F R F' U R",
        tier: "S"
      },
      {
        alg: "(U) R' F' U' F U R",
        tier: "A"
      },
      {
        alg: "(U') R' U' F' U F R",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-u-2",
    name: "U 2",
    category: "CLL",
    subCategory: "U",
    algs: [
      {
        alg: "R' F R F' R' F R F' R U R' U' R U R'",
        tier: "S",
      },
      {
        alg: "(U2) R U' R' F R U' R' F R' F' R U R' F' R",
        tier: "S"
      },
      {
        alg: "(U2) R U' R' F R U' R' F R' F' R U R' F' R",
        tier: "A"
      },
      {
        alg: "R2 F2 R U R U2 R2 F' R U' R",
        tier: "A"
      },
      {
        alg: "(U2) F U' R U R2 F R F' U F'",
        tier: "B"
      },
      {
        alg: "(U) R U R' U R U2 R2 U' R U' R' U2 R",
        tier: "B"
      },
      {
        alg: "(U) R' U' R2 U R' U2 R U2 R' U R'",
        tier: "A"
      },
      {
        alg: "(U') R U R2 U' R U2 R' U2 R U' R",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-u-3",
    name: "U 3",
    category: "CLL",
    subCategory: "U",
    algs: [
      {
        alg: "R U2 R U' R' F R' F2 U' F",
        tier: "S"
      },
      {
        alg: "R U R' U' R' F R U2 R U' R' U2 F'",
        tier: "A"
      },
      {
        alg: "(U2) F R U2 R' F R' F' R2 U R' F'",
        tier: "S"
      },
      {
        alg: "(U2) R' F' R U R U' R' U2' R' F R U2' F",
        tier: "A"
      },
      {
        alg: "(U2) R U' R' F R' F2 U' F U R",
        tier: "B"
      },
      {
        alg: "R' F R F' R U2' B U' B' R'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-u-4",
    name: "U 4",
    category: "CLL",
    subCategory: "U",
    algs: [
      {
        alg: "F R' F' R U' R U' R' U2 R U' R' ",
        tier: "S"
      },
      {
        alg: "(U2) F' R U R' U' R' F R2 U R' U R U2' R'",
        tier: "A"
      },
      {
        alg: "(U') R U R' U' R' F R2 U' R' F' R' F R",
        tier: "A"
      },
      {
        alg: "(U') R U2 R' F R' F' R U2 R' F R F'",
        tier: "S"
      },
      {
        alg: "(U2) F' R U R' U R' F R U2' R' F R",
        tier: "S"
      }
    ]
  },
  {
    id: "cll-u-5",
    name: "U 5",
    category: "CLL",
    subCategory: "U",
    algs: [
      {
        alg: "(U) R U' R2 F R F' R U R' U' R U R'",
        tier: "S"
      },
      {
        alg: "(U') F R U' R2' F' R U R U' R2' F R",
        tier: "A"
      },
      {
        alg: "(U') R U2 R' U R' F2 R F' R' F2 R",
        tier: "B"
      },
      {
        alg: "R U R2 U R U2 R' F R2 F'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-u-6",
    name: "U 6",
    category: "CLL",
    subCategory: "U",
    algs: [
      {
        alg: "(U) R' F R2 U' R' F R' F' R U R' F' R",
        tier: "S"
      },
      {
        alg: "(U') F' R' F R2 U R' U' R' F R2 U' R'",
        tier: "A"
      },
      {
        alg: "(U) R' U R' F R F' R U2 R' U R ",
        tier: "B"
      },
      {
        alg: "(U2) F' R U R' U' R' F R2 U' R' F R' F' R",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-l-1",
    name: "L 1",
    category: "CLL",
    subCategory: "L",
    algs: [
      {
        alg: "(U) F' R U R' U' R' F R",
        tier: "S"
      },
      {
        alg: "F R U' R' U' R U R' F'",
        tier: "A"
      },
      {
        alg: "(U') R U R U' R' F R' F'",
        tier: "A"
      },
      {
        alg: "F R U' R' F R' F' R U F'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-l-2",
    name: "L 2",
    category: "CLL",
    subCategory: "L",
    algs: [
      {
        alg: "F R' F' R U R U' R'",
        tier: "S"
      },
      {
        alg: "(U') R F' U' R' U' R F",
        tier: "B"
      },
      {
        alg: "(U) F' R' F R F' R U R' U' F",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-l-3",
    name: "L 3",
    category: "CLL",
    subCategory: "L",
    algs: [
      {
        alg: "R U2 R2 F R F' R U2 R'",
        tier: "S"
      },
      {
        alg: "(U') R U2 R' F R' F' R2 U2 R'",
        tier: "S"
      },
      {
        alg: "(U) R' F2 R2 U' R' F R' F2 R",
        tier: "S"
      },
      {
        alg: "(U2) R' F2 R F' R U R2' F2 R",
        tier: "S"
      },
      {
        alg: "(U2) R' U' R U R' F' R U R' U' R' F R2",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-l-4",
    name: "L 4",
    category: "CLL",
    subCategory: "L",
    algs: [
      {
        alg: "(U) R' U R' U2 R U' R' U R U' R2",
        tier: "S"
      },
      {
        alg: "(U2) R U2 R2 F' R U' R' F2 R2 U R'",
        tier: "A"
      },
      {
        alg: "(U2) R2 U R' U' R U R' U2 R U' R",
        tier: "A"
      },
      {
        alg: "(U2) R U R2 U' R2 U R' U2 R U2 R2",
        tier: "B"
      },
      {
        alg: "(U2) R U R2 U' R2 U R' U2 R' U2 R2",
        tier: "B"
      },
      {
        alg: "(U2) R U' R2 F R2 U' R' U R U' R2 F R2 U' R'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-l-5",
    name: "L 5",
    category: "CLL",
    subCategory: "L",
    algs: [
      {
        alg: "(U') R U' R' U R U' R' F R' F' R2 U R'",
        tier: "S",
      },
      {
        alg: "(U) R' F' R2 U R' U' R' F R2 U R' F'",
        tier: "A"
      },
      {
        alg: "(U') R' F R U' R U' R' F U2 R U' R' F",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-l-6",
    name: "L 6",
    category: "CLL",
    subCategory: "L",
    algs: [
      {
        alg: "(U2) R' F R U' R' F R F' R U R2' F' R",
        tier: "S"
      },
      {
        alg: "R U R2 F' R U R U' R2 F' R F",
        tier: "A"
      },
      {
        alg: "R' U' R U2 R' F R' F' R U' R",
        tier: "A"
      },
      {
        alg: "(U2) R U R' U R' F R F' U2 R' F R F'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-t-1",
    name: "T 1",
    category: "CLL",
    subCategory: "T",
    algs: [
      {
        alg: " R U R' U' R' F R F' ",
        tier: "S"
      },
      {
        alg: "(U') R' U' R U F R F'",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-t-2",
    name: "T 2",
    category: "CLL",
    subCategory: "T",
    algs: [
      {
        alg: "(U2) R' F' R U R U' R' F",
        tier: "S"
      },
      {
        alg: "F R F' R U R' U' R'",
        tier: "S"
      },
      {
        alg: "F R U' R' U R U R' F'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-t-3",
    name: "T 3",
    category: "CLL",
    subCategory: "T",
    algs: [
      {
        alg: "(U') R U F R' F' R U2 R U2' R2",
        tier: "S"
      },
      {
        alg: "(U') R U F R' F' R U2 R' U2' R2",
        tier: "S"
      },
      {
        alg: "(U2) R U2 R2 F R F' R U' R' U R U2 R'",
        tier: "S"
      },
      {
        alg: "R' F2 R2 U' R' F R' F R U' R' F2 R",
        tier: "S"
      },
      {
        alg: "R' U' R' F R F' R U' R' U R U' R' U2 R",
        tier: "A"
      },
      {
        alg: "(U') R U' R' U' R2 F R F' R U' R2",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-t-4",
    name: "T 4",
    category: "CLL",
    subCategory: "T",
    algs: [
      {
        alg: "(U) R U' R' U R U' R' F R' F' R F R' F' R",
        tier: "S"
      },
      {
        alg: "(U) R' F R U' R' F R F' R U R' F' R U R'",
        tier: "S"
      },
      {
        alg: "(U') F R' F' R F R' F' R2 U' R' U R U' R'",
        tier: "A"
      },
      {
        alg: "(U') F' R U R' F' R U R2' F R U' R' F R",
        tier: "A"
      },
      {
        alg: "R U R' U R U2' R2 F' R U' R' F2 R",
        tier: "A"
      },
      {
        alg: "(U) R' F R F' R U R' U' R U R' U' R' F R F'",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-t-5",
    name: "T 5",
    category: "CLL",
    subCategory: "T",
    algs: [
      {
        alg: "(U2) R U R' U2' R U R' U R' F R F'",
        tier: "S"
      },
      {
        alg: "R' F' R U2 R' F' R U' R U' R' F",
        tier: "S"
      },
      {
        alg: "(U') F R F' R U R' U R' U' R U' R'",
        tier: "A"
      },
      {
        alg: "(U) R U2 R' U R U2 R' U R' F R F'",
        tier: "A"
      },
      {
        alg: "(U') R U2' R' U' R U' R2' F' R U R U' R' F",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-t-6",
    name: "T 6",
    category: "CLL",
    subCategory: "T",
    algs: [
      {
        alg: "(U) R' U R U2 R2 F R F' R",
        tier: "S",
      },
      {
        alg: "(U) L U' L' U2 L2 F' L' F L'",
        tier: "S"
      },
      {
        alg: "(U') R' F R U2 R2 F R U' R",
        tier: "A"
      },
      {
        alg: "(U) R U R2' F R F' U R U R'",
        tier: "A"
      },
      {
        alg: "(U') R U' R' U' F R' F' R2 U' R'",
        tier: "A"
      },
      {
        alg: "R U2 R' U' R2 U' R' F R' F' ",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-h-1",
    name: "H 1",
    category: "CLL",
    subCategory: "H",
    algs: [
      {
        alg: "R2 U2 R U2 R2",
        tier: "S"
      },
      {
        alg: "R2 U2 R' U2 R2",
        tier: "S"
      },
      {
        alg: "R U' R' U' R U R' U R U R'",
        tier: "S"
      },
      {
        alg: "R U' R' U' R U' R' U R U R'",
        tier: "S"
      },
      {
        alg: "(U') R U R' U R U' R' U R U2 R'",
        tier: "A"
      },
      {
        alg: "R U2' R' U' R U R' U' R U' R'",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-h-2",
    name: "H 2",
    category: "CLL",
    subCategory: "H",
    algs: [
      {
        alg: "(U/U') (R' F R F' R U R')2",
        tier: "S"
      },
      {
        alg: "(U/U') (R U' R' F R' F' R)2",
        tier: "S"
      },
      {
        alg: "x' U2 R' F2 R2 U2 R' U2",
        tier: "A"
      }
    ]
  },
  {
    id: "cll-h-3",
    name: "H 3",
    category: "CLL",
    subCategory: "H",
    algs: [
      {
        alg: "R U R' U R U R' F R' F' R",
        tier: "S"
      },
      {
        alg: "(U2) R' F' R U' R' F' R F' R U R'",
        tier: "S"
      },
      {
        alg: "R U' R' U R U R' U2 F R' F' R",
        tier: "A"
      },
      {
        alg: "(U2) R' F R U' R' F' R U2 F' R U R'",
        tier: "A"
      },
      {
        alg: "(U) R' F R F' U' F R' F' R2 U' R'",
        tier: "B"
      },
      {
        alg: "(U) R U' R' F U F' R U R2' F R",
        tier: "B"
      },
      {
        alg: "(U2) R U' R' F R' F' R2 U R' U R U2 R'",
        tier: "B"
      }
    ]
  },
  {
    id: "cll-h-4",
    name: "H 4",
    category: "CLL",
    subCategory: "H",
    algs: [
      {
        alg: "(U) F R2 U' R2 U' R2 U R2 F'",
        tier: "S"
      },
      {
        alg: "(U') F R' F' R U' R U' R' U R' F R F'",
        tier: "S"
      },
      {
        alg: "(U) R U2 R2 F R F' U2 R' F R F'",
        tier: "A"
      },
      {
        alg: "(U') F' R U R' U R' F R U' R U' R' F",
        tier: "A"
      },
    ]
  },
];
