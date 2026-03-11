import { NotesPageClient, NotesPageHeader } from "@/components/public";
import { getAllPublishedNotes } from "@/lib/queries/page";

export const revalidate = 3600;

export const metadata = {
  title: "Notes — DevOps Learning Portal",
};

export default async function NotesPage() {
  const notes = await getAllPublishedNotes();

  // Build sorted, deduplicated tag list from all published notes.
  // Done server-side so the client component receives a stable array.
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort();

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <NotesPageHeader />
      <NotesPageClient notes={notes} allTags={allTags} />
    </div>
  );
}
