"use client";

import { PageRow } from "@/lib/queries/page";
import Link from "next/link";
import DeleteNoteButton from "./DeleteNoteButton";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  note: PageRow;
  isLast: boolean;
};

export function NoteRowLink({ note, isLast }: Props) {
  return (
    <Link
      href={`/admin/editor/${note.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: "16px",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        textDecoration: "none",
        background: "transparent",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Title */}
      <span
        style={{
          fontSize: "13px",
          color: "var(--text)",
          fontWeight: "500",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {note.title}
      </span>

      {/* Tags */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {note.tags && note.tags.length > 0 ? (
          note.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "2px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                letterSpacing: "0.06em",
              }}
            >
              {tag}
            </span>
          ))
        ) : (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>—</span>
        )}
      </div>

      {/* Status */}
      <span
        style={{
          fontSize: "10px",
          padding: "2px 8px",
          borderRadius: "2px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: note.published ? "rgba(0, 229, 160, 0.1)" : "var(--surface-2)",
          color: note.published ? "var(--accent)" : "var(--text-muted)",
          border: `1px solid ${note.published ? "rgba(0, 229, 160, 0.2)" : "var(--border)"}`,
          whiteSpace: "nowrap",
        }}
      >
        {note.published ? "Published" : "Draft"}
      </span>

      {/* Updated date */}
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {formatDate(note.updated_at)}
      </span>
      {/* Delete */}
      <div onClick={(e) => e.preventDefault()}>
        <DeleteNoteButton id={note.id} />
      </div>
    </Link>
  );
}
