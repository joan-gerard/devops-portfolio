"use client";

import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<
  string,
  { border: string; labelColor: string; dot: string; pulse: boolean }
> = {
  not_started: {
    border: "var(--border)",
    labelColor: "var(--text-muted)",
    dot: "var(--text-muted)",
    pulse: false,
  },
  in_progress: {
    border: "var(--accent-2)",
    labelColor: "var(--text)",
    dot: "var(--accent-2)",
    pulse: true,
  },
  completed: {
    border: "var(--accent)",
    labelColor: "var(--accent)",
    dot: "var(--accent)",
    pulse: false,
  },
};

export function RoadmapNode({ data }: NodeProps) {
  const item = data as unknown as RoadmapItemWithSlug;
  const router = useRouter();
  const styles = STATUS_STYLES[item.status] ?? STATUS_STYLES.not_started;
  const isClickable = item.status === "completed" && item.linked_page_slug;

  function handleClick() {
    if (isClickable) {
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
          background: "var(--surface)",
          border: `1px solid ${styles.border}`,
          borderRadius: 8,
          padding: "12px 16px",
          minWidth: 160,
          maxWidth: 220,
          cursor: isClickable ? "pointer" : "default",
          position: "relative",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: styles.pulse
            ? `0 0 0 2px var(--accent-2), 0 0 12px 2px var(--accent-2-dim)`
            : "none",
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = styles.border;
        }}
      >
        {/* Status dot */}
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
              background: styles.dot,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: styles.dot,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {item.status.replace("_", " ")}
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
            color: styles.labelColor,
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </div>

        {/* Type badge */}
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {item.type}
        </div>
      </div>
    </>
  );
}
