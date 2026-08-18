import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CUBING_ROOT = resolve(__dirname, "node_modules", "cubing", "dist", "lib", "cubing", "chunks");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // cubing.js v0.63 ships search-worker-entry.js as an ESM module, but
    // webpack/Terser's default "asset/resource" pipeline treats it as a
    // classic web worker script — triggering "import/export cannot be used
    // outside of module code" during production minification. Since this
    // project uses only cubing/{scramble, puzzles, twisty} and never
    // references cubing/search, we alias these unused search modules to a
    // tiny stub that does nothing (avoids the Terser parse error).
    const stub = resolve(__dirname, "scripts", "cubing-search-stub.js");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      [resolve(CUBING_ROOT, "search-worker-entry.js")]: stub,
    };
    return config;
  },
};

export default nextConfig;
