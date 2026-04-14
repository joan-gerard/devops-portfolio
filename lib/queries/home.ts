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
        sql<RecentNote>`
          SELECT
            p.id,
            p.title,
            p.slug,
            p.summary,
            p.tags,
            p.updated_at,
            r.status AS roadmap_item_status
          FROM pages p
          LEFT JOIN LATERAL (
            SELECT status
            FROM roadmap_items
            WHERE linked_page_id = p.id
            ORDER BY updated_at DESC, id DESC
            LIMIT 1
          ) r ON true
          WHERE published = true
            AND slug != 'about'
            ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
          ORDER BY p.updated_at DESC
          LIMIT 3
        `,
        sql<FeaturedProject>`
          SELECT
            p.id,
            p.title,
            p.slug,
            p.summary,
            p.description,
            p.tech_stack,
            p.github_url,
            p.live_url,
            p.updated_at,
            r.status AS roadmap_item_status
          FROM projects p
          LEFT JOIN LATERAL (
            SELECT status
            FROM roadmap_items
            WHERE linked_page_id = p.id
            ORDER BY updated_at DESC, id DESC
            LIMIT 1
          ) r ON true
          WHERE published = true
            ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
          ORDER BY p.updated_at DESC
          LIMIT 3
        `,
      ]).then(([notes, projects]) => ({ notes, projects })),
    { notes: [], projects: [] },
    "[getHomepageData] DB unavailable during prerender build — returning empty notes and projects."
  );
}
