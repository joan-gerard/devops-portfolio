import type { CSSProperties } from "react";

/**
 * Shared label style for admin form fields (editor/notes and project edit).
 * Single source of truth so all admin form labels look consistent.
 */
export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "6px",
  fontFamily: "var(--font-mono)",
};
