import type { FeaturedProject } from "@/types/home";
import { ProjectCard } from "@/components/public/projects/ProjectCard";
import { HomeSection } from "./HomeSection";

const projectsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
  gap: "12px",
};

type FeaturedProjectsSectionProps = { projects: FeaturedProject[] };

export function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  return (
    <HomeSection
      label="Projects"
      heading="What I've been building"
      emptyMessage="No projects published yet."
      viewAllHref="/projects"
      viewAllLabel="All projects →"
    >
      {projects.length > 0 ? (
        <div style={projectsGridStyle}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : null}
    </HomeSection>
  );
}
