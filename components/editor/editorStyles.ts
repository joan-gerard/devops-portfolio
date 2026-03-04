import type { CSSProperties } from "react";

/** Label styling for editor form fields (notes/pages). */
export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "6px",
  fontFamily: "var(--font-mono)",
};

/** Input styling for slug and other editor fields. */
export const inputStyle: CSSProperties = {
  flex: 1,
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

/** Main title input (large, no border) for the editor. */
export const titleInputStyle: CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: "var(--font-syne)",
  fontSize: "32px",
  fontWeight: "800",
  color: "var(--text)",
  letterSpacing: "-0.02em",
  marginBottom: "20px",
  padding: 0,
};
