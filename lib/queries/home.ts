import sql from "@/lib/db";
import { withPrerenderFallback } from "@/lib/db-errors";
import type { FeaturedProject, RecentNote } from "@/types/home";

const isE2ETestRuntime = process.env.E2E_TEST === "1";

/**
 * Fetches data for the public homepage: recent notes and featured projects.
 * Runs both queries in parallel for better performance.
 *
 * During prerender builds (IS_PRERENDER_BUILD === "true"), if the database
 * is unavailable (connection or aggregate error), returns empty notes and
 * projects so the build succeeds; at runtime the error is rethrown.
 */
export async function getHomepageData(): Promise<{
  notes: RecentNote[];
  projects: FeaturedProject[];
}> {
  return withPrerenderFallback(
    () =>
      Promise.all([
        sql<RecentNote[]>`
          SELECT id, title, slug, tags, updated_at
          FROM pages
          WHERE published = true
            AND slug != 'about'
            ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
          ORDER BY updated_at DESC
          LIMIT 3
        `,
        sql<FeaturedProject[]>`
          SELECT id, title, slug, description, tech_stack, github_url, live_url
          FROM projects
          WHERE published = true
            ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
          ORDER BY updated_at DESC
          LIMIT 3
        `,
      ]).then(([notes, projects]) => ({ notes, projects })),
    { notes: [], projects: [] },
    "[getHomepageData] DB unavailable during prerender build — returning empty notes and projects."
  );
}
