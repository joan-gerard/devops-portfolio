import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleDbError } from "@/lib/api/postgres-errors";
import sql from "@/lib/db";
import { isAllowedProjectUrlScheme, normalizeProjectUrl } from "@/lib/validateProjectUrl";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/projects/[id]
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = !!session;

    const [project] = isAdmin
      ? await sql`SELECT * FROM projects WHERE id = ${id}`
      : await sql`SELECT * FROM projects WHERE id = ${id} AND published = true`;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "GET /api/projects/[id]",
      notFoundMessage: "Project not found",
      serverErrorMessage: "Failed to fetch project",
    });
  }
}

// PATCH /api/projects/[id]
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { title, slug, description, tech_stack, github_url, live_url, published } = body as {
    title?: string;
    slug?: string;
    description?: string;
    tech_stack?: string[];
    github_url?: string | null;
    live_url?: string | null;
    published?: boolean;
  };

  const normalizedGithubUrl =
    github_url !== undefined ? normalizeProjectUrl(github_url) : undefined;
  const normalizedLiveUrl = live_url !== undefined ? normalizeProjectUrl(live_url) : undefined;
  if (
    (normalizedGithubUrl !== undefined &&
      normalizedGithubUrl !== null &&
      !isAllowedProjectUrlScheme(normalizedGithubUrl)) ||
    (normalizedLiveUrl !== undefined &&
      normalizedLiveUrl !== null &&
      !isAllowedProjectUrlScheme(normalizedLiveUrl))
  ) {
    return NextResponse.json(
      { error: "github_url and live_url must use http or https scheme" },
      { status: 400 }
    );
  }

  try {
    const [project] = await sql`
      UPDATE projects SET
        title       = COALESCE(${title ?? null},       title),
        slug        = COALESCE(${slug ?? null},        slug),
        description = COALESCE(${description ?? null}, description),
        tech_stack  = COALESCE(${tech_stack ?? null},  tech_stack),
        github_url  = COALESCE(${normalizedGithubUrl ?? null},  github_url),
        live_url    = COALESCE(${normalizedLiveUrl ?? null},    live_url),
        published   = COALESCE(${published ?? null},   published)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "PATCH /api/projects/[id]",
      notFoundMessage: "Project not found",
      conflictMessage: "A project with this slug already exists",
      serverErrorMessage: "Failed to update project",
    });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deleted] = await sql`
      DELETE FROM projects
      WHERE id = ${id}
      RETURNING id
    `;
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id });
  } catch (error: unknown) {
    return handleDbError(error, {
      logLabel: "DELETE /api/projects/[id]",
      notFoundMessage: "Project not found",
      serverErrorMessage: "Failed to delete project",
    });
  }
}
