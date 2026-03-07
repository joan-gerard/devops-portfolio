/**
 * Shared inline styles for the public projects page.
 * Keeps section label, heading, cards, and tags consistent.
 */

export const pageLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "12px",
};

export const pageHeading: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontSize: "32px",
  fontWeight: "800",
  color: "var(--text)",
  marginBottom: "12px",
  letterSpacing: "-0.02em",
};

export const pageDescription: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-dim)",
  maxWidth: "480px",
  lineHeight: 1.7,
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

export const cardBase: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  transition: "border-color 0.15s",
};

export const emptyState: React.CSSProperties = {
  padding: "64px 0",
  textAlign: "center",
};

export const emptyStateText: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
};

export const linkRow: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  marginTop: "auto",
  paddingTop: "4px",
};

export const linkBase: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  textDecoration: "none",
};
