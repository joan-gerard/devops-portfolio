/**
 * Shared inline styles for the public projects page.
 * Page header styles (label, heading, description) live in PageHeader (components/public/PageHeader.tsx).
 * Keeps section cards and tags consistent.
 */

export const tag: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "2px 8px",
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
