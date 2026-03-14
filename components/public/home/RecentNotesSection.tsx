import type { RecentNote } from "@/types/home";
import { HomeSection } from "./HomeSection";
import { NoteCard } from "./NoteCard";

const notesGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "12px",
};

type RecentNotesSectionProps = { notes: RecentNote[] };

export function RecentNotesSection({ notes }: RecentNotesSectionProps) {
  return (
    <HomeSection
      label="Recent Notes"
      heading="What I've been writing"
      emptyMessage="No notes published yet."
      viewAllHref="/notes"
      viewAllLabel="All notes →"
    >
      {notes.length > 0 ? (
        <div style={notesGridStyle}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : null}
    </HomeSection>
  );
}
