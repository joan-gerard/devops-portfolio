"use client";

import Link from "next/link";
import type { PublishedProject } from "@/lib/queries/project";
import { tag, cardBase, linkRow, linkBase } from "./projectStyles";

type ProjectCardProps = { project: PublishedProject };

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div
      style={cardBase}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
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
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkBase, color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            GitHub →
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkBase, color: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent)")}
          >
            Live →
          </a>
        )}
        <Link
          href={`/projects/${project.slug}`}
          style={{ ...linkBase, color: "var(--text-muted)", marginLeft: "auto" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          Details →
        </Link>
      </div>
    </div>
  );
}
