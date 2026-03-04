import type { CSSProperties } from "react";

/** Shared input styling for project edit form (admin theme tokens). */
export const inputStyle: CSSProperties = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "9px 12px",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

/** Label styling for project edit form fields. */
export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "6px",
  fontFamily: "var(--font-mono)",
};

/** Secondary action button (e.g. "from title" for slug). */
export const secondaryButtonStyle: CSSProperties = {
  flexShrink: 0,
  padding: "9px 12px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  color: "var(--text-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "border-color 0.15s, color 0.15s",
};

/** Publish toggle button base; extend with published/unpublished colours. */
export const publishButtonStyle: CSSProperties = {
  fontSize: "11px",
  padding: "5px 12px",
  borderRadius: "4px",
  border: "1px solid var(--border)",
  fontFamily: "var(--font-mono)",
  cursor: "pointer",
  transition: "all 0.15s",
};
