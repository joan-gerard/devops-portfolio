"use client";

type NotesFiltersAsideProps = {
  tagCounts: { tag: string; count: number }[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
};

const buttonBase: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  padding: "4px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s, transform 0.15s",
  textAlign: "left",
};

/**
 * Desktop filter panel (left sidebar) for the Notes page.
 */
export function NotesFiltersAside({ tagCounts, activeTag, onTagChange }: NotesFiltersAsideProps) {
  if (tagCounts.length === 0) return null;

  return (
    <div data-testid="notes-filters-aside" style={{}}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          onClick={() => onTagChange(null)}
          aria-pressed={activeTag === null}
          style={{
            ...buttonBase,
            // background: activeTag === null ? "var(--accent)" : "var(--surface-2)",
            color: activeTag === null ? "var(--text)" : "var(--text-muted)",
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
              // background: activeTag === tag ? "var(--accent)" : "var(--surface-2)",
              color: activeTag === tag ? "var(--text)" : "var(--text-muted)",
              textTransform: "lowercase",
            }}
          >
            {tag}
            <span style={{ marginLeft: 6, opacity: 0.85 }}>({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
