import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/pages — fetch all notes
export async function GET() {
  try {
    const pages = await sql`
      SELECT 
        id,
        title,
        slug,
        tags,
        published,
        created_at,
        updated_at
      FROM pages
      ORDER BY updated_at DESC
    `;
    return NextResponse.json(pages);
  } catch (error) {
    console.error("GET /api/pages error:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

// POST /api/pages — create a new note
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title = "Untitled", slug, tags = [] } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const [page] = await sql`
      INSERT INTO pages (title, slug, tags)
      VALUES (${title}, ${slug}, ${tags})
      RETURNING *
    `;
    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    // Catch duplicate slug
    if (error.code === "23505") {
      return NextResponse.json({ error: "A note with this slug already exists" }, { status: 409 });
    }
    console.error("POST /api/pages error:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
