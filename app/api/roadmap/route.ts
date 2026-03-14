import sql from "@/lib/db";
import { RoadmapEdge, RoadmapItem } from "@/types/roadmap";
import { NextResponse } from "next/server";

/**
 * GET /api/roadmap
 * Public — no auth required. Returns all roadmap items and edges.
 * The client (React Flow canvas) is responsible for mapping to node/edge format.
 */
export async function GET() {
  const [items, edges] = await Promise.all([
    sql<RoadmapItem[]>`
      SELECT
        id, title, description, type, status,
        position_x, position_y,
        linked_page_id, completed_at,
        created_at, updated_at
      FROM roadmap_items
      ORDER BY created_at ASC
    `,
    sql<RoadmapEdge[]>`
      SELECT id, source_id, target_id, created_at
      FROM roadmap_edges
      ORDER BY created_at ASC
    `,
  ]);

  return NextResponse.json({ items, edges });
}
