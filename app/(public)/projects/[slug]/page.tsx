// app/(public)/projects/[slug]/page.tsx

import { getProjectBySlug } from "@/lib/queries/project";
import { ProjectDetail } from "@/components/public/projects/ProjectDetail";
import { notFound } from "next/navigation";

// Force dynamic so newly published projects are visible immediately (no stale 404 from cache).
export const dynamic = "force-dynamic";

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
