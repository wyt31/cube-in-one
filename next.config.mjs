import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CUBING_ROOT = resolve(__dirname, "node_modules", "cubing", "dist", "lib", "cubing", "chunks");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["cubing"],
  webpack(config) {
    const stub = resolve(__dirname, "scripts", "cubing-search-stub.js");
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      [resolve(CUBING_ROOT, "search-worker-entry.js")]: stub,
    };
    return config;
  },
};

export default nextConfig;
