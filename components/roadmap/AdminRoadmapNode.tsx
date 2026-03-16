"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapItemStatus, RoadmapItemType } from "@/types/roadmap";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const STATUS_STYLES: Record<
  RoadmapItemStatus,
  {
    border: string;
    iconColor: string;
    pillBg: string;
  }
> = {
  not_started: {
    border: "var(--border)",
    iconColor: "var(--text)",
    pillBg: "rgba(148, 163, 184, 0.12)",
  },
  in_progress: {
    border: "var(--accent-2)",
    iconColor: "var(--accent-2)",
    pillBg: "var(--accent-2-dim)",
  },
  completed: {
    border: "var(--accent)",
    iconColor: "var(--accent)",
    pillBg: "var(--accent-dim)",
  },
};

const STATUS_ICON: Record<RoadmapItemStatus, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "✓",
};

const TYPE_STYLES: Record<
  RoadmapItemType,
  {
    label: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  learning: {
    label: "Learning",
    badgeBg: "rgba(56, 189, 248, 0.16)",
    badgeColor: "#38bdf8",
  },
  project: {
    label: "Project",
    badgeBg: "rgba(0, 229, 160, 0.12)",
    badgeColor: "var(--accent)",
  },
  group: {
    label: "Group",
    badgeBg: "rgba(148, 163, 184, 0.16)",
    badgeColor: "var(--text-muted)",
  },
};

export function AdminRoadmapNode({ data, selected }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const isGroup = item.type === "group";
  const statusStyles = STATUS_STYLES[item.status];
  const typeStyles = TYPE_STYLES[item.type];
  const borderColor = selected
    ? "var(--text)"
    : isGroup
      ? "rgba(148, 163, 184, 0.5)"
      : statusStyles.border;

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0.3 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0.3 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0.3 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0.3 }} />
      <div
        style={{
          background: isGroup ? "var(--surface-2)" : "var(--surface)",
          border: `0.8px solid ${borderColor}`,
          borderRadius: 10,
          padding: "10px 14px",
          width: 220,
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: 999,
                background: typeStyles.badgeBg,
                color: typeStyles.badgeColor,
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
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
                {STATUS_ICON[item.status]}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.5,
          }}
        >
          {item.title}
        </div>

        {/* Status icon is shown in the top row (admin matches public layout). */}
      </div>
    </>
  );
}
