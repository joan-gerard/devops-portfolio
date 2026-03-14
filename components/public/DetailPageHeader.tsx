import type { CSSProperties } from "react";
import type { ReactNode } from "react";

/**
 * Shared style constants for detail page headers (label, title, metadata area).
 * Keeps Note and Project detail headers consistent.
 */
export const detailPageHeaderLabelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "12px",
};

export const detailPageHeaderTitleStyle: CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontSize: "32px",
  fontWeight: "800",
  color: "var(--text)",
  marginBottom: "12px",
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
};

export const detailPageHeaderMetadataStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px",
};

export type DetailPageHeaderProps = {
  label: string;
  title: string;
  /** Optional metadata row (e.g. tags + date for notes, "Last updated" for projects). */
  metadata?: ReactNode;
};

/**
 * Shared header for detail pages: small uppercase label, main title, optional metadata row.
 * Used by note detail (label "Note", tags + date) and project detail (label "Project", date).
 */
export function DetailPageHeader({ label, title, metadata }: DetailPageHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p style={detailPageHeaderLabelStyle}>{label}</p>
      <h1 style={detailPageHeaderTitleStyle}>{title}</h1>
      {metadata != null && <div style={detailPageHeaderMetadataStyle}>{metadata}</div>}
    </div>
  );
}
