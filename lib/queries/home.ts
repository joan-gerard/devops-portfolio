import sql from "@/lib/db";
import type { FeaturedProject, RecentNote } from "@/types/home";

const isE2ETestRuntime = process.env.E2E_TEST === "1";

/**
 * Fetches data for the public homepage: recent notes and featured projects.
 * Runs both queries in parallel for better performance.
 */
export async function getHomepageData(): Promise<{
  notes: RecentNote[];
  projects: FeaturedProject[];
}> {
  const [notes, projects] = await Promise.all([
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
  ]);
  return { notes, projects };
}
