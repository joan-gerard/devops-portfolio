import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * PATCH /api/roadmap/[id]
 * Protected — admin only.
 * Accepts any combination of: status, position_x, position_y.
 * completed_at is managed automatically:
 *   - set to NOW() when status transitions to 'completed'
 *   - cleared to NULL when status transitions away from 'completed'
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { status, position_x, position_y } = body;

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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
