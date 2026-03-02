import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminDashboardOverview } from "@/components/dashboard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/admin/login");

  return <AdminDashboardOverview userEmail={session.user?.email} />;
}
