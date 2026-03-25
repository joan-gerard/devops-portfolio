import { PublicContentCard } from "@/components/public/PublicContentCard";
import { ROADMAP_STATUS_LABEL } from "@/components/roadmap/roadmapStyles";
import type { FeaturedProject } from "@/types/home";
import { HomeSection } from "./HomeSection";

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
        <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {projects.map((project) => (
            <PublicContentCard
              key={project.id}
              href={`/projects/${project.slug}`}
              ariaLabel={`Open project ${project.title}`}
              title={project.title}
              roadmapStatus={
                project.roadmap_item_status
                  ? ROADMAP_STATUS_LABEL[project.roadmap_item_status]
                  : "Not linked"
              }
              summary={project.summary?.trim() || "Summary coming soon."}
              chips={project.tech_stack}
              updatedAt={project.updated_at}
              hasGithubUrl={Boolean(project.github_url)}
              hasLiveUrl={Boolean(project.live_url)}
              testId="project-card"
            />
          ))}
        </div>
      ) : null}
    </HomeSection>
  );
}
