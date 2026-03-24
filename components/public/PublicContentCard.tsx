"use client";

import { Chip } from "@/components/shared/Chip";
import { RoadmapStatusBadge } from "@/components/shared/RoadmapStatusBadge";
import Link from "next/link";
import { FiExternalLink, FiGithub } from "react-icons/fi";

type PublicContentCardProps = {
  href: string;
  title: string;
  roadmapStatus: string;
  summary: string;
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
  color: "var(--text-muted)",
  // border: "1px solid var(--border)",
  // background: "var(--surface-2)",
  // borderRadius: "4px",
  padding: "4px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const cardContentStyle: React.CSSProperties = {
  border: "0.5px solid var(--border)",
  borderRadius: "6px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  transition: "border-color 0.15s",
};

const topSectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const bottomSectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: "auto",
  gap: "10px",
};

export function PublicContentCard({
  href,
  title,
  roadmapStatus,
  summary,
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
        <div style={topSectionStyle}>
          <RoadmapStatusBadge statusLabel={roadmapStatus} style={{ marginBottom: "10px" }} />

          <h2
            style={{
              fontFamily: "var(--font-heading)",
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
              marginBottom: "10px",
            }}
          >
            {summary}
          </p>
        </div>

        <div style={bottomSectionStyle}>
          {chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {chips.map((chip) => (
                <Chip key={chip} tag={chip} />
              ))}
            </div>
          )}

          <div style={footerRowStyle}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
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
                  <FiGithub size={18} aria-hidden="true" />
                </span>
              )}
              {hasLiveUrl && (
                <span
                  style={iconBadgeStyle}
                  title="Live URL available"
                  aria-label="Live URL available"
                >
                  <FiExternalLink size={18} aria-hidden="true" />
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
