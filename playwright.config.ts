import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

/**
 * Playwright config for e2e tests.
 * Run the dev server before e2e tests, or use the webServer option to start it automatically.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  globalTeardown: require.resolve("./e2e/global-teardown"),
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    // Parallel specs (auth, public, smoke) — default workers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/admin-content.spec.ts", "**/destructive.spec.ts"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["**/admin-content.spec.ts", "**/destructive.spec.ts"],
    },
    // Admin + destructive specs — 1 worker each so they don't race with each other or with parallel specs
    {
      name: "chromium-admin",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/admin-content.spec.ts", "**/destructive.spec.ts"],
      workers: 1,
      dependencies: ["chromium"],
    },
    // Admin + destructive specs run only in Chromium to avoid cross-browser
    // data races against shared state (notes/projects DB, E2E user account).
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "pnpm dev:e2e",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
  },
});
