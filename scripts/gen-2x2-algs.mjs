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

// --- emit TypeScript (modular) --------------------------------------------
// Writes one file per category/sub-category under data/algs/2x2/.
// Types live in data/algs/types.ts and are imported (not re-emitted).
function esc(s) {
  return JSON.stringify(s);
}

// Map a category (+ optional subCategory) to its target module file relative
// to data/algs/2x2/, the exported const name, and the import depth to types.
function targetFor(category, subCategory) {
  if (category === "CLL")  return { file: "cll.ts",       name: "cllData",       depth: 1 };
  if (category === "EG1")  return { file: "eg1.ts",       name: "eg1Data",       depth: 1 };
  if (category === "EG2")  return { file: "eg2.ts",       name: "eg2Data",       depth: 1 };
  if (category === "LEG")  return { file: "leg1.ts",      name: "leg1Data",      depth: 1 };
  if (category === "TCLL" && subCategory === "TCLL+") return { file: "tcll-plus.ts",  name: "tcllPlusData",  depth: 1 };
  if (category === "TCLL" && subCategory === "TCLL-") return { file: "tcll-minus.ts", name: "tcllMinusData", depth: 1 };
  if (category === "LS" && subCategory) {
    const n = subCategory.replace(/[^0-9]/g, "");
    return { file: `ls/ls${n}.ts`, name: `ls${n}Data`, depth: 2 };
  }
  // Fallback: dump unknown categories into a catch-all file.
  return { file: "misc.ts", name: "miscData", depth: 1 };
}

function renderModule(name, entries, typesDepth) {
  const rel = "../".repeat(typesDepth) + "types";
  const out = [];
  out.push(`import type { TwoByTwoAlg } from "${rel}";`);
  out.push(``);
  out.push(`export const ${name}: TwoByTwoAlg[] = [`);
  for (const e of entries) {
    const parts = [];
    parts.push(`id: ${esc(e.id)}`);
    parts.push(`name: ${esc(e.name)}`);
    parts.push(`category: ${esc(e.category)}`);
    if (e.subCategory) parts.push(`subCategory: ${esc(e.subCategory)}`);
    parts.push(`case: ${esc(e.case)}`);
    parts.push(`alg: ${esc(e.alg)}`);
    if (e.subAlgs && e.subAlgs.length) {
      parts.push(`subAlgs: [${e.subAlgs.map((s) => `{ alg: ${esc(s)} }`).join(", ")}]`);
    }
    out.push(`  { ${parts.join(", ")} },`);
  }
  out.push(`];`);
  out.push(``);
  return out.join("\n");
}

// Group entries by target module.
const groups = new Map(); // file -> { name, depth, entries: [] }
for (const e of entries) {
  const t = targetFor(e.category, e.subCategory);
  if (!groups.has(t.file)) groups.set(t.file, { name: t.name, depth: t.depth, entries: [] });
  groups.get(t.file).entries.push(e);
}

const ALGS_DIR = join(ROOT, "data", "algs", "2x2");
const written = [];
for (const [file, { name, depth, entries: groupEntries }] of groups) {
  const full = join(ALGS_DIR, file);
  writeFileSync(full, renderModule(name, groupEntries, depth), "utf8");
  written.push({ file, count: groupEntries.length });
}

// Summary
console.log(`Wrote ${written.length} module file(s) under data/algs/2x2/:`);
for (const w of written) console.log(`  ${w.file}: ${w.count}`);

const byCat = {};
for (const e of entries) {
  const k = e.subCategory ? `${e.category}/${e.subCategory}` : e.category;
  byCat[k] = (byCat[k] || 0) + 1;
}
console.log(`Total entries: ${entries.length}`);
for (const [k, v] of Object.entries(byCat).sort()) console.log(`  ${k}: ${v}`);
