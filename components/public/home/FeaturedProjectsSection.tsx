import type { FeaturedProject } from "@/types/home";
import { PublicContentCard } from "@/components/public/PublicContentCard";
import { ROADMAP_STATUS_LABEL } from "@/components/roadmap/roadmapStyles";
import { HomeSection } from "./HomeSection";
import styles from "./HomeCardsGrid.module.css";

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
        <div className={styles.grid}>
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
              preview={project.description?.trim() || "Preview coming soon."}
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
