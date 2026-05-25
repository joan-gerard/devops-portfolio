import { PageContainer } from "@/components/public/PageContainer";
import { PageHeader } from "@/components/public/PageHeader";
import { ProjectsGrid } from "@/components/public/projects";
import { getAllPublishedProjects } from "@/lib/queries/project";

export const revalidate = false;

export const metadata = {
  title: "Projects — DevOps Learning Portal",
};

export default async function ProjectsPage() {
  const projects = await getAllPublishedProjects();

  return (
    <PageContainer>
      <PageHeader
        label="Projects"
        heading="What I've been building"
        description="Real projects built while learning DevOps — each one documented from infrastructure decisions to deployment."
      />
      <ProjectsGrid projects={projects} />
    </PageContainer>
  );
}
