import type { PublishedProject } from "@/lib/queries/project";
import { ProjectCard } from "./ProjectCard";
import { emptyState, emptyStateText } from "./projectStyles";

type ProjectsGridProps = { projects: PublishedProject[] };

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "12px",
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div style={emptyState}>
        <p style={emptyStateText}>No projects published yet — check back soon.</p>
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
