import { handleDbError } from "@/lib/api/postgres-errors";
import sql from "@/lib/db";
import { RoadmapEdge, RoadmapItem } from "@/types/roadmap";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/roadmap
 * Public — no auth required. Returns all roadmap items and edges.
 * The client (React Flow canvas) is responsible for mapping to node/edge format.
 *
 * @returns A JSON object with `items` and `edges` arrays; on failure returns a JSON error object and status 500.
 */
export async function GET() {
  try {
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
        SELECT id, source_id, target_id, source_handle, target_handle, created_at
        FROM roadmap_edges
        ORDER BY created_at ASC
      `,
    ]);

    return NextResponse.json({ items, edges });
  } catch (error) {
    console.error("GET /api/roadmap error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}

/**
 * POST /api/roadmap
 * Protected. Creates a new roadmap node.
 * title is required. All other fields default at the DB level.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { title, description, type, status, position_x, position_y } = body as {
    title?: string;
    description?: string;
    type?: string;
    status?: string;
    position_x?: number;
    position_y?: number;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const rows = await sql`
      INSERT INTO roadmap_items (title, description, type, status, position_x, position_y)
      VALUES (
        ${title.trim()},
        ${description ?? null},
        ${type ?? "learning"},
        ${status ?? "not_started"},
        ${position_x ?? 0},
        ${position_y ?? 0}
      )
      RETURNING
        id, title, description, type, status,
        position_x, position_y,
        linked_page_id, completed_at,
        created_at, updated_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "POST /api/roadmap",
      notFoundMessage: "Failed to create roadmap item",
      serverErrorMessage: "Failed to create roadmap item",
    });
  }
}
