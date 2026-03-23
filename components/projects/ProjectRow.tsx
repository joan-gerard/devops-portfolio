"use client";

import { ADMIN_TABLE_COLUMN_TEMPLATE } from "@/components/admin/tableColumns";
import { ROADMAP_STATUS_OPTIONS } from "@/components/roadmap/roadmapStyles";
import type { Project } from "@/types/projects";
import Link from "next/link";
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
  const roadmapStatusOption = ROADMAP_STATUS_OPTIONS.find(
    (option) => option.value === project.roadmap_item_status
  );
  const roadmapBadgeColor =
    project.roadmap_item_status === "in_progress"
      ? "var(--text-dim)"
      : project.roadmap_item_status === "completed"
        ? "var(--accent)"
        : (roadmapStatusOption?.color ?? "var(--text-muted)");
  const rowLinkColumnTemplate = ADMIN_TABLE_COLUMN_TEMPLATE.split(" ").slice(0, -1).join(" ");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: ADMIN_TABLE_COLUMN_TEMPLATE,
        gap: "16px",
        alignItems: "center",
        // padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        background: "transparent",
      }}
    >
      <Link
        href={`/admin/projects/${project.id}`}
        style={{
          display: "grid",
          gridTemplateColumns: rowLinkColumnTemplate,
          gap: "16px",
          padding: "12px 16px",
          alignItems: "center",
          gridColumn: "1 / 6",
          minWidth: 0,
          textDecoration: "none",
          background: "transparent",
        }}
        className="u-bg-surface-hover"
      >
        {/* Status */}
        <span
          style={{
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "2px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: project.published ? "var(--accent)" : "var(--surface-2)",
            color: project.published ? "#000" : "var(--text-muted)",
            border: `1px solid ${project.published ? "var(--accent)" : "var(--border)"}`,
            whiteSpace: "nowrap",
            justifySelf: "start",
          }}
        >
          {project.published ? "Published" : "Draft"}
        </span>

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
        <div
          style={{ display: "flex", gap: "4px", justifyContent: "flex-start", flexWrap: "wrap" }}
        >
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

        {/* Roadmap */}
        <span
          style={{
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "2px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: roadmapStatusOption ? "var(--surface-2)" : "var(--surface-2)",
            color: roadmapBadgeColor,
            border: `1px solid ${roadmapBadgeColor}`,
            whiteSpace: "nowrap",
            justifySelf: "start",
          }}
        >
          {roadmapStatusOption ? roadmapStatusOption.label : "Not linked"}
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
      </Link>

      {/* Delete */}
      <div style={{ gridColumn: "6 / 7" }}>
        <DeleteProjectButton id={project.id} />
      </div>
    </div>
  );
}
