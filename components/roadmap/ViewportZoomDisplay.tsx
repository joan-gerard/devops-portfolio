"use client";

import { useViewport } from "@xyflow/react";

/**
 * Displays the current React Flow viewport zoom as a percentage.
 * Must be rendered inside a ReactFlow (or ReactFlowProvider) tree.
 * Styled to match the roadmap Controls panel.
 */
export function ViewportZoomDisplay() {
  const { zoom } = useViewport();
  const percent = Math.round(zoom * 100);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        padding: "6px 10px",
      }}
    >
      {percent}%
    </div>
  );
}
