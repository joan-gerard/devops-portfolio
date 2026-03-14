import type { CSSProperties } from "react";

/**
 * Shared style constants for public page headers (label, heading, description).
 * Used by PageHeader so Notes and Projects (and future similar pages) stay consistent.
 */
export const pageHeaderLabelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "12px",
};

export const pageHeaderHeadingStyle: CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontSize: "32px",
  fontWeight: "800",
  color: "var(--text)",
  marginBottom: "12px",
  letterSpacing: "-0.02em",
};

export const pageHeaderDescriptionStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-dim)",
  maxWidth: "480px",
  lineHeight: 1.7,
};

export type PageHeaderProps = {
  label: string;
  heading: string;
  description: string;
};

/**
 * Shared header section for public pages: small label, main heading, description.
 * Use for Notes, Projects, and any future similar list/detail pages.
 */
export function PageHeader({ label, heading, description }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <p style={pageHeaderLabelStyle}>{label}</p>
      <h1 style={pageHeaderHeadingStyle}>{heading}</h1>
      <p style={pageHeaderDescriptionStyle}>{description}</p>
    </div>
  );
}
