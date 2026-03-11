"use client";

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

  return (
    <div style={{ padding: "64px 0", textAlign: "center" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        {message}
      </p>
    </div>
  );
}
