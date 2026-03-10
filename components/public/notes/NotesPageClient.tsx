"use client";

import { useState } from "react";
import type { PublishedNotePreview } from "@/types/pages";
import { NotesEmptyState } from "./NotesEmptyState";
import { NotesListItem } from "./NotesListItem";
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {visible.map((note) => (
            <NotesListItem key={note.id} note={note} />
          ))}
        </div>
      )}
      {activeTag !== null && visible.length > 0 && (
        <NotesResultCount count={visible.length} activeTag={activeTag} />
      )}
    </>
  );
}
