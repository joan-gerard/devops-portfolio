import { SignOutButton } from "@/components/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/admin/login");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0d0f14",
        padding: "40px",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "1px solid #232838",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                color: "#6b7280",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Signed in as
            </p>
            <p style={{ fontSize: "13px", color: "#00e5a0" }}>{session.user?.email}</p>
          </div>
          <SignOutButton />
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e8eaf0", marginBottom: "8px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          Phase 3 coming next — notes, projects, and the editor.
        </p>
      </div>
    </main>
  );
}
