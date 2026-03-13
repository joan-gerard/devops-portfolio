import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allow separate dev servers (normal dev vs E2E dev) to use different
   * build directories so their caches and lock files do not conflict.
   *
   * - Default: `.next` (normal dev / build / start)
   * - E2E dev server: sets `NEXT_DIST_DIR=.next-e2e` via script/env
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
