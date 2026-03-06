import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import { getSlugValidationError, normalizeSlug } from "@/lib/validateSlug";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/pages — fetch all notes
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session;

    const pages = isAuthenticated
      ? await sql`
          SELECT id, title, slug, tags, published, created_at, updated_at
          FROM pages
          ORDER BY updated_at DESC
        `
      : await sql`
          SELECT id, title, slug, tags, published, created_at, updated_at
          FROM pages
          WHERE published = true
          ORDER BY updated_at DESC
        `;

    return NextResponse.json(pages);
  } catch (error) {
    console.error("GET /api/pages error:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}
// POST /api/pages — create a new note (authenticated only)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title = "Untitled", slug, tags = [] } = body;

    const normalizedSlug = typeof slug === "string" ? normalizeSlug(slug) : "";
    const slugError = getSlugValidationError(normalizedSlug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const [page] = await sql`
      INSERT INTO pages (title, slug, tags)
      VALUES (${title}, ${normalizedSlug}, ${tags})
      RETURNING *
    `;
    return NextResponse.json(page, { status: 201 });
  } catch (error: unknown) {
    // Catch duplicate slug (PostgreSQL unique violation)
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    if (code === "23505") {
      return NextResponse.json({ error: "A note with this slug already exists" }, { status: 409 });
    }
    console.error("POST /api/pages error:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
