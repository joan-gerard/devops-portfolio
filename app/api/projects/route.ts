import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import { getSlugValidationError, normalizeSlug } from "@/lib/validateSlug";
import { isAllowedProjectUrlScheme, normalizeProjectUrl } from "@/lib/validateProjectUrl";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/projects
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    const projects = isAdmin
      ? await sql`
          SELECT id, title, slug, description, tech_stack, github_url, live_url, published, updated_at
          FROM projects
          ORDER BY updated_at DESC
        `
      : await sql`
          SELECT id, title, slug, description, tech_stack, github_url, live_url, published, updated_at
          FROM projects
          WHERE published = true
          ORDER BY updated_at DESC
        `;

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const {
    title = "Untitled Project",
    slug,
    description = "",
    tech_stack = [],
    github_url = null,
    live_url = null,
  } = body as {
    title?: string;
    slug: string;
    description?: string;
    tech_stack?: string[];
    github_url?: string | null;
    live_url?: string | null;
  };

  const normalizedSlug = typeof slug === "string" ? normalizeSlug(slug) : "";
  const slugError = getSlugValidationError(normalizedSlug);
  if (slugError) {
    return NextResponse.json({ error: slugError }, { status: 400 });
  }

  const normalizedGithubUrl = normalizeProjectUrl(github_url);
  const normalizedLiveUrl = normalizeProjectUrl(live_url);
  if (
    (normalizedGithubUrl !== null && !isAllowedProjectUrlScheme(normalizedGithubUrl)) ||
    (normalizedLiveUrl !== null && !isAllowedProjectUrlScheme(normalizedLiveUrl))
  ) {
    return NextResponse.json(
      { error: "github_url and live_url must use http or https scheme" },
      { status: 400 }
    );
  }

  try {
    const [project] = await sql`
      INSERT INTO projects (title, slug, description, tech_stack, github_url, live_url)
      VALUES (${title}, ${normalizedSlug}, ${description}, ${tech_stack}, ${normalizedGithubUrl}, ${normalizedLiveUrl})
      RETURNING *
    `;
    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    if (code === "23505") {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
