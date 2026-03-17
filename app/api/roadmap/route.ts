import { handleDbError } from "@/lib/api/postgres-errors";
import { parseJsonObject } from "@/lib/api/json";
import {
  validateRoadmapNodeCreatePayload,
  type RoadmapNodeCreatePayload,
} from "@/lib/api/roadmap-validation";
import { getRoadmapData } from "@/lib/queries/roadmap";
import sql from "@/lib/db";
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
    const data = await getRoadmapData();
    return NextResponse.json(data);
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

  const json = await parseJsonObject(request);
  if (json instanceof NextResponse) {
    return json;
  }

  const payload = validateRoadmapNodeCreatePayload(json);
  if (payload instanceof NextResponse) {
    return payload;
  }

  const { title, description, type, status, position_x, position_y }: RoadmapNodeCreatePayload =
    payload;

  try {
    const isE2ETestRuntime = process.env.E2E_TEST === "1";
    const rows = await sql`
      INSERT INTO roadmap_items (title, description, type, status, position_x, position_y, e2e_only)
      VALUES (
        ${title},
        ${description ?? null},
        ${type},
        ${status ?? "not_started"},
        ${position_x ?? 0},
        ${position_y ?? 0},
        ${isE2ETestRuntime}
      )
      RETURNING
        id, title, description, type, status,
        position_x, position_y,
        is_group_completed,
        linked_page_id, completed_at,
        created_at, updated_at,
        e2e_only
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
