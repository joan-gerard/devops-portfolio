import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminShell } from "@/components/dashboard";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { ADMIN_SIDEBAR_COOKIE_NAME, parseSidebarCookie } from "@/lib/adminSidebarStorage";
import packageJson from "@/package.json";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get(ADMIN_SIDEBAR_COOKIE_NAME)?.value;
  const parsedCookie = parseSidebarCookie(cookieRaw);
  const hadCookie = parsedCookie !== null;
  const initialSidebarOpen = parsedCookie ?? true;

  return (
    <AuthSessionProvider session={session}>
      <AdminShell
        appVersion={packageJson.version}
        hadCookie={hadCookie}
        initialSidebarOpen={initialSidebarOpen}
      >
        {children}
      </AdminShell>
    </AuthSessionProvider>
  );
}
