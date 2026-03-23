"use client";

import { cardContentStyle, tagStyle } from "@/components/public/publicPageStyles";
import { RoadmapStatusBadge } from "@/components/shared/RoadmapStatusBadge";
import Link from "next/link";

type PublicContentCardProps = {
  href: string;
  title: string;
  roadmapStatus: string;
  preview: string;
  chips: string[];
  updatedAt?: string;
  hasGithubUrl?: boolean;
  hasLiveUrl?: boolean;
  testId?: string;
  ariaLabel?: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const footerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "auto",
};

const iconRowStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const iconBadgeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  borderRadius: "4px",
  padding: "2px 6px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

export function PublicContentCard({
  href,
  title,
  roadmapStatus,
  preview,
  chips,
  updatedAt,
  hasGithubUrl = false,
  hasLiveUrl = false,
  testId,
  ariaLabel,
}: PublicContentCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }} aria-label={ariaLabel}>
      <article
        style={{
          ...cardContentStyle,
          height: "100%",
          cursor: "pointer",
        }}
        className="u-border-accent-hover"
        data-testid={testId}
      >
        <RoadmapStatusBadge statusLabel={roadmapStatus} style={{ marginBottom: "10px" }} />

        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "20px",
            fontWeight: "700",
            color: "var(--text)",
            marginBottom: "8px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            lineHeight: 1.7,
          }}
        >
          {preview}
        </p>

        {chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {chips.map((chip) => (
              <span key={chip} style={tagStyle}>
                {chip}
              </span>
            ))}
          </div>
        )}

        <div style={footerRowStyle}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {updatedAt ? `Updated ${formatDate(updatedAt)}` : "Updated —"}
          </p>

          <div style={iconRowStyle}>
            {hasGithubUrl && (
              <span
                style={iconBadgeStyle}
                title="GitHub URL available"
                aria-label="GitHub URL available"
              >
                GH
              </span>
            )}
            {hasLiveUrl && (
              <span
                style={iconBadgeStyle}
                title="Live URL available"
                aria-label="Live URL available"
              >
                LIVE
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
