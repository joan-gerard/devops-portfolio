"use client";

import Link from "next/link";
import type { PublishedNotePreview } from "@/types/pages";

const tagPill: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "2px 8px",
  textTransform: "lowercase",
  cursor: "default",
};

type NotesListItemProps = {
  note: PublishedNotePreview;
};

/**
 * Single note row in the Notes list: title, tags, and updated date.
 */
export function NotesListItem({ note }: NotesListItemProps) {
  return (
    <Link href={`/notes/${note.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          gap: "16px",
        }}
        className="u-border-accent-hover"
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "15px",
              fontWeight: "700",
              color: "var(--text)",
              marginBottom: note.tags.length > 0 ? "8px" : "0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {note.title}
          </p>
          {note.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {note.tags.map((t) => (
                <span key={t} style={tagPill}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {new Date(note.updated_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}
