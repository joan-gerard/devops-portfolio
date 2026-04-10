"use client";

import type { CSSProperties } from "react";

type RoadmapStatusBadgeProps = {
  statusLabel: string;
  style?: CSSProperties;
};

function getBadgeColors(normalizedStatus: string): CSSProperties {
  if (normalizedStatus === "completed") {
    return {
      border: "0.5px solid var(--accent)",
      background: "var(--accent)",
      color: "var(--accent-contrast)",
    };
  }

  if (normalizedStatus === "in progress") {
    return {
      border: "0.5px solid var(--text)",
      background: "transparent",
      color: "var(--text)",
    };
  }

  return {
    border: "0.5px solid var(--text-muted)",
    background: "transparent",
    color: "var(--text-muted)",
  };
}

function normalizeStatusLabel(statusLabel: string): string {
  const normalized = statusLabel.trim().toLowerCase();
  return normalized === "not linked" ? "not started" : normalized;
}

export function RoadmapStatusBadge({ statusLabel, style }: RoadmapStatusBadgeProps) {
  const normalizedStatus = normalizeStatusLabel(statusLabel);
  const displayLabel = normalizedStatus === "not started" ? "Not started" : statusLabel;

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        padding: "4px 10px",
        borderRadius: "99px",
        whiteSpace: "nowrap",
        ...getBadgeColors(normalizedStatus),
        ...style,
      }}
    >
      {displayLabel}
    </span>
  );
}
