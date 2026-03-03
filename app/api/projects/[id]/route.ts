import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
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
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;

    if (code === "22P02") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
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

  try {
    const [project] = await sql`
      UPDATE projects SET
        title       = COALESCE(${title ?? null},       title),
        slug        = COALESCE(${slug ?? null},        slug),
        description = COALESCE(${description ?? null}, description),
        tech_stack  = COALESCE(${tech_stack ?? null},  tech_stack),
        github_url  = COALESCE(${github_url ?? null},  github_url),
        live_url    = COALESCE(${live_url ?? null},    live_url),
        published   = COALESCE(${published ?? null},   published)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;

    if (code === "22P02") {
      return NextResponse.json(
        { error: "Not found" }, // or 'Project not found' / 'Page not found'
        { status: 404 }
      );
    }

    if (code === "23505") {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }

    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;

    if (code === "22P02") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
