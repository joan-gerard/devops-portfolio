import sql from "@/lib/db";
import { isConnectionErrorOrAggregate } from "@/lib/db-errors";
import type { Project } from "@/types/projects";

export async function getAllProjects() {
  return sql<Project[]>`
    SELECT id, title, slug, description, tech_stack, github_url, live_url, published, created_at, updated_at
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
 * is temporarily unavailable (connection or aggregate error), the catch block
 * logs a warning and returns an empty list instead of failing the build.
 * For all other errors or at runtime, the original error is rethrown.
 */
export async function getAllPublishedProjects(): Promise<PublishedProject[]> {
  try {
    return await sql<PublishedProject[]>`
      SELECT id, title, slug, description, tech_stack, github_url, live_url
      FROM projects
      WHERE published = true
      ORDER BY updated_at DESC
    `;
  } catch (error) {
    const isPrerenderBuild = process.env.IS_PRERENDER_BUILD === "true";
    if (isPrerenderBuild && isConnectionErrorOrAggregate(error)) {
      const summary =
        error instanceof Error ? error.message.slice(0, 120) : String(error).slice(0, 120);
      console.warn(
        "[getAllPublishedProjects] DB unavailable during prerender build — returning empty list.",
        `Reason: ${summary}`
      );
      return [];
    }
    throw error;
  }
}

export async function getProjectById(id: string) {
  const [project] = await sql`
    SELECT * FROM projects WHERE id = ${id}
  `;
  return project ?? null;
}

export async function getProjectBySlug(slug: string) {
  const [project] = await sql`
    SELECT * FROM projects WHERE slug = ${slug} AND published = true
  `;
  return project ?? null;
}
