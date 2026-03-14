import type { PublishedProject } from "@/lib/queries/project";
import { EmptyState } from "@/components/public/EmptyState";
import { ProjectCard } from "./ProjectCard";

type ProjectsGridProps = { projects: PublishedProject[] };

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
  gap: "12px",
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (projects.length === 0) {
    return <EmptyState message="No projects published yet — check back soon." />;
  }

  return (
    <div style={gridStyle}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
