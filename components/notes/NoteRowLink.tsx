"use client";

import { ADMIN_TABLE_COLUMN_TEMPLATE } from "@/components/admin/tableColumns";
import { ROADMAP_STATUS_OPTIONS } from "@/components/roadmap/roadmapStyles";
import { RoadmapStatusBadge } from "@/components/shared/RoadmapStatusBadge";
import type { Page } from "@/types/pages";
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
  note: Page;
  isLast: boolean;
};

export function NoteRowLink({ note, isLast }: Props) {
  const roadmapStatusOption = ROADMAP_STATUS_OPTIONS.find(
    (option) => option.value === note.roadmap_item_status
  );
  const rowLinkColumnTemplate = ADMIN_TABLE_COLUMN_TEMPLATE.split(" ").slice(0, -1).join(" ");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: ADMIN_TABLE_COLUMN_TEMPLATE,
        gap: "16px",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        background: "transparent",
      }}
    >
      <Link
        href={`/admin/editor/${note.id}`}
        style={{
          display: "grid",
          gridTemplateColumns: rowLinkColumnTemplate,
          gap: "16px",
          alignItems: "center",
          gridColumn: "1 / 6",
          minWidth: 0,
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
        {roadmapStatusOption ? (
          <RoadmapStatusBadge statusLabel={roadmapStatusOption.label} />
        ) : (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              justifySelf: "start",
            }}
          >
            —
          </span>
        )}

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
      </Link>
      {/* Delete */}
      <div
        style={{
          gridColumn: "6 / 7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DeleteNoteButton id={note.id} />
      </div>
    </div>
  );
}
