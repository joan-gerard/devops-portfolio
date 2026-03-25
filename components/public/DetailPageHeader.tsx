import type { CSSProperties } from "react";
import { Chip } from "../shared/Chip";

/**
 * Shared style constants for detail page headers (label, title, metadata area).
 * Keeps Note and Project detail headers consistent.
 */
export const detailPageHeaderLabelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "14px",
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "12px",
};

export const detailPageHeaderTitleStyle: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "48px",
  fontWeight: "500",
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
  tags: string[];
  updatedAt: string;
};

/**
 * Shared header for detail pages: small uppercase label, main title, optional metadata row.
 * Used by note detail (label "Note", tags + date) and project detail (label "Project", date).
 */
export function DetailPageHeader({ label, title, tags, updatedAt }: DetailPageHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <p style={detailPageHeaderLabelStyle}>{label}</p>
        <p style={detailPageHeaderLabelStyle}>•</p>
        <p style={detailPageHeaderLabelStyle}>{updatedAt}</p>
      </div>
      <h1 style={detailPageHeaderTitleStyle}>{title}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {tags != null && tags.map((tag) => <Chip key={tag} tag={tag} />)}
      </div>
    </div>
  );
}
