const withPWA = require("next-pwa")({
  dest: "public",
  disable: false, // Enable in development for testing
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Next traces `pg-cloudflare` under Node conditions, where its exports resolve
  // to dist/empty.js, so dist/index.js never reaches the standalone output.
  // OpenNext then bundles the worker under the `workerd` condition, which does
  // require dist/index.js, and esbuild fails to resolve it. Pull the whole
  // package into the trace so the file is there when the worker is bundled.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pg-cloudflare/**/*"],
  },
};

module.exports = withPWA(nextConfig);

// Dev only. This spins up the Cloudflare dev platform so `next dev` can see
// bindings, and next.config.ts is evaluated for `next build` too. Since the
// Hyperdrive binding was added it throws during a build, because a build
// environment has no local Postgres to emulate Hyperdrive against.
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
