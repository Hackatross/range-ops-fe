import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is OFF for W1.
  // When enabled, every component touching dynamic I/O (auth(), cookies(),
  // searchParams) must be wrapped in <Suspense> or carry `'use cache'`.
  // We'll flip this to `true` in W4 when we start caching the leaderboard
  // / shooter history pages — and then audit each page for Suspense
  // boundaries in one pass.
  // cacheComponents: true,

  // React Compiler — auto-memoizes components so we don't sprinkle
  // useMemo / useCallback through the live shot feed and dashboard.
  reactCompiler: true,

  experimental: {
    // Turbopack disk cache for dev — faster restarts on the next bd-army boot
    // (vs. cold rebuild every time).
    turbopackFileSystemCacheForDev: true,
  },

  // Fluid ships pre-built ESM dist; Next/Turbopack must re-process it so
  // its JSX runtime + HMR boundaries line up with this app's React copy.
  transpilePackages: ["@classytic/fluid"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
