import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ProjectEditClient } from "@/components/projects";
import { getProjectById } from "@/lib/queries/project";
import { Project } from "@/types/projects";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return <ProjectEditClient project={project as Project} />;
}
