import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/pages/[id] — fetch a single note
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [page] = await sql`
      SELECT * FROM pages
      WHERE id = ${params.id}
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

// PATCH /api/pages/[id] — update a note
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, content, tags, published } = body;

    const [page] = await sql`
      UPDATE pages SET
        title     = COALESCE(${title},     title),
        slug      = COALESCE(${slug},      slug),
        content   = COALESCE(${content},   content),
        tags      = COALESCE(${tags},      tags),
        published = COALESCE(${published}, published)
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A note with this slug already exists" }, { status: 409 });
    }
    console.error("PATCH /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// DELETE /api/pages/[id] — delete a note
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const [deleted] = await sql`
      DELETE FROM pages
      WHERE id = ${params.id}
      RETURNING id
    `;
    if (!deleted) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id: params.id });
  } catch (error) {
    console.error("DELETE /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
