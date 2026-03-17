import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import { parseJsonObject } from "@/lib/api/json";
import {
  type RoadmapNodePatchPayload,
  validateRoadmapNodePatchPayload,
} from "@/lib/api/roadmap-validation";
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

  const json = await parseJsonObject(request);
  if (json instanceof NextResponse) {
    return json;
  }

  const payload = validateRoadmapNodePatchPayload(json);
  if (payload instanceof NextResponse) {
    return payload;
  }

  const {
    status,
    position_x,
    position_y,
    title,
    description,
    type,
    linked_page_id,
    is_group_completed,
    hasLinkedPageIdField,
    hasIsGroupCompletedField,
  }: RoadmapNodePatchPayload = payload;

  try {
    const rows = await sql`
    WITH updated AS (
      UPDATE roadmap_items
      SET
        title          = COALESCE(${title ?? null}, title),
        description    = COALESCE(${description ?? null}, description),
        type           = COALESCE(${type ?? null}, type),
        status         = COALESCE(${status ?? null}, status),
        position_x     = COALESCE(${position_x ?? null}, position_x),
        position_y     = COALESCE(${position_y ?? null}, position_y),
        linked_page_id = CASE
          WHEN ${hasLinkedPageIdField} THEN ${linked_page_id ?? null}
          ELSE linked_page_id
        END,
        is_group_completed = CASE
          WHEN ${hasIsGroupCompletedField} THEN COALESCE(${is_group_completed ?? null}, FALSE)
          ELSE is_group_completed
        END,
        completed_at   = CASE
          WHEN (${status ?? null})::text = 'completed' THEN NOW()
          WHEN (${status ?? null})::text IS NOT NULL   THEN NULL
          ELSE completed_at
        END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    )
    SELECT
      u.id,
      u.title,
      u.description,
      u.type,
      u.status,
      u.position_x,
      u.position_y,
      u.is_group_completed,
      u.linked_page_id,
      u.completed_at,
      u.created_at,
      u.updated_at,
      COALESCE(p.slug, pr.slug) AS linked_page_slug
    FROM updated u
    LEFT JOIN pages p ON p.id = u.linked_page_id
    LEFT JOIN projects pr ON pr.id = u.linked_page_id
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

/**
 * DELETE /api/roadmap/[id]
 * Protected. Deletes a roadmap node. Edges cascade via FK constraint.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rows = await sql`
      DELETE FROM roadmap_items WHERE id = ${id} RETURNING id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "DELETE /api/roadmap/[id]",
      notFoundMessage: "Roadmap item not found",
      conflictMessage: "Failed to delete roadmap item",
      serverErrorMessage: "Failed to delete roadmap item",
    });
  }
}
