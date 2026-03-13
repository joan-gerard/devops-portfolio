import { NoteDetail } from "@/components/notes/NoteDetail";
import { getNoteBySlug } from "@/lib/queries/page";
import { notFound } from "next/navigation";

/**
 * E2E (E2E_TEST=1): force-dynamic so newly published notes are visible immediately in tests.
 * Production: ISR (revalidate 3600) so a Neon cold start serves a cached snapshot instead of an empty page.
 */
export const dynamic = process.env.E2E_TEST ? "force-dynamic" : undefined;
export const revalidate = process.env.E2E_TEST ? undefined : 3600;

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
