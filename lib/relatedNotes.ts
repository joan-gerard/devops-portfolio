import type { PublishedNotePreview, PublicNote } from "@/types/pages";

export function getRelatedNotesByTagOverlap(
  note: PublicNote,
  candidates: PublishedNotePreview[],
  limit: number = 5
): PublishedNotePreview[] {
  if (limit <= 0) return [];

  // If the note has no tags, fall back to the first N candidates.
  if (note.tags.length === 0) return candidates.slice(0, limit);

  const primaryTagSet = new Set(note.tags);

  const scored = candidates
    .map((n) => {
      const sharedCount = n.tags.reduce((acc, t) => (primaryTagSet.has(t) ? acc + 1 : acc), 0);
      return { note: n, sharedCount };
    })
    .filter((x) => x.sharedCount > 0);

  const fallback = candidates.slice(0, limit);
  if (scored.length === 0) return fallback;

  scored.sort(
    (a, b) =>
      b.sharedCount - a.sharedCount ||
      new Date(b.note.updated_at).getTime() - new Date(a.note.updated_at).getTime()
  );

  return scored.slice(0, limit).map((x) => x.note);
}
