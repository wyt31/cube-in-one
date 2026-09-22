// ==========================================================================
// 2x2 — EG1 (Experimental Generation 1)
// ==========================================================================
import type { TwoByTwoAlg } from "../types";

export const eg1Data: TwoByTwoAlg[] = [
  {
    id: "eg1-sune-1",
    name: "Sune 1",
    category: "EG1",
    subCategory: "Sune",
    algs: [
      {
        alg: "(U2) R U R' U F R U' R2 F' R ",
        tier: "S",
      },
      {
        alg: "(U) R U' R2 F' R F U R' F R",
        tier: "S",
      },
      {
        alg: "y' (U') R' F R2 F' R2 U2 R",
        tier: "S",
      },
      {
        alg: "(U') B' U L2 F2 U F'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-sune-2",
    name: "Sune 2",
    category: "EG1",
    subCategory: "Sune",
    algs: [
      {
        alg: "R U R' F2 U F R U R' ",
        tier: "S",
      },
      {
        alg: "(U) F R' F' R F R U' R' U R' F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-sune-3",
    name: "Sune 3",
    category: "EG1",
    subCategory: "Sune",
    algs: [
      {
        alg: "(U2) F R' F' R U R' F' R2 U R' ",
        tier: "S",
      },
      {
        alg: "(U') R' F R U2 R U' R2 F2 R F'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-sune-4",
    name: "Sune 4",
    category: "EG1",
    subCategory: "Sune",
    algs: [
      {
        alg: "(U) F' R' F R2 U R' U' F R' F' R",
        tier: "S",
      },
      {
        alg: "(U') R U' R' F U' R' F R2 U R' F'",
        tier: "S",
      },
      {
        alg: "R U R' F' U R U2 R' U2 R U R'",
        tier: "A",
      },
      {
        alg: "F' U R U' R' U F R U R' ",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-sune-5",
    name: "Sune 5",
    category: "EG1",
    subCategory: "Sune",
    algs: [
      {
        alg: "(U) R U' R' U R U' R' U F R U' R'",
        tier: "S",
      },
      {
        alg: "(U2) R U2 R' U R' F' R F R' F R",
        tier: "S",
      },
      {
        alg: "R U R' F R U' R' U R' F2 R",
        tier: "S",
      },
      {
        alg: "(U) R U' R' U R U' R' U' R' F' R F",
        tier: "A",
      },
      {
        alg: "(U') R' F' R F U R' F' R U R' F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-sune-6",
    name: "Sune 6",
    category: "EG1",
    subCategory: "Sune",
    algs: [
      {
        alg: "R' F R2 U' R' U R U' R' F ",
        tier: "S",
      },
    ]
  },
  {
    id: "eg1-anti-sune-1",
    name: "Anti-Sune 1",
    category: "EG1",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U) R' F R2 U R' F' U' R U' R'",
        tier: "S",
      },
      {
        alg: "R' F' R U' F' R' F R2 U R'",
        tier: "S",
      },
      {
        alg: "(U') B U' R2 F2 U' F",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-anti-sune-2",
    name: "Anti-Sune 2",
    category: "EG1",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "R' F R U' R U R' F' R' F R F'",
        tier: "S",
      },
      {
        alg: "(U) R U' R' F' U' F2 R U' R' ",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-anti-sune-3",
    name: "Anti-Sune 3",
    category: "EG1",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "F' R U R' U' R U R2 F' R ",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-anti-sune-4",
    name: "Anti-Sune 4",
    category: "EG1",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U) F R U' R2' F' R U F' R U R'",
        tier: "S",
      },
      {
        alg: "(U') R' F R F' U R U' R2 F' R F",
        tier: "S",
      },
      {
        alg: "R U' R' F' U' R U R' U' F ",
        tier: "A",
      },
      {
        alg: "(U') R U R' F R U' R' U2 R' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-anti-sune-5",
    name: "Anti-Sune 5",
    category: "EG1",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U') R U R' F' U' R U R' U' R U R'",
        tier: "S",
      },
      {
        alg: "R' F2 R U' R U R' F' R U' R'",
        tier: "S",
      },
      {
        alg: "(U2) R' F' R F' R' F R U' R U2' R'",
        tier: "S",
      },
      {
        alg: "(U) F' R' F R U R U R' U' R U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-anti-sune-6",
    name: "Anti-Sune 6",
    category: "EG1",
    subCategory: "Anti-Sune",
    algs: [
      {
        alg: "(U2) R U' R2 F R U' R' F R F' ",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-pi-1",
    name: "Pi 1",
    category: "EG1",
    subCategory: "Pi",
    algs: [
      {
        alg: "R U2 R2 F R F' R U' R2 F' R2 U R'",
        tier: "S",
      },
      {
        alg: "y2 (U) R' F R2 U' R2' F R' F2 R2",
        tier: "S",
      },
      {
        alg: "(U2) R2 B2 R' U R' U' R U2 R U' R2",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-pi-2",
    name: "Pi 2",
    category: "EG1",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') R U R2 F' R2 U R' ",
        tier: "S",
      },
      {
        alg: "(U') R' F' R2 U R2 F' R",
        tier: "S"
      },
      {
        alg: "(U') R' F R2 U' R2 F R",
        tier: "S",
      },
      {
        alg: "(U') R U' R2 F R2 U' R'",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-pi-3",
    name: "Pi 3",
    category: "EG1",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') F R' F U' F2 R U R ",
        tier: "S",
      },
      {
        alg: "(U') F' R U2 R' F' U2 F R' F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-pi-4",
    name: "Pi 4",
    category: "EG1",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') R U' R' U R U' R' F R U' R'",
        tier: "S",
      },
      {
        alg: "(U') R' F R U' R' F R F' R' F R",
        tier: "S",
      },
      {
        alg: "(U') F R' F' R U R' F' R F R' F' R",
        tier: "A",
      },
      {
        alg: "(U') F' R U R' U' R U R' F' R U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-pi-5",
    name: "Pi 5",
    category: "EG1",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') R U R' U R U' R2' F' R F R' F' R",
        tier: "S",
      },
      {
        alg: "R U' R2 F R U R U' R' U' R' F R F'",
        tier: "A",
      },
      {
        alg: "(U) F U' R U2 R' F' R U R' F'",
        tier: "A",
      },
      {
        alg: "(U2) F' R' F R F' R' F2 R U' F",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-pi-6",
    name: "Pi 6",
    category: "EG1",
    subCategory: "Pi",
    algs: [
      {
        alg: "(U') R' F' R U' R' F R2 U R' F' R U R'",
        tier: "S",
      },
      {
        alg: "(U') R' F R F' R' F R2 U R' U' R U' R'",
        tier: "A",
      },
      {
        alg: "F R U' R' F R U2 R' U F'",
        tier: "A",
      },
      {
        alg: "R U R' F' U' F R' F' R2 U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-u-1",
    name: "U 1",
    category: "EG1",
    subCategory: "U",
    algs: [
      {
        alg: "R U R' U R U' R2 F' R2 U R'",
        tier: "S",
      },
      {
        alg: "(U2) R' F' R U' R' F R2 U R2' F' R",
        tier: "S",
      },
      {
        alg: "R U' R2 F R2 U R' U' R U' R'",
        tier: "A",
      },
      {
        alg: "(U2) R' F R2 U' R2' F' R U R' F R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-u-2",
    name: "U 2",
    category: "EG1",
    subCategory: "U",
    algs: [
      {
        alg: "(U2) R U' R' U R U' R' F R U2' R' F R' F' R",
        tier: "S",
      },
      {
        alg: "F R2 B R2' F U F2 R2",
        tier: "S",
      },
      {
        alg: "(U') y R' U R' U' R U' R' U' F2 R2",
        tier: "S",
      },
      {
        alg: "R U R' F' U' R U R' U' F R' F' R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-u-3",
    name: "U 3",
    category: "EG1",
    subCategory: "U",
    algs: [
      {
        alg: "(U') R U' R2 F2 R F' U R U R'",
        tier: "S",
      },
      {
        alg: "(U) F' U2 R U2 R' U2 F",
        tier: "A",
      },
      {
        alg: "(U) F U2 R' F2 R U2 F'",
        tier: "A"
      },
      {
        alg: "(U') R' F R2 U2 R' F U' R' F' R",
        tier: "A",
      },
      {
        alg: "(U) R U' R' U' F R' F2 R2 U R'",
        tier: "A",
      },
      {
        alg: "(U) R' F R U F' R U2' R2' F' R",
        tier: "A",
      },
      {
        alg: "F R U2 R' F2 R U2 R' F'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-u-4",
    name: "U 4",
    category: "EG1",
    subCategory: "U",
    algs: [
      {
        alg: "(U2) R' F R F' R' F R2 U' R'",
        tier: "S",
      },
      {
        alg: "R U' R' F R U' R2 F R",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-u-5",
    name: "U 5",
    category: "EG1",
    subCategory: "U",
    algs: [
      {
        alg: "(U') R U' R' U R U' R' U R' F' R F",
        tier: "S",
      },
      {
        alg: "(U') R U' R' U R U' R' U' F R U' R'",
        tier: "S",
      },
      {
        alg: "(U2) R' F R U' R U R' F' U R U' R'",
        tier: "S",
      },
      {
        alg: "(U2) R' F R F' U R U' R' F R U' R'",
        tier: "S",
      },
      {
        alg: " (U) F U' R' F2 R F' U2 F'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-u-6",
    name: "U 6",
    category: "EG1",
    subCategory: "U",
    algs: [
      {
        alg: "(U') R' F R U' R' F R U' R U R' F'",
        tier: "S",
      },
      {
        alg: "(U') R' F R U' R' F R U F' R' F R",
        tier: "S",
      },
      {
        alg: "R U' R' F U' R' F R F' R' F R",
        tier: "S",
      },
      {
        alg: "(U2) R U R' F' R U2 R' U2 F R' F' R",
        tier: "A",
      },
      {
        alg: "(U) F' U R U2 R' F U2 F",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-l-1",
    name: "L 1",
    category: "EG1",
    subCategory: "L",
    algs: [
      {
        alg: "R U' R' U R U' R2 F' R F",
        tier: "S",
      },
      {
        alg: "(U') R U' R' F R U' R' U' R' F2 R",
        tier: "A",
      },
      {
        alg: "(U) F R U' R' F' R U R' F' R U R'",
        tier: "A",
      },
      {
        alg: "(U') F' R U R' U2' R' F R2 U R2' F' R",
        tier: "A",
      },
      {
        alg: "(U) R U R' F' R U2 R' U2 R U R'",
        tier: "B",
      },
      {
        alg: "(U) R U' R' F R U R' F' R U2 R'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-l-2",
    name: "L 2",
    category: "EG1",
    subCategory: "L",
    algs: [
      {
        alg: "(U) R' F R U' R' F R2 U R' F'",
        tier: "S",
      },
      {
        alg: "(U2) R' F R F' R' F R U R U2 R'",
        tier: "A",
      },
      {
        alg: "(U2) F R' F' R U2 R U' R2' F' R2 U R'",
        tier: "A",
      },
      {
        alg: "F' R' F R F R' F' R F R' F' R",
        tier: "A",
      },
      {
        alg: "R' F' R F R' F2 R U2 R' F' R ",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-l-3",
    name: "L 3",
    category: "EG1",
    subCategory: "L",
    algs: [
      {
        alg: "R' U R2 U' R2 U' F R2 U' R' ",
        tier: "S",
      },
      {
        alg: "(U2) F' R' F R2 U R' U F' U R' F R F",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-l-4",
    name: "L 4",
    category: "EG1",
    subCategory: "L",
    algs: [
      {
        alg: "R U2 R' F R U' R2 F' R",
        tier: "S",
      },
      {
        alg: "R' F R2 U R' F' R U2 R'",
        tier: "S",
      },
      {
        alg: "(U) R' F2 R F' R' F R2 U R'",
        tier: "S",
      },
      {
        alg: "(U) R U' R2 F' R F R' F2 R",
        tier: "S",
      },
      {
        alg: "(U2) F U2 R' F2 R2 U' R' U2 F'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-l-5",
    name: "L 5",
    category: "EG1",
    subCategory: "L",
    algs: [
      {
        alg: "(U) R U R' F' R U R' U' F R' F' R ",
        tier: "S",
      },
      {
        alg: "(U2) F' R' F R U' R U R' U' R U R'",
        tier: "S",
      },
      {
        alg: "R U R' F' U R U R' U' R U R'",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-l-6",
    name: "L 6",
    category: "EG1",
    subCategory: "L",
    algs: [
      {
        alg: "R' F' R F R' F' R U F' R U R'",
        tier: "S",
      },
      {
        alg: "(U') F R U' R' U R' F' R U R' F' R",
        tier: "S",
      },
      {
        alg: "R' F' R U F' R' F R U' R U R'",
        tier: "S",
      },
      {
        alg: "(U) R' F' R F U' R' F' R U R' F' R",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-t-1",
    name: "T 1",
    category: "EG1",
    subCategory: "T",
    algs: [
      {
        alg: "(U) F R U' R2 F' R U R' F' R",
        tier: "S",
      },
      {
        alg: "(U') R U2' R' U' R' F' R F R' F' R",
        tier: "A",
      },
      {
        alg: "R U' R2 F R2 U R' U2 R' F R F'",
        tier: "A",
      },
      {
        alg: "(U') R' F2 R F' R' F R F R' F' R",
        tier: "A"
      },
      {
        alg: "R' F R U2' R' F2 R F' R' F R",
        tier: "A",
      },
      {
        alg: "R U R' U R U R2 F R U' R' F R F'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-t-2",
    name: "T 2",
    category: "EG1",
    subCategory: "T",
    algs: [
      {
        alg: "(U) F' R' F R2 U R' U' R U R'",
        tier: "S",
      },
      {
        alg: "(U2) R U' R' U2 R U2 R' F R U' R'",
        tier: "A",
      },
      {
        alg: "(U') R U2 R' F R U' R' F' R U R'",
        tier: "A",
      },
      {
        alg: "(U') R' F2 R U R U R' F' R U R'",
        tier: "A",
      },
      {
        alg: "(U2) R' F R2 U' R2' F' R U2 R U' R' F",
        tier: "A",
      },
      {
        alg: "(U') R U R' F' U2 R U R' U' R U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-t-3",
    name: "T 3",
    category: "EG1",
    subCategory: "T",
    algs: [
      {
        alg: "(U2) R U' R2 F R U R U2 R'",
        tier: "S",
      },
      {
        alg: "R' F R2 U' R' U' R' F2 R ",
        tier: "S",
      },
      {
        alg: "(U2) R U2 R' U' R' F' R2 U R'",
        tier: "S",
      },
      {
        alg: "R' F2 R U R U R2 F' R",
        tier: "S",
      }
    ]
  },
  {
    id: "eg1-t-4",
    name: "T 4",
    category: "EG1",
    subCategory: "T",
    algs: [
      {
        alg: "(U') R U' R' F' U' F R' F' R F",
        tier: "S",
      },
      {
        alg: "(U') R U R2' F' R F R' F' R2 U' R' F R' F' R",
        tier: "A",
      },
      {
        alg: "(U2) R' F R F' U R U' R' U' R' F' R F",
        tier: "A",
      },
      {
        alg: "(U') R' F R F' R U2 R' F' R U R' U' R U R'",
        tier: "A",
      },
      {
        alg: "R2 B2 U' R' U' R U' R' U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-t-5",
    name: "T 5",
    category: "EG1",
    subCategory: "T",
    algs: [
      {
        alg: "(U2) R U R2 F' R F R' F' R",
        tier: "S",
      },
      {
        alg: "R' F' R2 U R' F' R U R'",
        tier: "S",
      },
      {
        alg: "R U2 R2' F R2 U' R' F' R U R'",
        tier: "B",
      }
    ]
  },
  {
    id: "eg1-t-6",
    name: "T 6",
    category: "EG1",
    subCategory: "T",
    algs: [
      {
        alg: "(U') R U' R' U2 F R U2 R' F",
        tier: "S",
      },
      {
        alg: "(U') R' F R U2 F' R' F2 R F'",
        tier: "S",
      },
      {
        alg: "(U') R' F R2 U R' F' U2' R' F R F'",
        tier: "A",
      },
      {
        alg: "(U2) R U R' U F R U' R' F' R U R'",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-h-1",
    name: "H 1",
    category: "EG1",
    subCategory: "H",
    algs: [
      {
        alg: "R' F R2 U' R2 U' F U R",
        tier: "S",
      },
      {
        alg: "R' F R2 U' R' F R U R' F'",
        tier: "S",
      },
      {
        alg: "R U' R2 F R F' R' F' R F",
        tier: "S",
      },
      {
        alg: "(U/U') F' R' F R F R' F' R2 U R'",
        tier: "S",
      },
      {
        alg: "(U/U') F R U' R' F' R U R2' F' R",
        tier: "S",
      },
      {
        alg: "(U/U') R U R' F R U' R' U' R U' R' F",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-h-2",
    name: "H 2",
    category: "EG1",
    subCategory: "H",
    algs: [
      {
        alg: "F' U R U' R2 F2 R U' F",
        tier: "S",
      },
      {
        alg: "(U/U') F R U' R2 F U' F2 U R",
        tier: "A",
      }
    ]
  },
  {
    id: "eg1-h-3",
    name: "H 3",
    category: "EG1",
    subCategory: "H",
    algs: [
      {
        alg: "(U) R' F R F' U2 F R U2 R' F",
        tier: "S",
      },
      {
        alg: "R' U' R' F2 U F' R F'",
        tier: "A"
      }
    ]
  },
  {
    id: "eg1-h-4",
    name: "H 4",
    category: "EG1",
    subCategory: "H",
    algs: [
      {
        alg: "R U R' F' R U R' U' R U R'",
        tier: "S",
      },
      {
        alg: "(U2) R' F' R F R' F' R U R' F' R",
        tier: "S",
      },
      {
        alg: "(U) R' F R F' R' F R U' R' F R F'",
        tier: "S",
      }
    ]
  },
];
