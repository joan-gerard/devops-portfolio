import { getAllPublishedProjects } from "@/lib/queries/project";
import { ProjectsPageHeader, ProjectsGrid } from "@/components/public/projects";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — DevOps Learning Portal",
};

const pageContainer: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "48px 24px 80px",
};

export default async function ProjectsPage() {
  const projects = await getAllPublishedProjects();

  return (
    <div style={pageContainer}>
      <ProjectsPageHeader />
      <ProjectsGrid projects={projects} />
    </div>
  );
}
