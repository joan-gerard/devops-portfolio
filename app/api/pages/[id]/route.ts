import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
  } catch (error) {
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

  try {
    const body = await request.json();
    const { title, slug, content, tags, published } = body;

    const [page] = await sql`
      UPDATE pages SET
        title     = COALESCE(${title ?? null}},     title),
        slug      = COALESCE(${slug ?? null}},      slug),
        content   = COALESCE(${content ?? null}},   content),
        tags      = COALESCE(${tags ?? null}},      tags),
        published = COALESCE(${published ?? null}}, published)
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
  } catch (error) {
    console.error("DELETE /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
