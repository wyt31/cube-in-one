import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CUBING_ROOT = resolve(__dirname, "node_modules", "cubing", "dist", "lib", "cubing", "chunks");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { webpack }) {
    // cubing.js v0.63 ships `search-worker-entry.js` as an ESM web-worker
    // entry. Its scramble chunk references it via:
    //   - `import.meta.resolve("./search-worker-entry.js")`
    //   - `new URL("./search-worker-entry.js", import.meta.url)`
    //   - `await import("./search-worker-entry.js")`   ← the build breaker
    // The project never uses cubing/search, so we redirect every request for
    // that file to a no-op stub (scripts/cubing-search-stub.js).
    //
    // Note: an absolute-path `resolve.alias` key does NOT match a relative
    // request like `./search-worker-entry.js`, so we additionally use
    // NormalModuleReplacementPlugin, which intercepts the request itself.
    // `webpack` here is the instance Next bundles (passed via options).
    const stub = resolve(__dirname, "scripts", "cubing-search-stub.js");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      [resolve(CUBING_ROOT, "search-worker-entry.js")]: stub,
    };
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /search-worker-entry\.js$/,
        (resource) => {
          resource.request = stub;
        },
      ),
    );
    return config;
  },
};

export default nextConfig;
