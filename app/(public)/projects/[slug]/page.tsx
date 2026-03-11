// app/(public)/projects/[slug]/page.tsx

import { getProjectBySlug } from "@/lib/queries/project";
import { ProjectDetail } from "@/components/public/projects/ProjectDetail";
import { notFound } from "next/navigation";

// ── ISR — regenerate at most once per hour ─────────────────────────────────────
// generateStaticParams intentionally omitted — ISR on-demand is sufficient for
// portfolio scale. No slugs are pre-built; the first real request after
// deployment triggers regeneration.
export const revalidate = 3600;

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
