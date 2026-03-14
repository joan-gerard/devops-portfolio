"use client";

import { EmptyState } from "@/components/public/EmptyState";

type NotesEmptyStateProps = {
  activeTag: string | null;
};

/**
 * Shown when there are no notes (or no notes for the selected tag).
 */
export function NotesEmptyState({ activeTag }: NotesEmptyStateProps) {
  const message = activeTag
    ? `No notes tagged "${activeTag}".`
    : "No notes published yet — check back soon.";

  return <EmptyState message={message} />;
}
