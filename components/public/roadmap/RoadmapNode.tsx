"use client";

import type { RoadmapItemWithSlug } from "@/types/roadmap";
import {
  ROADMAP_NODE_CONTAINER_STYLE,
  ROADMAP_NODE_TITLE_STYLE,
  ROADMAP_NODE_TYPE_BADGE_STYLE,
  ROADMAP_NODE_TYPE_ROW_STYLE,
  ROADMAP_STATUS_ICON,
  ROADMAP_STATUS_NODE_STYLES,
  ROADMAP_TYPE_CONFIG,
} from "@/components/roadmap/roadmapStyles";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useRouter } from "next/navigation";

export function RoadmapNode({ data, selected }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const router = useRouter();
  const isGroup = item.type === "group";
  const statusStyles = ROADMAP_STATUS_NODE_STYLES[item.status];
  const typeStyles = ROADMAP_TYPE_CONFIG[item.type];
  const isSelected = selected ?? false;
  const isClickable = !isGroup && !!item.linked_page_slug;

  function handleClick() {
    // Public roadmap node clicks only toggle selection via React Flow;
    // navigation is handled from the side panel button.
  }

  return (
    <>
      {/* Handle IDs must match AdminRoadmapNode so edges from the editor connect. */}
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />

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

            {/* Status icon only */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                color: statusStyles.iconColor,
              }}
            >
              {ROADMAP_STATUS_ICON[item.status]}
            </span>
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
