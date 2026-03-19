import { NoteDetail } from "@/components/notes/NoteDetail";
import { getNoteBySlug } from "@/lib/queries/page";
import { notFound } from "next/navigation";

/**
 * ISR (revalidate 3600) so a Neon cold start serves a cached snapshot instead of an empty page.
 * In dev (next dev), Next.js renders on-demand and does not cache, so E2E still sees new content immediately.
 * Segment config must be static; conditional dynamic/revalidate is not supported.
 */
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return {};
  return {
    title: `${note.title} — DevOps Learning Portal`,
  };
}

/**
 * Note detail page. Only published notes are returned by getNoteBySlug;
 * both "not found" and "not published" yield 404 (no leak of draft existence).
 */
export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  return <NoteDetail note={note} />;
}
