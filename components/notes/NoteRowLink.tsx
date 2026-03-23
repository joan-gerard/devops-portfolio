"use client";

import type { Page } from "@/types/pages";
import Link from "next/link";
import DeleteNoteButton from "./DeleteNoteButton";
import { ROADMAP_STATUS_OPTIONS } from "@/components/roadmap/roadmapStyles";
import { ADMIN_TABLE_COLUMN_TEMPLATE } from "@/components/admin/tableColumns";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  note: Page;
  isLast: boolean;
};

export function NoteRowLink({ note, isLast }: Props) {
  const roadmapStatusOption = ROADMAP_STATUS_OPTIONS.find(
    (option) => option.value === note.roadmap_item_status
  );
  const roadmapBadgeColor =
    note.roadmap_item_status === "in_progress"
      ? "var(--text-dim)"
      : note.roadmap_item_status === "completed"
        ? "var(--accent)"
        : (roadmapStatusOption?.color ?? "var(--text-muted)");

  return (
    <Link
      href={`/admin/editor/${note.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: ADMIN_TABLE_COLUMN_TEMPLATE,
        gap: "16px",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        textDecoration: "none",
        background: "transparent",
      }}
      className="u-bg-surface-hover"
    >
      {/* Status */}
      <span
        style={{
          fontSize: "10px",
          padding: "2px 8px",
          borderRadius: "2px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: note.published ? "var(--accent)" : "var(--surface-2)",
          color: note.published ? "#000" : "var(--text-muted)",
          border: `1px solid ${note.published ? "var(--accent)" : "var(--border)"}`,
          whiteSpace: "nowrap",
          justifySelf: "start",
        }}
      >
        {note.published ? "Published" : "Draft"}
      </span>

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
          justifyContent: "flex-start",
        }}
      >
        {note.tags.length > 0 ? (
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

      {/* Roadmap */}
      <span
        style={{
          fontSize: "10px",
          padding: "2px 8px",
          borderRadius: "2px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: "var(--surface-2)",
          color: roadmapBadgeColor,
          border: `1px solid ${roadmapBadgeColor}`,
          whiteSpace: "nowrap",
          justifySelf: "start",
        }}
      >
        {roadmapStatusOption ? roadmapStatusOption.label : "Not linked"}
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
