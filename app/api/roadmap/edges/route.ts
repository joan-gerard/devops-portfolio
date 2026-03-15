import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { source_id, target_id } = body as {
    source_id?: string;
    target_id?: string;
  };

  if (!source_id || !target_id) {
    return NextResponse.json({ error: "source_id and target_id are required" }, { status: 400 });
  }

  try {
    const rows = await sql`
      INSERT INTO roadmap_edges (source_id, target_id)
      VALUES (${source_id}, ${target_id})
      RETURNING id, source_id, target_id, created_at
    `;
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
