import { NoteDetail } from "@/components/notes/NoteDetail";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllPublishedNotes, getNoteBySlug } from "@/lib/queries/page";
import { getRelatedNotesByTagOverlap } from "@/lib/relatedNotes";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

/**
 * ISR (revalidate 60) so a Neon cold start serves a cached snapshot instead of an empty page.
 * In dev (next dev), Next.js renders on-demand and does not cache, so E2E still sees new content immediately.
 * Segment config must be static; conditional dynamic/revalidate is not supported.
 */
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const note = await getNoteBySlug(slug, { includeUnpublished: !!session });
  if (!note) return {};
  return {
    title: `${note.title} — DevOps Learning Portal`,
  };
}

/**
 * Note detail page. Unauthenticated users can only access published notes.
 * Authenticated admins can also access unpublished notes by slug.
 */
export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const [note, allPublishedNotes] = await Promise.all([
    getNoteBySlug(slug, { includeUnpublished: !!session }),
    getAllPublishedNotes(),
  ]);
  if (!note) notFound();

  const candidates = allPublishedNotes.filter((n) => n.slug !== note.slug);

  const relatedNotes = getRelatedNotesByTagOverlap(note, candidates, 5);

  return <NoteDetail note={note} relatedNotes={relatedNotes} />;
}
