import { NoteDetail } from "@/components/notes/NoteDetail";
import { getAllPublishedNotes, getNoteBySlug } from "@/lib/queries/page";
import { getRelatedNotesByTagOverlap } from "@/lib/relatedNotes";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const notes = await getAllPublishedNotes();
  return notes.map(({ slug }) => ({ slug }));
}

/**
 * ISR (revalidate 60) so a Neon cold start serves a cached snapshot instead of an empty page.
 * In dev (next dev), Next.js renders on-demand and does not cache, so E2E still sees new content immediately.
 * Segment config must be static; conditional dynamic/revalidate is not supported.
 */
export const revalidate = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug, { includeUnpublished: false });
  if (!note) return {};
  return {
    title: `${note.title} — DevOps Learning Portal`,
  };
}

/**
 * Public note detail page. Anonymous users can only access published notes.
 * Draft previews are served via an authenticated admin preview route.
 */
export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [note, allPublishedNotes] = await Promise.all([
    getNoteBySlug(slug, { includeUnpublished: false }),
    getAllPublishedNotes(),
  ]);
  if (!note) notFound();

  const candidates = allPublishedNotes.filter((n) => n.slug !== note.slug);

  const relatedNotes = getRelatedNotesByTagOverlap(note, candidates, 5);

  return <NoteDetail note={note} relatedNotes={relatedNotes} />;
}
