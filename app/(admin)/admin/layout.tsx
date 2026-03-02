import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminHeader from "./dashboard/components/AdminHeader";
import AdminSidebar from "./dashboard/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return (
    <AuthSessionProvider session={session}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <div
          style={{
            marginLeft: "var(--sidebar-width)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <AdminHeader />
          <main
            style={{
              marginTop: "var(--header-height)",
              padding: "32px",
              flex: 1,
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthSessionProvider>
  );
}
