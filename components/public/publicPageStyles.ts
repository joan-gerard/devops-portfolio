/**
 * Unified design tokens for public-facing pages (home, projects, notes, about).
 * Single source for label, heading, tag, card, link, and empty-state styles
 * so the public look stays consistent and changes happen in one place.
 */

import type { CSSProperties } from "react";

// —— Label (small uppercase mono accent) —————————————————————————————————————
const labelBase: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
};

/** Section label (e.g. "Recent Notes") — used by HomeSection. */
export const sectionLabelStyle: CSSProperties = {
  ...labelBase,
  marginBottom: "16px",
};

/** Page header label (e.g. "Projects") — used by PageHeader. */
export const pageHeaderLabelStyle: CSSProperties = {
  ...labelBase,
  marginBottom: "12px",
};

// —— Headings ———————————————————————————————————————————————————————————————
/** Section heading (e.g. "What I've been writing") — used by HomeSection. */
export const sectionHeadingStyle: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "20px",
  fontWeight: "700",
  color: "var(--text)",
  marginBottom: "24px",
};

/** Page header heading (e.g. "Projects") — used by PageHeader. */
export const pageHeaderHeadingStyle: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "32px",
  fontWeight: "800",
  color: "var(--text)",
  marginBottom: "12px",
  letterSpacing: "-0.02em",
};

/** Page header description — used by PageHeader. */
export const pageHeaderDescriptionStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-dim)",
  maxWidth: "480px",
  lineHeight: 1.7,
};

// —— Cards —————————————————————————————————————————————————────────────────—
const cardBase: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
};

/** Card for section content (e.g. NoteCard). */
export const cardSectionStyle: CSSProperties = {
  ...cardBase,
  padding: "20px",
};

// —— Link row and base (card actions) ———————————————————————————————————————
export const linkRowStyle: CSSProperties = {
  display: "flex",
  gap: "16px",
  marginTop: "auto",
  paddingTop: "4px",
};

export const linkBaseStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  textDecoration: "none",
};

/** Pill-style external link (bordered, rounded). Used with tone to set border/hover. */
export const linkPillStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  textDecoration: "none",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "8px 16px",
  transition: "border-color 0.15s, color 0.15s",
};

// —— Empty state —————————————————————————————————————————————————────────——
/** Muted text for empty messages (HomeSection, EmptyState). */
export const emptyMessageStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
};

/** Wrapper for empty-state blocks (centered, padding) — used by EmptyState. */
export const emptyStateWrapperStyle: CSSProperties = {
  padding: "64px 0",
  textAlign: "center",
};
