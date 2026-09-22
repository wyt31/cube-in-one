// ==========================================================================
// 2x2 — EG2 (Experimental Generation 2)
// ==========================================================================
import type { TwoByTwoAlg } from "../types";

export const eg2Data: TwoByTwoAlg[] = [
  {
    id: "eg2-sune-1",
    name: "Sune 1",
    category: "EG2",
    subCategory: "Sune",
    algs: [
      {
        alg: "(U') F U' R2 U' R' U2 R U' R2 F'",
        tier: "S",
      },
      {
        alg: "(U') R' F R2 F' R U2 R' U' F2 R2",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-sune-2",
    name: "Sune 2",
    category: "EG2",
    subCategory: "Sune",
    algs: [
      {
        alg: "R U R' U R U2 R B2 R2",
        tier: "S",
      },
      {
        alg: "(U') R' U2 R U R' U R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U') R2 F2 R U2 R U R' U R",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-sune-3",
    name: "Sune 3",
    category: "EG2",
    subCategory: "Sune",
    algs: [
      {
        alg: "R U' R' F R' F' R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U') R' U2 R U R' U2 R' F2 R F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-sune-4",
    name: "Sune 4",
    category: "EG2",
    subCategory: "Sune",
    algs: [
      {
        alg: "F R' F' R U2 R U2 R B2 R2",
        tier: "S",
      },
      {
        alg: "(U2) R' F' U R' F R2 U R' U2 R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-sune-5",
    name: "Sune 5",
    category: "EG2",
    subCategory: "Sune",
    algs: [
      {
        alg: "R' F2 R U2 R U' R' F' R2 B2",
        tier: "S",
      },
      {
        alg: "(U2) R' F R' F2 R U R U R' U R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-sune-6",
    name: "Sune 6",
    category: "EG2",
    subCategory: "Sune",
    algs: [
      {
        alg: "R2 B2 R' U' R' F R' F' R",
        tier: "S",
      },
      {
        alg: "R' F U R' F R2 U R' U' R",
        tier: "A",
      },
      {
        alg: "(U) R' U R' U' F U R2 U R' U' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-anti-sune-1",
    name: "Anti-Sune 1",
    category: "EG2",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R' U R U' R2 F R F' R U R' U' R' F2 R2",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-anti-sune-2",
    name: "Anti-Sune 2",
    category: "EG2",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "R' U' R U' R' U2 R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U2) R' F' R U' R' F2 R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U) R U2 R' U' R U' R B2 R2",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-anti-sune-3",
    name: "Anti-Sune 3",
    category: "EG2",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R' F R F' R U R B2 R2",
        tier: "S",
      },
      {
        alg: "(U) R F R' F' R U R U' B2 R2",
        tier: "A",
      },
      {
        alg: "(U') F' U' R' U R' U2 F R2",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-anti-sune-4",
    name: "Anti-Sune 4",
    category: "EG2",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "R' U2 R U' R2 F' R U' F R",
        tier: "S",
      },
      {
        alg: "(U2) F' R U R' U2' R' F2 R' F2 R2",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-anti-sune-5",
    name: "Anti-Sune 5",
    category: "EG2",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) F R F' U R2 F' R U' R",
        tier: "S",
      },
      {
        alg: "R2 B2 R2 F' R U R' U2 R' F2 R",
        tier: "A",
      },
      {
        alg: "(U2) R U2' R' U2' R' F R F R2 B2",
        tier: "A",
      },
      {
        alg: "R' U' R U' R' U' R' F2 R F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-anti-sune-6",
    name: "Anti-Sune 6",
    category: "EG2",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R2' F2 R F R F' R U R'",
        tier: "S",
      },
      {
        alg: "(U2) R' F R F R2 F2 R U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-pi-1",
    name: "Pi 1",
    category: "EG2",
    subCategory: "Pi",
    algs: [
      {
        alg: "F U' R U2 R U' R' U R' F'",
        tier: "S",
      },
      {
        alg: "F R U2 R' U2 R' U R U2 F'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-pi-2",
    name: "Pi 2",
    category: "EG2",
    subCategory: "Pi",
    algs: [
      {
        alg: "R' U2 R2 U' R' F2 R2 F'",
        tier: "S",
      },
      {
        alg: "(U2) R' U R' F R2 U R' U' R U2 R' U' R",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-pi-3",
    name: "Pi 3",
    category: "EG2",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U2) R' F' U R' F R2 U2 R' U R",
        tier: "S",
      },
      {
        alg: "R' F R U R' U' R U2 R' U' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-pi-4",
    name: "Pi 4",
    category: "EG2",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U) R' F U' R U R' F2 U2 R",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-pi-5",
    name: "Pi 5",
    category: "EG2",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') R' F' R' F2 R2 U R' U2 R",
        tier: "S",
      },
      {
        alg: "(U') R' F' R U' R2 F2 R U2 R",
        tier: "S",
      },
      {
        alg: "(U) R' U' R' F2 R2 U R' F2 R",
        tier: "S",
      },
      {
        alg: "(U) R' F' U2 R U' R' U F U' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-pi-6",
    name: "Pi 6",
    category: "EG2",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U) R' U2 R U' R2 F2 R F R",
        tier: "S",
      },
      {
        alg: "R' U F' U' R U R' U2 F R",
        tier: "A",
      },
      {
        alg: "(U) R' U2 R' F2 R2 U R' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-u-1",
    name: "U 1",
    category: "EG2",
    subCategory: "U",
    algs: [
      {
        alg: "F U' R U2 R U' R' U2 R' U' F'",
        tier: "S",
      },
      {
        alg: "(U) R2 U2 R U R' U F' R U' R",
        tier: "A"
      },
      {
        alg: "R' U R' F U' R U' R U2 R2",
        tier: "B",
      },
      {
        alg: "R' U R' F U' R U' R' U2 R2",
        tier: "B"
      }
    ]
  },
  {
    id: "eg2-u-2",
    name: "U 2",
    category: "EG2",
    subCategory: "U",
    algs: [
      {
        alg: "R' U' F R' F' R U R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U2) R' U' R' F R F' U R' F2 R2",
        tier: "S",
      },
      {
        alg: "F R U R' U' F R2 B2",
        tier: "S"
      }
    ]
  },
  {
    id: "eg2-u-3",
    name: "U 3",
    category: "EG2",
    subCategory: "U",
    algs: [
      {
        alg: "(U) R U R' U' R B2 R' U R U' R' ",
        tier: "S",
      },
      {
        alg: "(U) R' F' R U R' U2' R U' R' F R",
        tier: "S",
      },
      {
        alg: "R' U' R' F2 R2 U2 R' F R",
        tier: "S",
      },
      {
        alg: "(U') R' U' R U R' F2 R U' R' U R",
        tier: "A",
      },
      {
        alg: "R' U' R U R2 F2 R2 U' R' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-u-4",
    name: "U 4",
    category: "EG2",
    subCategory: "U",
    algs: [
      {
        alg: "R2 F2 R U R U2 R2 F R F' R",
        tier: "S",
      },
      {
        alg: "(U2) R' U R' F' R U' R U R' F2 R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-u-5",
    name: "U 5",
    category: "EG2",
    subCategory: "U",
    algs: [
      {
        alg: "(U') R2 B2 R' U R' U' R' F R F'",
        tier: "S",
      },
      {
        alg: "(U') R U' R' U2 R B R' U2 R U' R'",
        tier: "A",
      },
      {
        alg: "(U') R' F R' F' R F' R U2 R' U R",
        tier: "A",
      },
      {
        alg: "R U2 R' U2 R B2 R' U R U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-u-6",
    name: "U 6",
    category: "EG2",
    subCategory: "U",
    algs: [
      {
        alg: "(U') R2 B2 R2 F R F' R U R' U' R'",
        tier: "S",
      },
      {
        alg: "(U) R' U R U2 R' F' R U2 R' U R",
        tier: "A",
      },
      {
        alg: "(U2) R' F2 R U2 R' U2 R U' R' F R",
        tier: "A",
      },
      {
        alg: "(U') R' F R U2 R' U' R U2 R' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-l-1",
    name: "L 1",
    category: "EG2",
    subCategory: "L",
    algs: [
      {
        alg: "R2 B2 R2 F R' F' R U R U' R'",
        tier: "S",
      },
      {
        alg: "F U' R U R U' R' U R F'",
        tier: "S",
      },
      {
        alg: "R' U' R' F' R U' R U' R' F R",
        tier: "A",
      },
      {
        alg: "F U2 R' U R U2 R F'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-l-2",
    name: "L 2",
    category: "EG2",
    subCategory: "L",
    algs: [
      {
        alg: "(U) R2 B2 R' U R U' R' F R' F'",
        tier: "S",
      },
      {
        alg: "R2 B2 R2 F R U' R' U' R U R' F'",
        tier: "A",
      },
      {
        alg: "R' U' F R U2 R' U' R U' R' F2 R",
        tier: "A",
      },
      {
        alg: "(U) F' R F' U' R2 F R U2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-l-3",
    name: "L 3",
    category: "EG2",
    subCategory: "L",
    algs: [
      {
        alg: "(U) R' U R' U2' R U' R' U R U' B2 R2'",
        tier: "S",
      },
      {
        alg: "R' U' F2 R U2 R' U2 F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-l-4",
    name: "L 4",
    category: "EG2",
    subCategory: "L",
    algs: [
      {
        alg: "(U2) R' U' R U R' F' R U R' U' R' F' R2",
        tier: "S",
      },
      {
        alg: "R U2 R2 F R F' R U2 R B2 R2",
        tier: "A",
      },
      {
        alg: "(U) F R U R U' R' U F' U R' U' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-l-5",
    name: "L 5",
    category: "EG2",
    subCategory: "L",
    algs: [
      {
        alg: "F R' F' R U R U' R B2 R2",
        tier: "S",
      },
      {
        alg: "R' U R' F R F' R U R' U2 R' F2 R2",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-l-6",
    name: "L 6",
    category: "EG2",
    subCategory: "L",
    algs: [
      {
        alg: "(U) F' R U R' U' R' F R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U') R U R U' R' F R' F' R2 B2 R2",
        tier: "S",
      },
      {
        alg: "R' F' R U R' U2 R U2 R' F2 R",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-t-1",
    name: "T 1",
    category: "EG2",
    subCategory: "T",
    algs: [
      {
        alg: "F R F' R U R' U' R B2 R2",
        tier: "S",
      },
      {
        alg: "(U) R U2 F R F' U2 R B2 R2",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-t-2",
    name: "T 2",
    category: "EG2",
    subCategory: "T",
    algs: [
      {
        alg: "R U R' U' R' F R F' R2 B2 R2",
        tier: "S",
      },
      {
        alg: "R' U2 R U' R' F R' F' R U' R' F2 R2",
        tier: "A",
      },
      {
        alg: "F U' R2 U' R' U R2 F'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-t-3",
    name: "T 3",
    category: "EG2",
    subCategory: "T",
    algs: [
      {
        alg: "(U) R' U R U2' R2' F' R U' R",
        tier: "S",
      },
      {
        alg: "(U2) R' U R' F U' R U R2",
        tier: "S"
      },
      {
        alg: "(U) R' U R' F R2 U2 R' U' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-t-4",
    name: "T 4",
    category: "EG2",
    subCategory: "T",
    algs: [
      {
        alg: "(U) R2 F2 R U' F R' F' R U R ",
        tier: "S",
      },
      {
        alg: "(U') R2 F2 R U' R' F R F' U R",
        tier: "S",
      },
      {
        alg: "(U') R2 B2 R2 F R U R' U' F'",
        tier: "S",
      }
    ]
  },
  {
    id: "eg2-t-5",
    name: "T 5",
    category: "EG2",
    subCategory: "T",
    algs: [
      {
        alg: "R' U2 R U' R' F R' F R F' R",
        tier: "S",
      },
      {
        alg: "(U) R' U R U2 R2 F R F' R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U2) R' F2 R U' R' U R' F R U' R",
        tier: "A",
      },
      {
        alg: "(U') R' F R' F' R2 U2 R' U' R' F2 R2",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-t-6",
    name: "T 6",
    category: "EG2",
    subCategory: "T",
    algs: [
      {
        alg: "(U2) R' U2 R' F2 R F2 R",
        tier: "S",
      },
      {
        alg: "(U2) R U2 R F2 R' U2 R'",
        tier: "S",
      },
      {
        alg: "R' F' U R U2 R' F' U R",
        tier: "S",
      },
      {
        alg: "(U) R' U F' R U2 R' U F' R",
        tier: "S"
      },
      {
        alg: "(U') R' F U' R U2 R' F U' R",
        tier: "A",
      },
      {
        alg: "(U2) R' U' F R U2 R' U' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-h-1",
    name: "H 1",
    category: "EG2",
    subCategory: "H",
    algs: [
      {
        alg: "R' F' R' F2 R U' F R' F' R U' R",
        tier: "S",
      },
      {
        alg: "(U/U') R2 F U2 F2 R2 F' R2",
        tier: "S",
      },
      {
        alg: "(U/U') x' R2 U' R2 U2 F2 U R2",
        tier: "S",
      },
      {
        alg: "(U/U') R2 F' U2 F2 R2 F R2",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-h-2",
    name: "H 2",
    category: "EG2",
    subCategory: "H",
    algs: [
      {
        alg: "R2 U2 R U2 B2 R2",
        tier: "S",
      },
      {
        alg: "R2 U2 R' U2 F2 R2",
        tier: "S"
      },
      {
        alg: "R2 F2 U2 R U2 R2",
        tier: "A",
      },
      {
        alg: "R2 F2 U2 R' U2 R2",
        tier: "A",
      }
    ]
  },
  {
    id: "eg2-h-3",
    name: "H 3",
    category: "EG2",
    subCategory: "H",
    algs: [
      {
        alg: "R' U' R U2 R2 F' R U' F R",
        tier: "S",
      },
      {
        alg: "(U) R' U' F R U' R U R' U2 R' F",
        tier: "S",
      },
      {
        alg: "R' U' R' F R2 U2 R' U' F R",
        tier: "A",
      },
      {
        alg: "R U R' U2 R2 F U' F U' R'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg2-h-4",
    name: "H 4",
    category: "EG2",
    subCategory: "H",
    algs: [
      {
        alg: "R U2 B2 R' U R U' B R'",
        tier: "S",
      },
      {
        alg: "R' U' R U' R U' R' F U2 R' U' R",
        tier: "A",
      },
      {
        alg: "R' U2 F2 R U' R' U F' R",
        tier: "A",
      }
    ]
  },
];
