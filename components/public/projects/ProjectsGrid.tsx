import type { PublishedProject } from "@/lib/queries/project";
import { EmptyState } from "@/components/public/EmptyState";
import { PublicContentCard } from "@/components/public/PublicContentCard";
import { ROADMAP_STATUS_LABEL } from "@/components/roadmap/roadmapStyles";
import styles from "@/components/public/home/HomeCardsGrid.module.css";

type ProjectsGridProps = { projects: PublishedProject[] };

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (projects.length === 0) {
    return <EmptyState message="No projects published yet — check back soon." />;
  }

  return (
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
          summary={project.summary?.trim() || "Summary coming soon."}
          chips={project.tech_stack}
          updatedAt={project.updated_at}
          hasGithubUrl={Boolean(project.github_url)}
          hasLiveUrl={Boolean(project.live_url)}
          testId="project-card"
        />
      ))}
    </div>
  );
}
