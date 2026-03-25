import { NotesPageClient } from "@/components/public";
import { PageContainer } from "@/components/public/PageContainer";
import { PageHeader } from "@/components/public/PageHeader";
import { getAllPublishedNotes } from "@/lib/queries/page";

export const revalidate = 60;

export const metadata = {
  title: "Notes — DevOps Learning Portal",
};

export default async function NotesPage() {
  const notes = await getAllPublishedNotes();

  // Build sorted tag counts from all published notes.
  // Done server-side so the client component receives a stable array.
  const tagCountMap = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
    }
  }

  const tagCounts = Array.from(tagCountMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, count]) => ({ tag, count }));

  return (
    <PageContainer>
      <PageHeader
        label="Notes"
        heading="What I've been learning"
        description="Notes written while working through my DevOps course — covering infrastructure, security, tooling, and everything in between."
      />
      <NotesPageClient notes={notes} tagCounts={tagCounts} />
    </PageContainer>
  );
}
