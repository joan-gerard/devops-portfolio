"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
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

export function AdminRoadmapNode({ data, selected }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const isGroup = item.type === "group";
  const statusStyles = ROADMAP_STATUS_NODE_STYLES[item.status];
  const typeStyles = ROADMAP_TYPE_CONFIG[item.type];
  const borderColor = selected
    ? "var(--text)"
    : isGroup
      ? item.is_group_completed
        ? "var(--accent)"
        : "rgba(148, 163, 184, 0.5)"
      : statusStyles.border;

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0.3 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0.3 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0.3 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0.3 }} />
      <div
        style={{
          ...ROADMAP_NODE_CONTAINER_STYLE,
          background: isGroup ? "var(--surface-2)" : "var(--surface)",
          border: `0.8px solid ${borderColor}`,
          cursor: "grab",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: selected
            ? "0 0 0 1px var(--text), 0 0 14px 2px rgba(248,250,252,0.16)"
            : !isGroup
              ? `0 0 0 1px ${statusStyles.border}`
              : "none",
        }}
      >
        {/* Top row: type left, status icon (+ link) right — hidden for group nodes */}
        {!isGroup && (
          <div
            style={{
              ...ROADMAP_NODE_TYPE_ROW_STYLE,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                ...ROADMAP_NODE_TYPE_BADGE_STYLE,
                background: typeStyles.badgeBg,
                color: typeStyles.badgeColor,
              }}
            >
              {typeStyles.label}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.linked_page_slug && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--accent)",
                    whiteSpace: "nowrap",
                  }}
                >
                  linked ↗
                </span>
              )}
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
            color: "var(--text)",
          }}
        >
          {item.title}
        </div>

        {/* Status icon is shown in the top row (admin matches public layout). */}
      </div>
    </>
  );
}
