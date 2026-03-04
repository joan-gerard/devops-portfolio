"use client";

import type { Project } from "@/types/projects";
import { DeleteProjectButton } from "./DeleteProjectButton";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ProjectRowProps = {
  project: Project;
  isLast: boolean;
};

export function ProjectRow({ project, isLast }: ProjectRowProps) {
  return (
    <a
      href={`/admin/projects/${project.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto auto",
        gap: "16px",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        textDecoration: "none",
        background: "transparent",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Title */}
      <span
        style={{
          fontSize: "13px",
          color: "var(--text)",
          fontWeight: "500",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {project.title}
      </span>

      {/* Tech stack */}
      <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
        {project.tech_stack?.length > 0 ? (
          project.tech_stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "2px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                letterSpacing: "0.06em",
              }}
            >
              {tech}
            </span>
          ))
        ) : (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>—</span>
        )}
      </div>

      {/* Status */}
      <span
        style={{
          fontSize: "10px",
          padding: "2px 8px",
          borderRadius: "2px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: project.published ? "rgba(0, 229, 160, 0.1)" : "var(--surface-2)",
          color: project.published ? "var(--accent)" : "var(--text-muted)",
          border: `1px solid ${project.published ? "rgba(0, 229, 160, 0.2)" : "var(--border)"}`,
          whiteSpace: "nowrap",
        }}
      >
        {project.published ? "Published" : "Draft"}
      </span>

      {/* Updated */}
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {formatDate(project.updated_at)}
      </span>

      {/* Delete */}
      <div onClick={(e) => e.preventDefault()}>
        <DeleteProjectButton id={project.id} />
      </div>
    </a>
  );
}
