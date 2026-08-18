// One-off generator: parses all 2x2 CSV files in the project root and emits
// data/algs2x2.ts containing the twoByTwoData array (v2 schema:
// TwoByTwoAlg + SubAlg interfaces, subAlgs as SubAlg[] objects).
//
// CSV columns beyond the first become SubAlg objects { alg }. The enrichment
// fields (tags / cancelPrefix / note) are NOT auto-derivable from the raw
// CSV formulas and are intentionally omitted for later manual curation.
//
// Run: node scripts/gen-2x2-algs.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PREFIX = "Copy of Best 2x2 Algs - ";

// --- CSV parser (handles quoted fields, escaped quotes, CRLF) ---------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else { field += c; }
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// --- file -> (category, subCategory) ---------------------------------------
function mapCategory(baseName) {
  // baseName e.g. "CLL", "PBL", "EG-1", "EG-2", "LEG-1", "TCLL+", "TCLL-", "LS-1".."LS-9"
  if (baseName === "CLL") return { category: "CLL", subCategory: undefined };
  if (baseName === "PBL") return { category: "PBL", subCategory: undefined };
  if (baseName === "EG-1") return { category: "EG1", subCategory: undefined };
  if (baseName === "EG-2") return { category: "EG2", subCategory: undefined };
  if (baseName === "LEG-1") return { category: "LEG", subCategory: undefined };
  if (baseName === "TCLL+") return { category: "TCLL", subCategory: "TCLL+" };
  if (baseName === "TCLL-") return { category: "TCLL", subCategory: "TCLL-" };
  const lsMatch = baseName.match(/^LS-(\d)$/);
  if (lsMatch) return { category: "LS", subCategory: "LS" + lsMatch[1] };
  // Fallback: use the raw base name as category.
  return { category: baseName, subCategory: undefined };
}

// compact id slug
function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function catId(category, subCategory) {
  if (category === "TCLL") return subCategory === "TCLL+" ? "tcll-plus" : subCategory === "TCLL-" ? "tcll-minus" : "tcll";
  if (category === "LS") return (subCategory || "ls").toLowerCase().replace(/[^a-z0-9]+/g, "");
  return category.toLowerCase();
}

// Normalize a formula cell: trim, curly apostrophe -> straight, strip trailing period.
function normalizeFormula(s) {
  if (!s) return "";
  let out = s.trim();
  out = out.replace(/[\u2019\u2018\u02BC]/g, "'");
  out = out.replace(/\u2013|\u2014/g, "-");
  out = out.replace(/\.$/, "");
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

// Is a cell a formula? Must contain an uppercase face/rotation move token.
const FORMULA_CHAR = /^[A-Za-z0-9 \t'’()RRLUUDFBxyz/\-,.+2]+$/;
function isFormula(s) {
  if (!s) return false;
  const t = s.trim();
  if (!t) return false;
  if (!FORMULA_CHAR.test(t)) return false;
  // require at least one move letter
  return /[RLUDFBxyz]/.test(t);
}

function isAllEmpty(cells) {
  return cells.every((c) => !c || !c.trim());
}

// --- main ------------------------------------------------------------------
const files = readdirSync(ROOT)
  .filter((f) => f.startsWith(PREFIX) && f.endsWith(".csv"))
  .sort();

const entries = [];
const counters = new Map(); // key -> n

for (const file of files) {
  const baseName = file.slice(PREFIX.length, -".csv".length);
  const { category, subCategory } = mapCategory(baseName);
  const text = readFileSync(join(ROOT, file), "utf8");
  const rows = parseCSV(text);

  let currentCase = null;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const col0 = (row[0] || "").trim();
    const rest = row.slice(1);

    // Skip the first row (file-level category label).
    if (r === 0) {
      // If the first row also looks like a case header with empty rest, skip it
      // to avoid creating a bogus "category" case.
      continue;
    }

    // Case header: col0 non-empty, all other cells empty.
    if (col0 && isAllEmpty(rest)) {
      currentCase = col0;
      continue;
    }

    // Formula row: col0 empty, at least one formula cell in rest.
    if (!col0) {
      const formulas = rest.map(normalizeFormula).filter((f) => isFormula(f));
      if (formulas.length === 0) continue; // description / blank
      if (!currentCase) continue; // formulas before any case header -> skip

      const key = `${category}|${subCategory || ""}|${currentCase}`;
      const n = (counters.get(key) || 0) + 1;
      counters.set(key, n);

      const id = `${catId(category, subCategory)}-${slug(currentCase)}-${n}`;
      const name = `${currentCase} ${n}`;
      const alg = formulas[0];
      const subAlgs = formulas.slice(1);

      entries.push({
        id,
        name,
        category,
        ...(subCategory ? { subCategory } : {}),
        case: currentCase,
        alg,
        ...(subAlgs.length ? { subAlgs } : {}),
      });
    }
    // else: skip (description rows with col0 + non-formula text, e.g. PBL header)
  }
}

// --- emit TypeScript -------------------------------------------------------
function esc(s) {
  return JSON.stringify(s);
}

const lines = [];
lines.push(`// ==========================================================================`);
lines.push(`// 2x2 full algorithm database.`);
lines.push(`//`);
lines.push(`// Generated from the CSV files in the project root`);
lines.push(`// ("Copy of Best 2x2 Algs - *.csv"). Each formula row becomes one entry;`);
lines.push(`// the first formula column is the main alg (alg) and the remaining columns`);
lines.push(`// are alternative algorithms (subAlgs).`);
lines.push(`//`);
lines.push(`// First-level categories (category field):`);
lines.push(`//   PBL | CLL | EG1 | EG2 | LEG | TCLL [TCLL+, TCLL-] | LS [LS1..LS9]`);
lines.push(`// ==========================================================================`);
lines.push(``);
lines.push(`export interface SubAlg {`);
lines.push(`  alg: string;             // formula text`);
lines.push(`  tags?: string[];         // e.g. "Cancellation", "Multi-Angle", "Mirror", "One-Handed"`);
lines.push(`  cancelPrefix?: string;  // cancellation prefix reservation, e.g. "R U"`);
lines.push(`  note?: string;           // remark`);
lines.push(`}`);
lines.push(``);
lines.push(`export interface TwoByTwoAlg {`);
lines.push(`  id: string;              // unique id, e.g. "cll-sune-1"`);
lines.push(`  name: string;            // case name + index, e.g. "Sune 1"`);
lines.push(`  category: string;       // tier-1 category: PBL | CLL | EG1 | EG2 | LEG | TCLL | LS`);
lines.push(`  subCategory?: string;    // tier-2: TCLL+ | TCLL- | LS1..LS9`);
lines.push(`  case?: string;           // shape/case grouping: Sune, Anti-Sune, Pi, U, T, L, H, ...`);
lines.push(``);
lines.push(`  // main algorithm (aligned with SubAlg fields)`);
lines.push(`  alg: string;             // default recommended main alg`);
lines.push(`  tags?: string[];`);
lines.push(`  cancelPrefix?: string;`);
lines.push(``);
lines.push(`  // variant algorithms`);
lines.push(`  subAlgs?: SubAlg[];`);
lines.push(`}`);
lines.push(``);
lines.push(`export const twoByTwoData: TwoByTwoAlg[] = [`);

for (const e of entries) {
  const parts = [];
  parts.push(`id: ${esc(e.id)}`);
  parts.push(`name: ${esc(e.name)}`);
  parts.push(`category: ${esc(e.category)}`);
  if (e.subCategory) parts.push(`subCategory: ${esc(e.subCategory)}`);
  parts.push(`case: ${esc(e.case)}`);
  parts.push(`alg: ${esc(e.alg)}`);
  // CSV has no tags/cancelPrefix/note -> omit for later manual curation.
  // subAlgs are emitted as SubAlg objects: { alg: "..." }.
  if (e.subAlgs && e.subAlgs.length) {
    parts.push(`subAlgs: [${e.subAlgs.map((s) => `{ alg: ${esc(s)} }`).join(", ")}]`);
  }
  lines.push(`  { ${parts.join(", ")} },`);
}
lines.push(`];`);

const out = lines.join("\n") + "\n";
// Override the output path via GEN_2X2_OUT (relative to project root) to
// dry-run without clobbering data/algs2x2.ts. Defaults to the real file.
const OUT_PATH = process.env.GEN_2X2_OUT
  ? join(ROOT, process.env.GEN_2X2_OUT)
  : join(ROOT, "data", "algs2x2.ts");
writeFileSync(OUT_PATH, out, "utf8");

// Summary
const byCat = {};
for (const e of entries) {
  const k = e.subCategory ? `${e.category}/${e.subCategory}` : e.category;
  byCat[k] = (byCat[k] || 0) + 1;
}
console.log(`Wrote ${OUT_PATH} with ${entries.length} entries.`);
for (const [k, v] of Object.entries(byCat).sort()) console.log(`  ${k}: ${v}`);
