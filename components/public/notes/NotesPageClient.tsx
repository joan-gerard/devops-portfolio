"use client";

import styles from "@/components/public/home/HomeCardsGrid.module.css";
import { PublicContentCard } from "@/components/public/PublicContentCard";
import { ROADMAP_STATUS_LABEL } from "@/components/roadmap/roadmapStyles";
import type { PublishedNotePreview } from "@/types/pages";
import { useState } from "react";
import { NotesEmptyState } from "./NotesEmptyState";
import { NotesFiltersAside } from "./NotesFiltersAside";
import layoutStyles from "./NotesPageLayout.module.css";
import { NotesTagFilter } from "./NotesTagFilter";

type NotesPageClientProps = {
  notes: PublishedNotePreview[];
  tagCounts: { tag: string; count: number }[];
};

/**
 * Client-side Notes page: tag filter, note list, empty state, and result count.
 */
export function NotesPageClient({ notes, tagCounts }: NotesPageClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visible = activeTag === null ? notes : notes.filter((n) => n.tags.includes(activeTag));

  return (
    <div className={layoutStyles.layout}>
      <aside className={layoutStyles.aside}>
        <NotesFiltersAside tagCounts={tagCounts} activeTag={activeTag} onTagChange={setActiveTag} />
      </aside>

      <main className={layoutStyles.main}>
        <div className={layoutStyles.mobileFilters}>
          <NotesTagFilter tagCounts={tagCounts} activeTag={activeTag} onTagChange={setActiveTag} />
        </div>

        {visible.length === 0 ? (
          <NotesEmptyState activeTag={activeTag} />
        ) : (
          <div className={`${styles.grid} ${layoutStyles.gridWithDivider}`}>
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
      </main>
    </div>
  );
}
