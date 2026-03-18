"use client";

import { DescriptionIcon, ExternalLinkIcon } from "@/components/icons/indicators";
import {
  ROADMAP_NODE_CONTAINER_STYLE,
  ROADMAP_NODE_TITLE_STYLE,
  ROADMAP_NODE_TYPE_BADGE_STYLE,
  ROADMAP_NODE_TYPE_ROW_STYLE,
  ROADMAP_STATUS_ICON,
  ROADMAP_STATUS_NODE_STYLES,
  ROADMAP_TYPE_CONFIG,
} from "@/components/roadmap/roadmapStyles";
import { ROADMAP_NODE_HANDLE_IDS } from "@/components/roadmap/handles";
import type { RoadmapItemWithSlug } from "@/types/roadmap";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export function RoadmapNode({ data, selected }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const isGroup = item.type === "group";
  const statusStyles = ROADMAP_STATUS_NODE_STYLES[item.status];
  const typeStyles = ROADMAP_TYPE_CONFIG[item.type];
  const isSelected = selected ?? false;
  const hasLinkedPage = !!item.linked_page_slug;
  const hasDescription = (item.description ?? "").trim().length > 0;
  const isClickable = !isGroup && !!item.linked_page_slug;

  function handleClick() {
    // Public roadmap node clicks only toggle selection via React Flow;
    // navigation is handled from the side panel button.
  }

  return (
    <>
      {/* Handle IDs must match AdminRoadmapNode so edges from the editor connect. */}
      <Handle
        type="target"
        position={Position.Top}
        id={ROADMAP_NODE_HANDLE_IDS.top}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={ROADMAP_NODE_HANDLE_IDS.left}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={ROADMAP_NODE_HANDLE_IDS.bottom}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={ROADMAP_NODE_HANDLE_IDS.right}
        style={{ opacity: 0 }}
      />

      <div
        onClick={handleClick}
        style={{
          ...ROADMAP_NODE_CONTAINER_STYLE,
          background: isGroup ? "var(--surface-2)" : "var(--surface)",
          border: `0.8px solid ${
            isGroup
              ? item.is_group_completed
                ? "var(--accent)"
                : "rgba(148, 163, 184, 0.5)"
              : isSelected
                ? "var(--text)"
                : statusStyles.border
          }`,
          cursor: isClickable ? "pointer" : "default",
          boxShadow:
            isSelected && !isGroup
              ? "0 0 0 1px var(--text), 0 0 14px 2px rgba(248,250,252,0.16)"
              : !isGroup && statusStyles.pulse
                ? `0 0 0 1px ${statusStyles.border}, 0 0 18px 3px var(--accent-2-dim)`
                : !isGroup
                  ? `0 0 0 1px ${statusStyles.border}`
                  : "none",
        }}
        onMouseEnter={(e) => {
          if (isClickable && !isSelected) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = isGroup
            ? item.is_group_completed
              ? "var(--accent)"
              : "rgba(148, 163, 184, 0.5)"
            : isSelected
              ? "var(--text)"
              : statusStyles.border;
        }}
      >
        {/* Type then status pills — only for non-group nodes */}
        {!isGroup && (
          <div style={ROADMAP_NODE_TYPE_ROW_STYLE}>
            {/* Type badge */}
            <div
              style={{
                ...ROADMAP_NODE_TYPE_BADGE_STYLE,
                background: typeStyles.badgeBg,
                color: typeStyles.badgeColor,
              }}
            >
              {typeStyles.label}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {hasLinkedPage && (
                <span
                  role="img"
                  aria-label="Linked page added"
                  title="Linked page added"
                  style={{
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <ExternalLinkIcon size={13} />
                </span>
              )}

              {hasDescription && (
                <span
                  role="img"
                  aria-label="Description added"
                  title="Description added"
                  style={{
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <DescriptionIcon size={13} />
                </span>
              )}

              {/* Status icon */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  color: statusStyles.iconColor,
                  lineHeight: 1,
                }}
              >
                {ROADMAP_STATUS_ICON[item.status]}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            ...ROADMAP_NODE_TITLE_STYLE,
            color: isGroup || item.status === "completed" ? "var(--text)" : statusStyles.labelColor,
          }}
        >
          {item.title}
        </div>
      </div>
    </>
  );
}
