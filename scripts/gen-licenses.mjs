#!/usr/bin/env node
// Generates data/licenses.json from the installed node_modules tree.
// Walks every package (transitively installed under the hoisted layout),
// dedupes by name, and captures name/version/license/author/repository plus
// the copyright text from the package's LICENSE file (when present).
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(join(fileURLToPath(import.meta.url), "../../node_modules"));

const seen = new Map();
const todos = [root];

while (todos.length) {
  const dir = todos.pop();
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue;
  }
  for (const name of entries) {
    if (name === ".bin") continue;
    const full = join(dir, name);
    if (name.startsWith("@")) {
      // scoped scope dir -> recurse one level deeper
      try {
        if (statSync(full).isDirectory()) todos.push(full);
      } catch {}
      continue;
    }
    const pkgJson = join(full, "package.json");
    if (!existsSync(pkgJson)) continue;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgJson, "utf8"));
    } catch {
      continue;
    }
    const pkgName = pkg.name || name;
    if (seen.has(pkgName)) continue;
    seen.set(pkgName, null);

    // Try to pull a copyright line out of an adjacent LICENSE file.
    let copyright = "";
    for (const licName of ["LICENSE", "LICENSE.md", "LICENSE-MIT", "LICENSE-MIT.txt",
      "LICENSE-APACHE", "LICENSE-Apache-2.0", "COPYING", "LICENCE"]) {
      const licPath = join(full, licName);
      if (!existsSync(licPath)) continue;
      try {
        const text = readFileSync(licPath, "utf8");
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const copyLine = lines.find((l) => { u = l.toLowerCase(); return u.startsWith("copyright"); });
        copyright = copyLine || "";
      } catch {}
      break;
    }

    seen.set(pkgName, {
      name: pkgName,
      version: pkg.version || "",
      license: Array.isArray(pkg.license) ? pkg.license.map((x) => x.type).join(" OR ")
        : typeof pkg.license === "string" ? pkg.license
        : pkg.license && pkg.license.type ? pkg.license.type : "Unknown",
      author: parseAuthor(pkg.author),
      repository: parseRepo(pkg.repository),
      copyright,
    });

    // recurse dependencies of this package for a deeper walk
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.optionalDependencies || {}),
      ...(pkg.peerDependencies || {}),
    };
    for (const dep of Object.keys(deps)) {
      if (dep.startsWith("@")) {
        const [scope, sub] = dep.split("/");
        todos.push(join(root, scope, sub));
      } else {
        todos.push(join(root, dep));
      }
    }
  }
}

function parseAuthor(a) {
  if (!a) return "";
  if (typeof a === "string") {
    const m = a.match(/^([^<(]+)/);
    return m ? m[1].trim() : "";
  }
  return (a.name || "").trim();
}

function parseRepo(r) {
  if (!r) return "";
  if (typeof r === "string") return r;
  return r.url || "";
}

const result = Array.from(seen.values())
  .filter((p) => p) // drop unresolved entries
  .filter((p) => p.name !== "cube-in-one") // our own project
  .filter((p) => p.license && p.license !== "UNLICENSED")
  .sort((a, b) => a.name.localeCompare(b.name));

const out = resolve(join(fileURLToPath(import.meta.url), "../../data/licenses.json"));
writeFileSync(out, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(`Wrote ${result.length} licenses to ${out}`);