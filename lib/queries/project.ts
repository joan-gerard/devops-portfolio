import sql from "@/lib/db";
import { withPrerenderFallback } from "@/lib/db-errors";
import type { Project, PublicProject } from "@/types/projects";
import { cache } from "react";

const isE2ETestRuntime = process.env.E2E_TEST === "1";

export async function getAllProjects() {
  return sql<Project[]>`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.summary,
      p.description,
      p.tech_stack,
      p.github_url,
      p.live_url,
      p.published,
      p.created_at,
      p.updated_at,
      p.e2e_only,
      r.id AS roadmap_item_id,
      r.status AS roadmap_item_status,
      r.title AS roadmap_item_title
    FROM projects p
    LEFT JOIN LATERAL (
      SELECT id, status, title
      FROM roadmap_items
      WHERE linked_page_id = p.id
      ORDER BY updated_at DESC
      LIMIT 1
    ) r ON true
    ORDER BY p.created_at ASC
  `;
}

/**
 * Shape returned for public listing (no admin-only fields).
 * Used by the public projects page and by homepage featured projects.
 */
export type PublishedProject = Pick<
  Project,
  | "id"
  | "title"
  | "slug"
  | "summary"
  | "description"
  | "tech_stack"
  | "github_url"
  | "live_url"
  | "updated_at"
  | "roadmap_item_status"
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
        WHERE p.published = true
          ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
        ORDER BY p.updated_at DESC
      `,
    [],
    "[getAllPublishedProjects] DB unavailable during prerender build — returning empty list."
  );
}

export async function getProjectById(id: string) {
  const [project] = await sql<Project[]>`
    SELECT
      p.*,
      r.id AS roadmap_item_id,
      r.status AS roadmap_item_status,
      r.title AS roadmap_item_title
    FROM projects p
    LEFT JOIN LATERAL (
      SELECT id, status, title
      FROM roadmap_items
      WHERE linked_page_id = p.id
      ORDER BY updated_at DESC
      LIMIT 1
    ) r ON true
    WHERE p.id = ${id}
  `;
  return project ?? null;
}

export const getProjectBySlug = cache(async (slug: string): Promise<PublicProject | null> => {
  const rows = await sql<PublicProject[]>`
    SELECT id, title, slug, summary, description, tech_stack, github_url, live_url, updated_at
    FROM projects
    WHERE slug = ${slug}
      AND published = true
      ${isE2ETestRuntime ? sql`` : sql`AND e2e_only = false`}
    LIMIT 1
  `;
  return rows[0] ?? null;
});
