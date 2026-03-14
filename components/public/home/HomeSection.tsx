"use client";

import Link from "next/link";
import {
  sectionHeading,
  sectionLabel,
  viewAllLink,
  emptyMessage as emptyMessageStyle,
} from "./sectionStyles";

export type HomeSectionProps = {
  /** Small uppercase label above the heading (e.g. "Recent Notes"). */
  label: string;
  /** Main section heading (e.g. "What I've been writing"). */
  heading: string;
  /** Shown when children is falsy; keeps layout and "view all" behaviour in one place. */
  emptyMessage?: string;
  /** URL for the "View all" link (e.g. "/notes"). */
  viewAllHref?: string;
  /** Label for the "View all" link (e.g. "All notes →"). */
  viewAllLabel?: string;
  /** Section content (grid, list, etc.). When falsy and emptyMessage is set, emptyMessage is shown. */
  children?: React.ReactNode;
  /** Optional style overrides for the section wrapper (e.g. marginBottom: 0 for TechStack). */
  wrapperStyle?: React.CSSProperties;
};

const defaultWrapperStyle: React.CSSProperties = {
  marginBottom: "72px",
};

/**
 * Shared layout for homepage sections: label, heading, optional empty message or children,
 * and optional "View all" link. Use for RecentNotesSection, FeaturedProjectsSection,
 * TechStackSection, and RoadmapSection so layout and link behaviour stay consistent.
 */
export function HomeSection({
  label,
  heading,
  emptyMessage,
  viewAllHref,
  viewAllLabel,
  children,
  wrapperStyle,
}: HomeSectionProps) {
  const hasContent = children != null && children !== false;
  const showEmpty = !hasContent && emptyMessage != null;
  const sectionStyle: React.CSSProperties = {
    ...defaultWrapperStyle,
    ...wrapperStyle,
  };

  return (
    <section style={sectionStyle}>
      <p style={sectionLabel}>{label}</p>
      <h2 style={sectionHeading}>{heading}</h2>

      {hasContent && children}
      {showEmpty && <p style={emptyMessageStyle}>{emptyMessage}</p>}

      {viewAllHref != null && viewAllLabel != null && (
        <Link href={viewAllHref} style={viewAllLink}>
          {viewAllLabel}
        </Link>
      )}
    </section>
  );
}
