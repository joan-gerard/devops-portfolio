"use client";

type NotesTagFilterProps = {
  allTags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
};

const buttonBase: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  padding: "3px 10px",
  borderRadius: "4px",
  border: "1px solid var(--border)",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
};

/**
 * Tag filter bar for the Notes page: "all" plus one button per tag.
 */
export function NotesTagFilter({ allTags, activeTag, onTagChange }: NotesTagFilterProps) {
  if (allTags.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "36px",
      }}
    >
      <button
        type="button"
        onClick={() => onTagChange(null)}
        style={{
          ...buttonBase,
          background: activeTag === null ? "var(--accent)" : "transparent",
          color: activeTag === null ? "var(--bg)" : "var(--text-muted)",
        }}
      >
        all
      </button>
      {allTags.map((t) => (
        <button
          type="button"
          key={t}
          onClick={() => onTagChange(activeTag === t ? null : t)}
          style={{
            ...buttonBase,
            background: activeTag === t ? "var(--accent)" : "transparent",
            color: activeTag === t ? "var(--bg)" : "var(--text-muted)",
            textTransform: "lowercase",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
