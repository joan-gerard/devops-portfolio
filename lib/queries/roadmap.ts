import sql from "@/lib/db";
import { withPrerenderFallback } from "@/lib/db-errors";
import type { RoadmapDataWithSlug, RoadmapEdge, RoadmapItemWithSlug } from "@/types/roadmap";

const emptyRoadmapData: RoadmapDataWithSlug = { items: [], edges: [] };

const isE2ETestRuntime = process.env.E2E_TEST === "1";

/**
 * Fetches all roadmap items and edges for the public canvas.
 * LEFT JOINs pages to resolve linked_page_id → slug so the client
 * can build /notes/[slug] links without a second query.
 *
 * During prerender builds (IS_PRERENDER_BUILD === "true"), if the database
 * is unavailable (connection or aggregate error), returns empty items and
 * edges so the build succeeds; at runtime the error is rethrown.
 */
export async function getRoadmapData(): Promise<RoadmapDataWithSlug> {
  return withPrerenderFallback<RoadmapDataWithSlug>(
    async () => {
      const [items, edges] = await Promise.all([
        sql<RoadmapItemWithSlug>`
          SELECT
            r.id,
            r.title,
            r.description,
            r.type,
            r.status,
            r.position_x,
            r.position_y,
            r.is_group_completed,
            r.linked_page_id,
            r.completed_at,
            r.created_at,
            r.updated_at,
            r.e2e_only,
            COALESCE(p.slug, pr.slug) AS linked_page_slug,
            CASE
              WHEN p.id IS NOT NULL THEN 'note'
              WHEN pr.id IS NOT NULL THEN 'project'
              ELSE NULL
            END AS linked_page_type
          FROM roadmap_items r
          LEFT JOIN pages p ON p.id = r.linked_page_id
          LEFT JOIN projects pr ON pr.id = r.linked_page_id
          ${isE2ETestRuntime ? sql`` : sql`WHERE r.e2e_only = false`}
          ORDER BY r.created_at ASC
        `,
        sql<RoadmapEdge>`
          SELECT id, source_id, target_id, source_handle, target_handle, created_at
          FROM roadmap_edges
          ORDER BY created_at ASC
        `,
      ]);

      return { items, edges };
    },
    emptyRoadmapData,
    "[getRoadmapData] DB unavailable during prerender build — returning empty items and edges."
  );
}
