"use client";

import Link from "next/link";
import { cardBase, linkBase, linkRow, tag } from "./projectStyles";

/**
 * Minimal project shape used by ProjectCard.
 * Compatible with PublishedProject (projects page) and FeaturedProject (homepage).
 */
export type ProjectCardProject = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
};

type ProjectCardProps = { project: ProjectCardProject };

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div style={cardBase} className="u-border-accent-hover" data-testid="project-card">
      <div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "16px",
            fontWeight: "700",
            color: "var(--text)",
            marginBottom: "8px",
            lineHeight: 1.3,
          }}
        >
          {project.title}
        </h2>
        {project.description && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              lineHeight: 1.7,
            }}
          >
            {project.description}
          </p>
        )}
      </div>

      {project.tech_stack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {project.tech_stack.map((t) => (
            <span key={t} style={tag}>
              {t}
            </span>
          ))}
        </div>
      )}

      <div style={linkRow}>
        {project.github_url && (
          <a
            href={project.github_url}
            aria-label={`GitHub repository for ${project.title}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkBase }}
            className="u-text-muted-text-hover"
          >
            GitHub →
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            aria-label={`Live demo for ${project.title}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkBase }}
            className="u-text-accent-text-hover"
          >
            Live →
          </a>
        )}
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`Details for ${project.title}`}
          style={{ ...linkBase, marginLeft: "auto" }}
          className="u-text-muted-text-hover"
        >
          Details →
        </Link>
      </div>
    </div>
  );
}
