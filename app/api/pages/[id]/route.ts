import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { JSONValue } from "postgres";

// GET /api/pages/[id] — fetch a single note
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const [page] = isAdmin
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
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;

    if (code === "22P02") {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    console.error("GET /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// PATCH /api/pages/[id] — update a note (admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
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

  try {
    const [page] = await sql`
      UPDATE pages SET
        title     = COALESCE(${title ?? null},     title),
        slug      = COALESCE(${slug ?? null},      slug),
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
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;

    if (code === "22P02") {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    if (code === "23505") {
      return NextResponse.json({ error: "A note with this slug already exists" }, { status: 409 });
    }
    console.error("PATCH /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// DELETE /api/pages/[id] — delete a note (admin only)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
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
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;

    if (code === "22P02") {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    console.error("DELETE /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
