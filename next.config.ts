import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const r2Domain = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).host : "";
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  // ── Forces HTTPS for 2 years, including subdomains ─────────────────
  // preload signals intent to join the HSTS preload list (browsers load
  // via HTTPS without ever making an initial HTTP request).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // ── Prevents the page being embedded in an iframe ──────────────────
  // DENY means no context — not even same origin — can embed this page.
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // ── Prevents browsers guessing content type from response body ──────
  // Without this, a browser might execute a response labelled text/plain
  // as JavaScript if it looks like a script.
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // ── Controls how much referrer info is sent with requests ───────────
  // Full URL sent to same origin, only origin (no path) sent cross-origin.
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // ── Disables browser features the app never uses ────────────────────
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "browsing-topics=()",
      "interest-cohort=()",
    ].join(", "),
  },
  // ── Content Security Policy ─────────────────────────────────────────
  // Notes on 'unsafe-inline':
  //   script-src: Next.js App Router injects inline hydration scripts.
  //     Nonces are the correct solution but require significant Next.js
  //     middleware plumbing. Acceptable trade-off for a portfolio.
  //   style-src: Public pages use inline style={{}} objects throughout.
  //     React Flow also uses inline styles extensively. No alternative
  //     without a full refactor.
  //
  // connect-src 'self' covers the Sentry tunnel at /monitoring —
  //   no need to whitelist sentry.io directly.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:" + (r2Domain ? ` https://${r2Domain}` : ""),
      "font-src 'self'",
      "connect-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  /**
   * Allow separate dev servers (normal dev vs E2E dev) to use different
   * build directories so their caches and lock files do not conflict.
   *
   * - Default: `.next` (normal dev / build / start)
   * - E2E dev server: sets `NEXT_DIST_DIR=.next-e2e` via script/env
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG,

  project: "devops-portfolio",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
