import { NotesPageClient } from "@/components/public";
import { PageContainer } from "@/components/public/PageContainer";
import { PageHeader } from "@/components/public/PageHeader";
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
    <PageContainer>
      <PageHeader
        label="Notes"
        heading="What I've been learning"
        description="Notes written while working through my DevOps course — covering infrastructure, security, tooling, and everything in between."
      />
      <NotesPageClient notes={notes} allTags={allTags} />
    </PageContainer>
  );
}
