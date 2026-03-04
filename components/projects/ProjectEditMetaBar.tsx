"use client";

import Link from "next/link";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { publishButtonStyle } from "./projectEditStyles";

type ProjectEditMetaBarProps = {
  saveStatus: string;
  statusColour: string;
  statusLabel: string;
  published: boolean;
  onTogglePublished: () => void;
  projectId: string;
};

const backLinkStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--text-muted)",
  textDecoration: "none",
  letterSpacing: "0.06em",
};

export function ProjectEditMetaBar({
  saveStatus,
  statusColour,
  statusLabel,
  published,
  onTogglePublished,
  projectId,
}: ProjectEditMetaBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "28px",
      }}
    >
      <Link href="/admin/projects" style={backLinkStyle}>
        ← Projects
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {saveStatus !== "idle" && (
          <span style={{ fontSize: "11px", color: statusColour }}>{statusLabel}</span>
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
        <DeleteProjectButton id={projectId} redirectTo="/admin/projects" />
      </div>
    </div>
  );
}
