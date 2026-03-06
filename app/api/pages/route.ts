import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import { getSlugValidationError, normalizeSlug } from "@/lib/validateSlug";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Fetches pages and returns them as JSON; authenticated requests receive all pages, unauthenticated requests receive only published pages.
 *
 * @returns A JSON array of page objects containing `id`, `title`, `slug`, `tags`, `published`, `created_at`, and `updated_at`; on failure returns a JSON error object and a 500 status.
 */
export async function GET() {
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
/**
 * Create a new page from the request body for an authenticated user.
 *
 * Uses `title` (defaults to "Untitled"), `slug`, and `tags` (defaults to []) from the JSON request body. The provided `slug` is normalized and validated before insertion.
 *
 * @returns On success, the created page object as JSON with status 201. On failure, a JSON error with one of:
 * - 401 when the request is unauthenticated,
 * - 400 when the slug is invalid,
 * - 409 when a page with the same slug already exists,
 * - 500 for other server errors.
 */
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
