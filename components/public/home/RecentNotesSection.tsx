import type { RecentNote } from "@/types/home";
import { PublicContentCard } from "@/components/public/PublicContentCard";
import { ROADMAP_STATUS_LABEL } from "@/components/roadmap/roadmapStyles";
import { HomeSection } from "./HomeSection";
import styles from "./HomeCardsGrid.module.css";

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
        <div className={styles.grid}>
          {notes.map((note) => (
            <PublicContentCard
              key={note.id}
              href={`/notes/${note.slug}`}
              ariaLabel={`Open note ${note.title}`}
              title={note.title}
              roadmapStatus={
                note.roadmap_item_status
                  ? ROADMAP_STATUS_LABEL[note.roadmap_item_status]
                  : "Not linked"
              }
              summary={note.summary?.trim() || "Summary coming soon."}
              chips={note.tags.slice(0, 3)}
              updatedAt={note.updated_at}
            />
          ))}
        </div>
      ) : null}
    </HomeSection>
  );
}
