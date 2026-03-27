import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NoteDetail } from "@/components/notes/NoteDetail";
import { getAllPublishedNotes, getNoteBySlug } from "@/lib/queries/page";
import { getRelatedNotesByTagOverlap } from "@/lib/relatedNotes";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

type NotePreviewPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NotePreviewPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { slug } = await params;
  const note = await getNoteBySlug(slug, { includeUnpublished: true });
  if (!note) return {};

  return {
    title: `${note.title} (Preview) — DevOps Learning Portal`,
  };
}

export default async function NotePreviewPage({ params }: NotePreviewPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { slug } = await params;
  const [note, allPublishedNotes] = await Promise.all([
    getNoteBySlug(slug, { includeUnpublished: true }),
    getAllPublishedNotes(),
  ]);
  if (!note) notFound();

  const candidates = allPublishedNotes.filter((n) => n.slug !== note.slug);
  const relatedNotes = getRelatedNotesByTagOverlap(note, candidates, 5);

  return (
    <NoteDetail
      note={note}
      relatedNotes={relatedNotes}
      backHref={`/admin/editor/${note.id}`}
      backLabel="← Editor"
    />
  );
}
