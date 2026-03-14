import { PageHeader } from "@/components/public/PageHeader";
import { ProjectsGrid } from "@/components/public/projects";
import { getAllPublishedProjects } from "@/lib/queries/project";

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
      <PageHeader
        label="Projects"
        heading="What I've been building"
        description="Real projects built while learning DevOps — each one documented from infrastructure decisions to deployment."
      />
      <ProjectsGrid projects={projects} />
    </div>
  );
}
