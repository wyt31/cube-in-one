// Algorithm data type definitions (shared across 2x2 / 3x3 datasets).

export type Tier = "S" | "A" | "B";

// Tier weight mapping used to rank candidate algorithms within a case.
// Higher weight = higher tier = rendered first (S tier on top).
export const tierWeight: Record<Tier, number> = {
  S: 3,
  A: 2,
  B: 1,
};

export interface AlgItem{
  alg: string;
  tier: Tier;
  note?: string;
}

export interface TwoByTwoAlg {
  id: string;             // unique id
  name: string;           // e.g. "Sune 1"
  category: string;       // e.g. "CLL", "EG-1"
  subCategory?: string;   // e.g. "Sune"
  case?: string;

  //Candidate algs
  algs: AlgItem[];     
}
