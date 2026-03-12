import { NoteDetail } from "@/components/notes/NoteDetail";
import { getNoteBySlug } from "@/lib/queries/page";
import { notFound } from "next/navigation";

/** Force dynamic so newly published notes are visible immediately (no stale 404 from cache). */
export const dynamic = "force-dynamic";

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
