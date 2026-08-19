/** @type {import('next').NextConfig} */
const nextConfig = {
  // cubing.js is loaded from the official CDN (cdn.cubing.net) at runtime
  // via <script type="module"> in app/layout.tsx and a `webpackIgnore`'d
  // dynamic import() in app/timer/page.tsx. We deliberately do NOT bundle
  // the `cubing` npm package with webpack — Next.js is incompatible with
  // cubing.js's web-worker + WASM modules
  // (https://github.com/cubing/cubing.js/issues/323). The npm package stays
  // installed only to provide TypeScript types at build time.
  //
  // Therefore: no transpilePackages, no resolve.alias, no
  // NormalModuleReplacementPlugin — none of the previous cubing webpack
  // hacks are needed anymore.
};

export default nextConfig;
