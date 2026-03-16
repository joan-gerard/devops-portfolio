"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapItemStatus, RoadmapItemType } from "@/types/roadmap";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<
  RoadmapItemStatus,
  {
    border: string;
    labelColor: string;
    iconColor: string;
    dot: string;
    pillBg: string;
    pulse: boolean;
  }
> = {
  not_started: {
    border: "var(--border)",
    labelColor: "var(--text-muted)",
    iconColor: "var(--text)",
    dot: "var(--text-muted)",
    pillBg: "rgba(148, 163, 184, 0.12)",
    pulse: false,
  },
  in_progress: {
    border: "var(--accent-2)",
    labelColor: "var(--text)",
    iconColor: "var(--accent-2)",
    dot: "var(--accent-2)",
    pillBg: "var(--accent-2-dim)",
    pulse: true,
  },
  completed: {
    border: "var(--accent)",
    labelColor: "var(--accent)",
    iconColor: "var(--accent)",
    dot: "var(--accent)",
    pillBg: "var(--accent-dim)",
    pulse: false,
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

export function RoadmapNode({ data }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const router = useRouter();
  const isGroup = item.type === "group";
  const statusStyles = STATUS_STYLES[item.status];
  const typeStyles = TYPE_STYLES[item.type];
  const isClickable = !isGroup && item.status === "completed" && !!item.linked_page_slug;

  function handleClick() {
    if (!isClickable || !item.linked_page_slug) return;
    if (item.type === "project") {
      router.push(`/projects/${item.linked_page_slug}`);
    } else {
      router.push(`/notes/${item.linked_page_slug}`);
    }
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
          background: isGroup ? "var(--surface-2)" : "var(--surface)",
          border: `1.5px solid ${isGroup ? "rgba(148, 163, 184, 0.5)" : statusStyles.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          width: 220,
          cursor: isClickable ? "pointer" : "default",
          position: "relative",
          transition: "border-color 0.2s, box-shadow 0.2s, transform 0.1s",
          boxShadow:
            !isGroup && statusStyles.pulse
              ? `0 0 0 1px ${statusStyles.border}, 0 0 18px 3px var(--accent-2-dim)`
              : !isGroup
                ? `0 0 0 1px ${statusStyles.border}`
                : "none",
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = isGroup
            ? "rgba(148, 163, 184, 0.5)"
            : statusStyles.border;
        }}
      >
        {/* Type then status pills — only for non-group nodes */}
        {!isGroup && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {/* Type badge */}
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
                whiteSpace: "nowrap",
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
              {STATUS_ICON[item.status]}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            color: isGroup ? "var(--text)" : statusStyles.labelColor,
            lineHeight: 1.5,
          }}
        >
          {item.title}
        </div>
      </div>
    </>
  );
}
