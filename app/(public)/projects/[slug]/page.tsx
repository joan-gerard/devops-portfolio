// app/(public)/projects/[slug]/page.tsx

import { getProjectBySlug } from "@/lib/queries/project";
import { ProjectDetail } from "@/components/public/projects/ProjectDetail";
import { notFound } from "next/navigation";

/**
 * E2E (E2E_TEST=1): force-dynamic so newly published projects are visible immediately in tests.
 * Production: ISR (revalidate 3600) so a Neon cold start serves a cached snapshot instead of an empty page.
 */
export const dynamic = process.env.E2E_TEST ? "force-dynamic" : undefined;
export const revalidate = process.env.E2E_TEST ? undefined : 3600;

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
