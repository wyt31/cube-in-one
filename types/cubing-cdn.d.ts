// ============================================================================
// Type declarations for cubing.js CDN modules.
//
// At runtime these are loaded as native ESM modules from cdn.cubing.net
// (via `/* webpackIgnore: true */ import("https://cdn.cubing.net/v0/js/...")`).
// TypeScript doesn't know how to resolve URL specifiers, so we declare them
// here as modules that re-export the matching types from the locally
// installed `cubing` npm package (which is kept in devDependencies for types).
//
// This file is picked up automatically via the tsconfig `"include": ["**/*.ts"]`.
// ============================================================================

// `https://cdn.cubing.net/v0/js/cubing/scramble`
declare module "https://cdn.cubing.net/v0/js/cubing/scramble" {
  export * from "cubing/scramble";
}

// `https://cdn.cubing.net/v0/js/cubing/puzzles`
declare module "https://cdn.cubing.net/v0/js/cubing/puzzles" {
  export * from "cubing/puzzles";
}
