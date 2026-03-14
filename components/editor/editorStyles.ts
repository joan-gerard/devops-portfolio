import type { CSSProperties } from "react";

/** Main title input (large, no border) for the note editor. Editor-specific; other admin form styles live in components/admin/formStyles.ts. */
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
