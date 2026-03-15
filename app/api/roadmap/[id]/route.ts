import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * PATCH /api/roadmap/[id]
 * Protected — admin only.
 * Accepts any combination of: status, position_x, position_y.
 * completed_at is managed automatically:
 *   - set to NOW() when status transitions to 'completed'
 *   - cleared to NULL when status transitions away from 'completed'
 *
 * @returns The updated roadmap item as JSON on success; on failure returns a JSON error with 400 (invalid body), 401 (unauthorised), 404 (not found), or 500.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { status, position_x, position_y } = body as {
    status?: string;
    position_x?: number;
    position_y?: number;
  };

  const allowedStatus = new Set(["not_started", "in_progress", "completed"]);
  if (status !== undefined && !allowedStatus.has(status)) {
    return NextResponse.json(
      { error: "Invalid status. Allowed: not_started, in_progress, completed" },
      { status: 400 }
    );
  }
  if (position_x !== undefined && typeof position_x !== "number") {
    return NextResponse.json({ error: "position_x must be a number" }, { status: 400 });
  }
  if (position_y !== undefined && typeof position_y !== "number") {
    return NextResponse.json({ error: "position_y must be a number" }, { status: 400 });
  }

  try {
    const rows = await sql`
      UPDATE roadmap_items
      SET
        status     = COALESCE(${status ?? null}, status),
        position_x = COALESCE(${position_x ?? null}, position_x),
        position_y = COALESCE(${position_y ?? null}, position_y),
        completed_at = CASE
          WHEN ${status ?? null} = 'completed'  THEN NOW()
          WHEN ${status ?? null} IS NOT NULL     THEN NULL
          ELSE completed_at
        END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING
        id, title, description, type, status,
        position_x, position_y,
        linked_page_id, completed_at,
        created_at, updated_at
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "PATCH /api/roadmap/[id]",
      notFoundMessage: "Roadmap item not found",
      serverErrorMessage: "Failed to update roadmap item",
    });
  }
}
