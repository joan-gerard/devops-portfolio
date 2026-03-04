"use client";

import Link from "next/link";
import DeleteNoteButton from "../notes/DeleteNoteButton";
import { publishButtonStyle } from "./editorStyles";

type EditorMetaBarProps = {
  saveStatus: string;
  noteId: string;
  statusColor: string;
  statusLabel: string;
  published: boolean;
  onTogglePublished: () => void;
};

const backLinkStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--text-muted)",
  textDecoration: "none",
  letterSpacing: "0.06em",
};

export function EditorMetaBar({
  saveStatus,
  noteId,
  statusColor,
  statusLabel,
  published,
  onTogglePublished,
}: EditorMetaBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <Link href="/admin/notes" style={backLinkStyle}>
        ← Notes
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {saveStatus !== "idle" && (
          <span style={{ fontSize: "11px", color: statusColor }}>{statusLabel}</span>
        )}
        <button
          type="button"
          onClick={onTogglePublished}
          style={{
            ...publishButtonStyle,
            background: published ? "var(--accent-dim)" : "var(--surface)",
            color: published ? "var(--accent)" : "var(--text-muted)",
          }}
        >
          {published ? "Published" : "Publish"}
        </button>
        <DeleteNoteButton id={noteId} redirectTo="/admin/notes" />
      </div>
    </div>
  );
}
