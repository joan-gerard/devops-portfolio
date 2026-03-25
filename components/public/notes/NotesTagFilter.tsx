"use client";

type NotesTagFilterProps = {
  tagCounts: { tag: string; count: number }[];
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
 * Tag filter bar for the Notes page: "all" plus one button per tag (with counts).
 */
export function NotesTagFilter({ tagCounts, activeTag, onTagChange }: NotesTagFilterProps) {
  if (tagCounts.length === 0) return null;

  return (
    <div
      data-testid="notes-tag-filter"
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
        aria-pressed={activeTag === null}
        style={{
          ...buttonBase,
          background: activeTag === null ? "var(--accent)" : "transparent",
          color: activeTag === null ? "var(--bg)" : "var(--text-muted)",
        }}
      >
        all
      </button>
      {tagCounts.map(({ tag, count }) => (
        <button
          type="button"
          key={tag}
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          aria-pressed={activeTag === tag}
          style={{
            ...buttonBase,
            background: activeTag === tag ? "var(--accent)" : "transparent",
            color: activeTag === tag ? "var(--bg)" : "var(--text-muted)",
            textTransform: "lowercase",
          }}
        >
          {tag}
          <span style={{ marginLeft: 6, opacity: 0.85 }}>({count})</span>
        </button>
      ))}
    </div>
  );
}
