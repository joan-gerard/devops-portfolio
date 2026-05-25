// app/(public)/projects/[slug]/page.tsx

import { ProjectDetail } from "@/components/public/projects/ProjectDetail";
import { getAllPublishedProjects, getProjectBySlug } from "@/lib/queries/project";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  try {
    const projects = await getAllPublishedProjects();
    return projects.map(({ slug }) => ({ slug }));
  } catch {
    // DB unavailable at build time — fall back to on-demand ISR for all slugs.
    return [];
  }
}

/**
 * ISR (revalidate 3600) so a Neon cold start serves a cached snapshot instead of an empty page.
 * In dev (next dev), Next.js renders on-demand and does not cache, so E2E still sees new content immediately.
 * Segment config must be static; conditional dynamic/revalidate is not supported.
 */
export const revalidate = false;

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — DevOps Learning Portal`,
    description: project.description ?? undefined,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // getProjectBySlug filters published = true.
  // Both "not found" and "not published" return null → 404.
  // We don't leak the existence of unpublished projects.
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
