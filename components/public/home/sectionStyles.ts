/**
 * Shared inline styles for public homepage sections.
 * Keeps section label, heading, links, cards, and tags consistent.
 */

export const sectionLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "16px",
};

export const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontSize: "20px",
  fontWeight: "700",
  color: "var(--text)",
  marginBottom: "24px",
};

export const viewAllLink: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "var(--text-muted)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  marginTop: "24px",
};

export const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "20px",
};

export const tag: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "2px 8px",
  textTransform: "lowercase",
};
