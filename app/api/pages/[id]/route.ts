import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import sql from "@/lib/db";
import { getSlugValidationError, normalizeSlug } from "@/lib/validateSlug";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { JSONValue } from "postgres";

/**
 * Fetches a page by ID, returning unpublished pages only to authenticated users.
 *
 * @returns The page object as JSON when found, or a JSON error object `{ error: "Page not found" }` with a 404 status when no page exists.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session;

    const [page] = isAuthenticated
      ? await sql`
          SELECT * FROM pages WHERE id = ${id}
        `
      : await sql`
          SELECT * FROM pages WHERE id = ${id} AND published = true
        `;

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "GET /api/pages/[id]",
      notFoundMessage: "Page not found",
      serverErrorMessage: "Failed to fetch page",
    });
  }
}

/**
 * Update a page identified by the route `id` with fields from the JSON request body.
 *
 * Validates authentication and request JSON, optionally normalizes and validates `slug`,
 * and applies partial updates (keeps existing values when fields are omitted).
 *
 * @param params - Route params object containing `id` of the page to update
 * @returns A NextResponse containing the updated page object on success, or a JSON error object describing the failure
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { title, slug, content, tags, published } = body as {
    title?: string;
    slug?: string;
    content?: Record<string, unknown>;
    tags?: string[];
    published?: boolean;
  };

  const slugToWrite = slug !== undefined && slug !== null ? normalizeSlug(String(slug)) : undefined;
  if (slugToWrite !== undefined) {
    const slugError = getSlugValidationError(slugToWrite);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }
  }

  try {
    const [page] = await sql`
      UPDATE pages SET
        title     = COALESCE(${title ?? null},     title),
        slug      = COALESCE(${slugToWrite ?? null}, slug),
        content   = COALESCE(${content ? sql.json(content as JSONValue) : null}, content),
        tags      = COALESCE(${tags ?? null},      tags),
        published = COALESCE(${published ?? null}, published)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "PATCH /api/pages/[id]",
      notFoundMessage: "Page not found",
      conflictMessage: "A note with this slug already exists",
      serverErrorMessage: "Failed to update page",
    });
  }
}

/**
 * Deletes the page identified by the route `id` and returns a JSON response indicating the outcome.
 *
 * @param params - A promise that resolves to the route parameters object containing `id` (the page id to delete)
 * @returns A JSON response:
 * - `{ deleted: true, id }` when the page was deleted
 * - `{ error: "Unauthorised" }` with HTTP 401 when the request is not authenticated
 * - `{ error: "Page not found" }` with HTTP 404 when no page exists with the given `id`
 * - a database error response produced by `handleDbError` for other server-side/database failures
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const [deleted] = await sql`
      DELETE FROM pages
      WHERE id = ${id}
      RETURNING id
    `;
    if (!deleted) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id });
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "DELETE /api/pages/[id]",
      notFoundMessage: "Page not found",
      serverErrorMessage: "Failed to delete page",
    });
  }
}
