"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const STATUS_COLOR: Record<string, string> = {
  not_started: "var(--text-muted)",
  in_progress: "var(--accent-2)",
  completed: "var(--accent)",
};

export function AdminRoadmapNode({ data, selected }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const color = STATUS_COLOR[item.status] ?? "var(--text-muted)";

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <div
        style={{
          background: "var(--surface)",
          border: `1px solid ${selected ? "var(--accent)" : color}`,
          borderRadius: 8,
          padding: "10px 14px",
          minWidth: 160,
          maxWidth: 220,
          cursor: "grab",
          transition: "border-color 0.15s",
          boxShadow: selected ? `0 0 0 1px var(--accent)` : "none",
        }}
      >
        {/* Status row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: color,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {item.status.replace(/_/g, " ")}
          </span>
          {item.status === "completed" && (
            <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: 11 }}>✓</span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </div>

        {/* Type + link indicator */}
        <div
          style={{
            marginTop: 7,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {item.type}
          </span>
          {item.linked_page_slug && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--accent)",
              }}
            >
              · linked
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}
