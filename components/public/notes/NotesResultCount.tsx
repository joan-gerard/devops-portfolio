"use client";

type NotesResultCountProps = {
  count: number;
  activeTag: string;
};

/**
 * Shown when a tag filter is active: "X note(s) tagged 'Y'".
 */
export function NotesResultCount({ count, activeTag }: NotesResultCountProps) {
  const label = count === 1 ? "note" : "notes";

  return (
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-muted)",
        marginTop: "16px",
        textAlign: "right",
      }}
    >
      {count} {label} tagged &ldquo;{activeTag}&rdquo;
    </p>
  );
}
