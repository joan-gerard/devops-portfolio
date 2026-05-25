import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import { parseJsonObject } from "@/lib/api/json";
import {
  type RoadmapEdgeCreatePayload,
  validateRoadmapEdgePayload,
} from "@/lib/api/roadmap-validation";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/roadmap/edges
 * Protected. Creates a directed dependency edge: source → target.
 * The DB enforces no self-loops and no duplicate edges via constraints.
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

  const payload = validateRoadmapEdgePayload(json);
  if (payload instanceof NextResponse) {
    return payload;
  }

  const { source_id, target_id, source_handle, target_handle }: RoadmapEdgeCreatePayload = payload;

  try {
    const rows = await sql`
      INSERT INTO roadmap_edges (source_id, target_id, source_handle, target_handle)
      VALUES (${source_id}, ${target_id}, ${source_handle ?? null}, ${target_handle ?? null})
      RETURNING id, source_id, target_id, source_handle, target_handle, created_at
    `;
    revalidatePath("/roadmap");

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "POST /api/roadmap/edges",
      notFoundMessage: "Failed to create edge",
      conflictMessage: "Edge already exists",
      serverErrorMessage: "Failed to create edge",
    });
  }
}
