"use client";

import { useState } from "react";
import type { PublishedNotePreview } from "@/types/pages";
import { PublicContentCard } from "@/components/public/PublicContentCard";
import { ROADMAP_STATUS_LABEL } from "@/components/roadmap/roadmapStyles";
import styles from "@/components/public/home/HomeCardsGrid.module.css";
import { NotesEmptyState } from "./NotesEmptyState";
import { NotesResultCount } from "./NotesResultCount";
import { NotesTagFilter } from "./NotesTagFilter";

type NotesPageClientProps = {
  notes: PublishedNotePreview[];
  allTags: string[];
};

/**
 * Client-side Notes page: tag filter, note list, empty state, and result count.
 */
export function NotesPageClient({ notes, allTags }: NotesPageClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visible = activeTag === null ? notes : notes.filter((n) => n.tags.includes(activeTag));

  return (
    <>
      <NotesTagFilter allTags={allTags} activeTag={activeTag} onTagChange={setActiveTag} />
      {visible.length === 0 ? (
        <NotesEmptyState activeTag={activeTag} />
      ) : (
        <div className={styles.grid}>
          {visible.map((note) => (
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
      )}
      {activeTag !== null && visible.length > 0 && (
        <NotesResultCount count={visible.length} activeTag={activeTag} />
      )}
    </>
  );
}
