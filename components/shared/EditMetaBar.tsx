"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { publishButtonStyle } from "@/components/admin/formStyles";

export type EditMetaBarProps = {
  backHref: string;
  backLabel: string;
  saveStatus: string;
  statusColor: string;
  statusLabel: string;
  published: boolean;
  onTogglePublished: () => void;
  /** Delete button or link (e.g. DeleteNoteButton or DeleteProjectButton). */
  deleteAction: ReactNode;
  /** Bottom margin of the bar. Default "16px". */
  marginBottom?: string;
};

const backLinkStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--text-muted)",
  textDecoration: "none",
  letterSpacing: "0.06em",
};

/**
 * Shared admin edit meta bar: back link, save status, publish toggle, and delete action.
 * Used on note editor and project edit pages; callers pass backHref/backLabel and deleteAction.
 */
export function EditMetaBar({
  backHref,
  backLabel,
  saveStatus,
  statusColor,
  statusLabel,
  published,
  onTogglePublished,
  deleteAction,
  marginBottom = "16px",
}: EditMetaBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom,
      }}
    >
      <Link href={backHref} style={backLinkStyle}>
        {backLabel}
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
        {deleteAction}
      </div>
    </div>
  );
}
