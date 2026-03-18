import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminDashboardOverview } from "@/components/dashboard";
import sql from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/admin/login");

  const [
    [{ notesPublished, notesUnpublished }],
    [{ projectsPublished, projectsUnpublished }],
    [{ count: mediaCount }],
    [{ roadmapCompletedLearning, roadmapCompletedProject }],
  ] = await Promise.all([
    sql`SELECT
        COUNT(*) FILTER (WHERE published = true)::int AS "notesPublished",
        COUNT(*) FILTER (WHERE published = false)::int AS "notesUnpublished"
      FROM pages`,
    sql`SELECT
        COUNT(*) FILTER (WHERE published = true)::int AS "projectsPublished",
        COUNT(*) FILTER (WHERE published = false)::int AS "projectsUnpublished"
      FROM projects`,
    sql`SELECT COUNT(*) FROM media`,
    sql`SELECT
        COUNT(*) FILTER (WHERE status = 'completed' AND type = 'learning')::int AS "roadmapCompletedLearning",
        COUNT(*) FILTER (WHERE status = 'completed' AND type = 'project')::int AS "roadmapCompletedProject"
      FROM roadmap_items`,
  ]);

  return (
    <AdminDashboardOverview
      userEmail={session.user?.email}
      notesPublished={Number(notesPublished)}
      notesUnpublished={Number(notesUnpublished)}
      projectsPublished={Number(projectsPublished)}
      projectsUnpublished={Number(projectsUnpublished)}
      mediaCount={Number(mediaCount)}
      roadmapCompletedLearning={Number(roadmapCompletedLearning)}
      roadmapCompletedProject={Number(roadmapCompletedProject)}
    />
  );
}
