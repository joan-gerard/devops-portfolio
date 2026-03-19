import sql from "../lib/db";

export default async function globalTeardown() {
  // Only run cleanup in explicit E2E/CI contexts to avoid touching non-test data.
  if (process.env.E2E_TEST !== "1" && !process.env.CI) {
    console.warn(
      "[global-teardown] Skipping E2E cleanup because neither E2E_TEST=1 nor CI=true is set."
    );
    return;
  }

  try {
    await sql`DELETE FROM pages WHERE e2e_only = true`;
    await sql`DELETE FROM projects WHERE e2e_only = true`;
    await sql`DELETE FROM roadmap_items WHERE e2e_only = true`;
    // If you add more E2E-only tables later, clean them here as well.
  } catch (error) {
    console.error("[global-teardown] Error during E2E cleanup:", error);
    // Intentionally do not rethrow so teardown failures don't mask test failures.
  }
}
