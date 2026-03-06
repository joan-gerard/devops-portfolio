import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreateProjectButton, ProjectRow } from "@/components/projects";
import { getAllProjects } from "@/lib/queries/project";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const projects = await getAllProjects();
  const publishedCount = projects.filter((p) => p.published).length;
  const unpublishedCount = projects.length - publishedCount;

  return (
    <div>
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
        <CreateProjectButton />
      </div>

      {projects.length === 0 && (
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
          <CreateProjectButton />
        </div>
      )}

      {projects.length > 0 && (
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
              gridTemplateColumns: "1fr auto auto auto auto",
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
            <span>Title</span>
            <span>Stack</span>
            <span>Status</span>
            <span>Updated</span>
            <span></span>
          </div>

          {projects.map((project, i) => (
            <ProjectRow key={project.id} project={project} isLast={i === projects.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
