import sql from "@/lib/db";
import { withPrerenderFallback } from "@/lib/db-errors";
import type { Project, PublicProject } from "@/types/projects";
import { cache } from "react";

const isE2ETestRuntime = process.env.E2E_TEST === "1";

export async function getAllProjects() {
  return sql<Project[]>`
    SELECT id, title, slug, description, tech_stack, github_url, live_url, published, created_at, updated_at, e2e_only
    FROM projects
    ORDER BY updated_at DESC
  `;
}

/**
 * Shape returned for public listing (no admin-only fields).
 * Used by the public projects page and by homepage featured projects.
 */
export type PublishedProject = Pick<
  Project,
  "id" | "title" | "slug" | "description" | "tech_stack" | "github_url" | "live_url"
>;

/**
 * Fetches all published projects for public listing.
 *
 * During prerender builds (`IS_PRERENDER_BUILD === "true"`), if the database
 * is temporarily unavailable (connection or aggregate error), logs a warning
 * and returns an empty list instead of failing the build. For all other
 * errors or at runtime, the original error is rethrown.
 */
export async function getAllPublishedProjects(): Promise<PublishedProject[]> {
  return withPrerenderFallback<PublishedProject[]>(
    () =>
      sql<PublishedProject[]>`
        SELECT id, title, slug, description, tech_stack, github_url, live_url
        FROM projects
        WHERE published = true
          ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
        ORDER BY updated_at DESC
      `,
    [],
    "[getAllPublishedProjects] DB unavailable during prerender build — returning empty list."
  );
}

export async function getProjectById(id: string) {
  const [project] = await sql`
    SELECT * FROM projects WHERE id = ${id}
  `;
  return project ?? null;
}

export const getProjectBySlug = cache(async (slug: string): Promise<PublicProject | null> => {
  const rows = await sql<PublicProject[]>`
    SELECT id, title, slug, description, tech_stack, github_url, live_url, updated_at
    FROM projects
    WHERE slug = ${slug}
      AND published = true
      ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
    LIMIT 1
  `;
  return rows[0] ?? null;
});
