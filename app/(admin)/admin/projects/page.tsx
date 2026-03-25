import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ADMIN_TABLE_COLUMN_TEMPLATE } from "@/components/admin/tableColumns";
import { CreateEntityButton } from "@/components/shared/CreateEntityButton";
import { ProjectRow } from "@/components/projects";
import { getAllProjects } from "@/lib/queries/project";
import type { Project } from "@/types/projects";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const projects = await getAllProjects();
  const userProjects = projects.filter((project) => !project.e2e_only);
  const e2eProjects = projects.filter((project) => project.e2e_only);

  const publishedCount = userProjects.filter((p) => p.published).length;
  const unpublishedCount = userProjects.length - publishedCount;

  function renderProjectsTable(list: Project[]) {
    if (list.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            border: "1px dashed var(--border)",
            borderRadius: "6px",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            No projects yet
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: ADMIN_TABLE_COLUMN_TEMPLATE,
            gap: "16px",
            padding: "10px 16px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ textAlign: "left" }}>Publish</span>
          <span>Title</span>
          <span style={{ textAlign: "left" }}>Stack</span>
          <span style={{ textAlign: "left" }}>Roadmap</span>
          <span style={{ textAlign: "left" }}>Updated</span>
          <span aria-hidden />
        </div>

        {list.map((project, i) => (
          <ProjectRow key={project.id} project={project} isLast={i === list.length - 1} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <section aria-label="Your projects">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {unpublishedCount} unpublished
            </span>
            <span style={{ fontSize: "12px", color: "var(--accent)" }}>
              {publishedCount} published
            </span>
          </div>
          <CreateEntityButton
            apiPath="/api/projects"
            defaultTitle="Untitled Project"
            redirectPathPrefix="/admin/projects"
            buttonLabel="+ New project"
            errorMessage="Failed to create project"
          />
        </div>

        {renderProjectsTable(userProjects)}
      </section>

      {e2eProjects.length > 0 && (
        <section aria-label="E2E test projects">
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            E2E test projects (created by automated tests)
          </div>
          {renderProjectsTable(e2eProjects)}
        </section>
      )}
    </div>
  );
}
