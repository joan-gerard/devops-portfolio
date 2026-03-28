import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminShell } from "@/components/dashboard";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import packageJson from "@/package.json";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return (
    <AuthSessionProvider session={session}>
      <AdminShell appVersion={packageJson.version}>{children}</AdminShell>
    </AuthSessionProvider>
  );
}
