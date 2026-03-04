import sql from "@/lib/db";
import type { Project } from "@/types/projects";

export async function getAllProjects() {
  return sql<Project[]>`
    SELECT id, title, slug, description, tech_stack, github_url, live_url, published, created_at, updated_at
    FROM projects
    ORDER BY updated_at DESC
  `;
}

export async function getAllPublishedProjects() {
  return sql`
    SELECT id, title, slug, description, tech_stack, github_url, live_url, published, updated_at
    FROM projects
    WHERE published = true
    ORDER BY updated_at DESC
  `;
}

export async function getProjectById(id: string) {
  const [project] = await sql`
    SELECT * FROM projects WHERE id = ${id}
  `;
  return project ?? null;
}

export async function getProjectBySlug(slug: string) {
  const [project] = await sql`
    SELECT * FROM projects WHERE slug = ${slug} AND published = true
  `;
  return project ?? null;
}
