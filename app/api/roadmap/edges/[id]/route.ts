import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * DELETE /api/roadmap/edges/[id]
 * Protected. Removes a dependency edge by id.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rows = await sql`
      DELETE FROM roadmap_edges WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Edge not found" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "DELETE /api/roadmap/edges/[id]",
      notFoundMessage: "Edge not found",
      conflictMessage: "Failed to delete edge",
      serverErrorMessage: "Failed to delete edge",
    });
  }
}
